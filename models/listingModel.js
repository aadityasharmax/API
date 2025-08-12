const mongoose = require("mongoose");
const slugify = require("slugify");

const listingSchema = new mongoose.Schema({
  slug: { type: String, unique: true },
  title: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },

  images: 
  [
    { type: mongoose.Schema.Types.ObjectId,
      ref: "Image" 
    }
  ], 

  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
   isDeleted: {
    type: Boolean,
    default: false
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });


listingSchema.pre("save", async function (next) {
  if (!this.isModified("title")) return next();

  // Create base slug
  let baseSlug = slugify(this.title, { lower: true, strict: true });

  // Ensure uniqueness
  let slug = baseSlug;
  let counter = 1;

  while (await mongoose.models.Listing.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  this.slug = slug;
  next();
});



module.exports = mongoose.model("Listing", listingSchema);
