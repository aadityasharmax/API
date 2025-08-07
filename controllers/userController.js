const User = require('../models/userModel')
const fs = require('fs');
const path = require('path');


exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      about: user.about,
      profileImage: user.profileImage,
      userType: user.userType,
      isVerified: user.isVerified,
      status : user.status
    });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Update profile module 

exports.updateProfile = async (req, res) => {
  const user = req.user;
  const errors = [];

  const { name, email, address, about, status, isVerified, phone } = req.body;

  // Restrict changes to email, phone, status, isVerified
  if (email) {
    errors.push({ field: 'email', message: 'You are not allowed to update email' });
  }

  if (phone) {
    errors.push({ field: 'phone', message: 'You are not allowed to update phone number' });
  }

  if (isVerified) {
    errors.push({ field: 'isVerified', message: 'You are not allowed to change verification status' });
  }

  if (status) {
    errors.push({ field: 'status', message: 'You are not allowed to update status' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Handle image update
  if (req.file) {
    if (user.profileImage) {
      deleteFile(user.profileImage);
    }
    user.profileImage = req.file.filename;
  }

  // Update allowed fields
  user.name = name || user.name;
  user.address = address || user.address;
  user.about = about || user.about;

  await user.save();
  res.json({ message: 'Profile updated successfully', profileImage: user.profileImage });
};


// Helper function to delete file
const deleteFile = (filename) => {
  const filePath = path.join(__dirname, '../uploads', filename);
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err){
         console.error('Error deleting file:', err.message);
      }
    });
  }
};