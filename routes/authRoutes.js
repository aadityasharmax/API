const express = require('express');
const router = express.Router();

// custom modules
const { validationResult } = require("express-validator");
const { registerValidator , loginValidator} = require("../middleware/validators");
const { register, login, logout, refreshToken, verifyEmail, sendVerificationEmail} = require('../controllers/authController');


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

// Verification route 
// router.get("/verify-email/:token", verifyEmail);

router.get("/verify-email/:token", verifyEmail, async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(400).send("Invalid verification link.");

    // Update verification status
    user.isVerified = true;
    await user.save();

    // Redirect or respond
    res.send(" Email verified successfully!");
    // Or:
    // res.redirect(`${process.env.FRONTEND_URL}/email-verified`);
  } catch (err) {
    console.error(err);
    res.status(400).send("Invalid or expired link.");
  }
});

router.post("/send-verification-email", sendVerificationEmail);
router.get("/verify-email/:token", verifyEmail);


// Logout route 
router.post('/logout', logout);



module.exports = router;