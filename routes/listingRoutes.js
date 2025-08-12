const express = require("express");
const router = express.Router();

const {createListing, getAllListings, getListingById, updateListing, deleteListing} = require("../controllers/listingController");
const upload = require("../middleware/upload");
const { requireAuth } = require("../middleware/authMiddleware");
const listingController = require('../controllers/listingController') 



// Post listing data 
router.post("/listings", requireAuth, (req, res) => {
  upload.array("images")(req, res, function (err) {
    if (err) {
      // Multer error message
      return res.status(400).json({ message: err.message });
    }

     if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }
    if (req.files.length > 5) {
      return res.status(400).json({ message: "You can upload a maximum of 5 images." });
    }

    // No error
    createListing(req, res);
  });
});



// Get all listings
router.get("/listings", getAllListings);

// Get listings by slug
router.get("/listings/:slug", listingController.getListingBySlug);


// Update listing data by slug
router.put("/listings/:slug", requireAuth, upload.array("images", 5), listingController.updateListing);

// Delete listing by slug
router.delete("/listings/:slug", requireAuth, listingController.deleteListing);



module.exports = router;
