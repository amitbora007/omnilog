import Post from '../models/Post.js';
import { calculateReadingTime, generateExcerpt, normalizeTags } from '../utils/helpers.js';

/**
 * @desc    Get all public posts with optional tag filtering and search
 * @route   GET /api/posts
 * @access  Public
 */
export const getPublicPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const query = { status: 'public' };

    // Tag filter
    if (req.query.tag && req.query.tag.trim().toLowerCase() !== 'all') {
      query.tags = req.query.tag.trim().toLowerCase();
    }

    // Search filter
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { excerpt: searchRegex }, { tags: searchRegex }];
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'displayName firstName lastName image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single post by ID
 * @route   GET /api/posts/:id
 * @access  Public (Private if post is marked private)
 */
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'displayName firstName lastName image bio');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    // If private, only the author or super admin can access
    if (post.status === 'private') {
      const isOwner = req.user && req.user._id.toString() === post.author._id.toString();
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'This post is private and cannot be viewed.',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = async (req, res, next) => {
  try {
    const { title, body, status, tags } = req.body;

    const postTags = normalizeTags(tags);
    const readingTime = calculateReadingTime(body);
    const excerpt = generateExcerpt(body);

    const post = await Post.create({
      title,
      body,
      status: status || 'public',
      tags: postTags,
      excerpt,
      readingTime,
      author: req.user._id,
    });

    await post.populate('author', 'displayName firstName lastName image');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update an existing post
 * @route   PUT /api/posts/:id
 * @access  Private (Owner or Super Admin)
 */
export const updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    // Verify ownership or super admin privilege
    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this post',
      });
    }

    const { title, body, status, tags } = req.body;

    if (title) post.title = title.trim();
    if (body) {
      post.body = body;
      post.excerpt = generateExcerpt(body);
      post.readingTime = calculateReadingTime(body);
    }
    if (status) post.status = status;
    if (tags !== undefined) post.tags = normalizeTags(tags);

    post.updatedAt = Date.now();
    await post.save();
    await post.populate('author', 'displayName firstName lastName image');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a post
 * @route   DELETE /api/posts/:id
 * @access  Private (Owner or Super Admin)
 */
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    // Verify ownership or super admin privilege
    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this post',
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get posts for console (authored by user or all posts for super admin)
 * @route   GET /api/posts/my-posts
 * @access  Private
 */
export const getMyPosts = async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const filter = isAdmin && req.query.scope !== 'mine' ? {} : { author: req.user._id };

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate('author', 'displayName firstName lastName image');

    const totalPosts = posts.length;
    const publicCount = posts.filter((p) => p.status === 'public').length;
    const privateCount = totalPosts - publicCount;

    res.status(200).json({
      success: true,
      count: totalPosts,
      isAdmin,
      scope: isAdmin && req.query.scope !== 'mine' ? 'all' : 'mine',
      stats: {
        total: totalPosts,
        public: publicCount,
        private: privateCount,
      },
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get public posts authored by specific user
 * @route   GET /api/posts/user/:userId
 * @access  Public
 */
export const getUserPublicPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.params.userId, status: 'public' })
      .populate('author', 'displayName firstName lastName image bio')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get list of most popular tags
 * @route   GET /api/posts/tags/popular
 * @access  Public
 */
export const getPopularTags = async (req, res, next) => {
  try {
    const tags = await Post.aggregate([
      { $match: { status: 'public' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, tag: '$_id', count: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: tags,
    });
  } catch (err) {
    next(err);
  }
};
