const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const BlacklistedToken = require('../models/blacklistedToken');

exports.requireAuth = async (req, res, next) => {

  const rawHeader = req.headers.authorization;
  const token = rawHeader?.startsWith('Bearer ')
    ? rawHeader.split(' ')[1]
    : rawHeader;

  if (!token){
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }


  const isBlacklisted = await BlacklistedToken.findOne({ token });
  if (isBlacklisted) {
    return res.status(401).json({ error: "Please provide valid token" });
  }


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password"); 

    if (!user){
       return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    req.user = user; 
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};  