const express = require('express');
const router = express.Router();

// custom modules
const {requireAuth} = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/userController');
const upload = require('../middleware/upload');


// User get profile info route
router.get('/profile', requireAuth, getProfile);


// User put profile info route 
router.put('/profile', requireAuth, upload.single('profileImage'), updateProfile);


module.exports = router;