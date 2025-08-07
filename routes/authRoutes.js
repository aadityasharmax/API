const express = require('express');
const router = express.Router();

// custom modules
const { validationResult } = require("express-validator");
const { registerValidator , loginValidator} = require("../middleware/validators");
const { register, login, logout } = require('../controllers/authController');
const { refreshToken } = require('../controllers/authController');


const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
       errors: errors.array() 
      });
  }
  next()
};


// Register new user 
router.post('/register', registerValidator, handleValidationErrors, register);

// Login existing user 
router.post('/login', loginValidator, handleValidationErrors, login);

// Generate new access token for valid refresh token 
router.post('/refresh-token', refreshToken);

// Logout route 
router.post('/logout', logout);



module.exports = router;