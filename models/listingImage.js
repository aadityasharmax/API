const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  imageUrl: { type: String, }, // Could be a Cloudinary/S3 URL
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Image", imageSchema,'listing_images');
