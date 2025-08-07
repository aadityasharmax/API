const mongoose = require('mongoose');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/main_project');

const seedUsers = async () => {
  try {

    // Clear existing users 

    await User.deleteMany(); 


    // Create new users 
    const users = [
      {
        name: 'User',
        email: 'user@example.com',
        phone: '9999999999',
        password: await bcrypt.hash('test123', 10),
        isVerified: false,
        profileImage: "www.image.com"
      },
    ];

    // Insert users in the database collection
    await User.insertMany(users);
    console.log('Users seeded successfully');
    process.exit();
  } 
  
  catch (err) {
    console.error(err);
    process.exit(1);
  }
};


seedUsers();
 