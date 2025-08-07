const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validateEmail = require('../utils/validateEmail');
const BlacklistedToken = require('../models/blacklistedToken');

// Register New User

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
    { expiresIn: '15m' }
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
