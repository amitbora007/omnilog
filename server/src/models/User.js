import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxLength: 300,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'inactive'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, status: 1, createdAt: -1 });

// Format returned JSON to remove internal mongo fields
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.__v;
  return user;
};

const User = mongoose.model('User', UserSchema);

export default User;
