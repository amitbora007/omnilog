import User from '../models/User.js';
import Post from '../models/Post.js';

/**
 * @desc    Get all users with pagination, filtering, search, and post stats
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    // Role filter
    if (req.query.role && req.query.role.toLowerCase() !== 'all') {
      query.role = req.query.role.toLowerCase();
    }

    // Status filter
    if (req.query.status && req.query.status.toLowerCase() !== 'all') {
      query.status = req.query.status.toLowerCase();
    }

    // Search filter across name or email
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [{ displayName: searchRegex }, { email: searchRegex }];
    }

    // Execute queries concurrently in parallel to minimize database latency
    const [total, users, postStatsAgg, totalUsers, adminCount] = await Promise.all([
      User.countDocuments(query),
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.aggregate([
        {
          $group: {
            _id: '$author',
            total: { $sum: 1 },
            public: {
              $sum: { $cond: [{ $eq: ['$status', 'public'] }, 1, 0] },
            },
            private: {
              $sum: { $cond: [{ $eq: ['$status', 'private'] }, 1, 0] },
            },
          },
        },
      ]),
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
    ]);

    const statsMap = new Map();
    postStatsAgg.forEach((stat) => {
      if (stat._id) {
        statsMap.set(stat._id.toString(), {
          total: stat.total,
          public: stat.public,
          private: stat.private,
        });
      }
    });

    const userCount = totalUsers - adminCount;

    // Attach postStats to each user object
    const usersWithStats = users.map((u) => {
      const uObj = u.toJSON ? u.toJSON() : u.toObject();
      const stats = statsMap.get(u._id.toString()) || { total: 0, public: 0, private: 0 };
      return {
        ...uObj,
        postsCount: stats.total,
        postStats: stats,
      };
    });

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      stats: {
        totalUsers,
        adminCount,
        userCount,
      },
      data: usersWithStats,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single user by ID with their posts
 * @route   GET /api/users/:id
 * @access  Private (Admin only)
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        user,
        posts,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new user manually
 * @route   POST /api/users
 * @access  Private (Admin only)
 */
export const createUser = async (req, res, next) => {
  try {
    const { displayName, email, role = 'user', bio = '', image = '' } = req.body;

    if (!displayName || !displayName.trim()) {
      return res.status(400).json({
        success: false,
        error: 'User display name is required',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'User email is required',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'A user with this email address already exists',
      });
    }

    const nameParts = displayName.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    const user = await User.create({
      googleId: `admin_created_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      displayName: displayName.trim(),
      firstName,
      lastName,
      email: cleanEmail,
      role: role === 'admin' ? 'admin' : 'user',
      status: 'active',
      bio: bio ? bio.trim() : '',
      image: image ? image.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update user profile, role, or status
 * @route   PUT /api/users/:id
 * @access  Private (Admin only)
 */
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const { displayName, email, role, status, bio, image } = req.body;

    // Safety Guard 1: Prevent admin from demoting themselves
    if (
      req.user._id.toString() === user._id.toString() &&
      role !== undefined &&
      role !== 'admin'
    ) {
      return res.status(400).json({
        success: false,
        error: 'You cannot demote your own administrator account.',
      });
    }

    // Safety Guard 2: Prevent admin from suspending themselves
    if (
      req.user._id.toString() === user._id.toString() &&
      status !== undefined &&
      (status === 'suspended' || status === 'inactive')
    ) {
      return res.status(400).json({
        success: false,
        error: 'You cannot suspend your own administrator account.',
      });
    }

    // Safety Guard 3: Prevent demoting the last active administrator
    if (
      user.role === 'admin' &&
      role !== undefined &&
      role !== 'admin'
    ) {
      const activeAdminCount = await User.countDocuments({ role: 'admin', status: 'active' });
      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Cannot demote the last remaining active administrator in the system.',
        });
      }
    }

    // If changing email, ensure it's not taken by another user
    if (email && email.trim().toLowerCase() !== user.email) {
      const emailConflict = await User.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: user._id },
      });
      if (emailConflict) {
        return res.status(400).json({
          success: false,
          error: 'Email is already in use by another account',
        });
      }
      user.email = email.trim().toLowerCase();
    }

    if (displayName) {
      user.displayName = displayName.trim();
      const parts = user.displayName.split(' ');
      user.firstName = parts[0] || user.firstName;
      user.lastName = parts.slice(1).join(' ') || user.lastName;
    }

    if (role !== undefined) user.role = role === 'admin' ? 'admin' : 'user';
    if (status !== undefined) user.status = (status === 'suspended' || status === 'inactive') ? status : 'active';
    if (bio !== undefined) user.bio = bio.trim();
    if (image !== undefined) user.image = image.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete user and cascade delete their publications
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Safety Guard 1: Prevent admin from deleting their own account
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own account.',
      });
    }

    // Safety Guard 2: Prevent deleting the last administrator
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete the last remaining administrator in the system.',
        });
      }
    }

    // Cascade delete their publications
    const deletedPosts = await Post.deleteMany({ author: user._id });

    // Delete user record
    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: `User deleted successfully along with ${deletedPosts.deletedCount} publications.`,
      data: {
        userId: user._id,
        deletedPostsCount: deletedPosts.deletedCount,
      },
    });
  } catch (err) {
    next(err);
  }
};
