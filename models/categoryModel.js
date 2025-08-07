const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    status: {
      type: Number,
      enum: [0, 1], // 0 = inactive, 1 = active
      default: 1,
    },
    image: {
      type: String,
      default: '', // Can be image URL or filename
    },
    parent: {
      type: String,
      ref: 'Category',
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
