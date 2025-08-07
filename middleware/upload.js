const multer = require('multer');
const path = require('path');

// Set storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    
    cb(null, 'uploads/'); // Folder where images will be saved
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`; 
    cb(null, uniqueName);
  }
});

// File filter (only images)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp' || ext === '.avif' || ext === '.heif') {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, AVIF, WEBP, HEIF files are allowed'), false);
  }
};

// Init upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

module.exports = upload;