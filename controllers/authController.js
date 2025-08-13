const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validateEmail = require('../utils/validateEmail');
const BlacklistedToken = require('../models/blacklistedToken');
const path = require('path');

// Register New User


const sendEmail = require("../utils/sendEmail");

exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body;
  const errors = [];

  if (!name || name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required' });
  }

   if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  }

  if (!phone) {
    errors.push({ field: 'phone', message: 'Phone is required' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }


  //  Validate email format
  const result = await validateEmail(email);
  if (!result.valid) {
    return res.status(400).json({ error: `Invalid email: ${result.reason}` });
  }


  //  Check if user with same email or phone already exists
  const userExists = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExists) {
    return res.status(400).json({ error: "Email or phone already exists" });
  }

  //  Hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  
  //  Create new user
  const user = new User({
    name,
    email,
    phone,
    password: hashedPassword 
  });

  
  //  Save user to DB
  await user.save();
  res.status(201).json({ message: "User registered successfully" });
};


//  Login with Email or Phone
exports.login = async (req, res) => {
  const { emailOrPhone, password } = req.body;

  let user;

  //  Check if input is email or phone
  const isEmail = /^\S+@\S+\.\S+$/.test(emailOrPhone);
  if (isEmail) {
    user = await User.findOne({ email: emailOrPhone });
  } 
  else if (!isNaN(emailOrPhone)) {
    user = await User.findOne({ phone: Number(emailOrPhone) });
  }

  //  User not found
  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  //  Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  //  Generate access and refresh tokens
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' }
  );



  //  Save refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

  
  //  Set refresh token in cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'Strict',
    path: '/'
  });


  //  Return access token
  res.json({ message: "Login successful", accessToken });
};

exports.sendVerificationEmail = async (req, res) => {
  try {
    const { userId } = req.body; // frontend will send this

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_EMAIL_SECRET, { expiresIn: "1d" });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    const html = generateVerificationEmail(verifyUrl);

    await sendEmail(
      user.email,
      "Verify Your Email - Dream Hub Africa",
      html
    );
 
    res.json({ message: "Verification email sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verification route 

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(400).json({ error: "Invalid token" });

    if (user.isVerified) {
      return res.status(400).send("Email already verified");;
    }

    user.isVerified = true;
    await user.save();

    res.send("Email verified successfully");
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

//  Refresh Access Token
exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  //  No refresh token
  if (!token) return res.status(401).json({ error: "No refresh token" });

  try {
    //  Verify refresh token
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    //  Find user and match token
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    //  Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    //  Return new token
    res.json({ accessToken: newAccessToken });

  } catch (err) {
    
    //  Token expired or tampered
    return res.status(403).json({ error: "Token expired or invalid" });
  }
};



exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;


  // Always clear the cookie

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    path: '/'
  });

  try {


    // Verify and remove refresh token from user
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        user.refreshToken = '';
        await user.save();
      }
    }

    // Blacklist the access token
    if (accessToken) {
      const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET);
      await BlacklistedToken.create({
        token: accessToken,
        expiresAt: new Date(decodedAccess.exp * 1000) // expire in seconds 
      });
    }

    res.status(200).json({ message: 'Logged out successfully' });

  } catch (err) {
    res.status(403).json({ error: 'Invalid token(s)' });
  }
};

function generateVerificationEmail(verifyUrl) {
  return `
  <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Verification</title>
</head>
<body style="margin:0; padding:0;">
  <table width="100%" bgcolor="#E8B639" cellpadding="0" cellspacing="0" style="height:100vh;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="370" bgcolor="#E8B639" cellpadding="0" cellspacing="0" style="font-family:Arial,Roboto,sans-serif; margin-top:30px; margin-bottom:30px;">
          <!-- Logo and Title -->
          <tr>
            <td align="center" style="padding:20px 20px 12px 20px;">
              <img src="http://localhost:3000/assets/logo/logo-dreamhub.png" alt="DreamHub Africa Logo" width="250" style="vertical-align:middle;">
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td height="30"></td></tr>
          <!-- Verification Icon -->
          <tr>
            <td align="center">
              <img src="http://localhost:3000/assets/logo/email-icon.png" alt="Verified" width="80" style="margin-bottom:20px;">
            </td>
          </tr>
          <!-- Main Content Table -->
          <tr>
            <td>
              <table width="90%" align="center" cellpadding="0" cellspacing="0" style="text-align: center; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                <tr>
                  <td style="padding:25px;">
                    <h2 style="color:#000; font-size:22px; font-weight:600; margin:0; padding:0 0 12px 0;">Verify Your Email Address</h2>
                    <p style="color:#000; font-size:15px; margin:0; padding-bottom:7px;">
                      Thanks for signing up. Please confirm this is your email address by clicking the button below.
                    </p>
                  </td>
                </tr>
                <!-- Verify Email Button -->
                 <tr>
                    <td>&nbsp;</td>
                 </tr>
                <tr>
                  <td align="center" style="padding-bottom:22px;">
                    <a href="#" style="background:#15552e; color:#fff; font-size:18px; font-weight:400; text-decoration:none; border-radius:15px; padding:14px 40px; display:inline-block;">
                      Verify Email
                    </a>
                  </td>
                </tr>
                 <tr>
                    <td>&nbsp;</td>
                 </tr>
                 <tr>
                    <td>&nbsp;</td>
                 </tr>
                 <tr>
                    <td>&nbsp;</td>
                 </tr>
                 <tr>
                    <td>&nbsp;</td>
                 </tr>
                <!-- Expiry Info -->
                <tr>
                  <td align="center" style="color:#000; font-size:13px; padding-bottom:10px;">
                    This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
                  </td>
                </tr>
                <!-- Small Footer -->
                <tr>
                  <td align="center" style="color:#000; font-size:12px; padding-bottom:8px;">
                    You are receiving this email because you registered on DreamHub Africa
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer Spacer -->
          <tr><td height="20"></td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>

  `;
}


