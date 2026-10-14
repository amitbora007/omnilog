import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a post title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    body: {
      type: String,
      required: [true, 'Please provide post content'],
    },
    excerpt: {
      type: String,
      default: '',
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
    },
    tags: {
      type: [String],
      default: ['general'],
      set: (tags) => {
        if (!Array.isArray(tags)) {
          if (typeof tags === 'string') {
            return tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
          }
          return ['general'];
        }
        return tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
      },
    },
    status: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
      index: true,
    },
    readingTime: {
      type: Number,
      default: 1,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound and text indexes for fast filtering and searching
PostSchema.index({ status: 1, createdAt: -1 });
PostSchema.index({ tags: 1, status: 1 });
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ title: 'text', excerpt: 'text', body: 'text' });

PostSchema.methods.toJSON = function () {
  const post = this.toObject();
  delete post.__v;
  return post;
};

const Post = mongoose.model('Post', PostSchema);

export default Post;
