const jwt = require('jsonwebtoken');
const User = require('../models/User');
const errorHandler = require('./errorHandler.js');

exports.auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return errorHandler(res, 401, 'Access denied. No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return errorHandler(res, 401, 'Invalid token');
    }

    req.user = user;
    next();
  } catch (error) {
    errorHandler(res, 401, 'Invalid token');
  }
};

// Admin role check middleware
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    errorHandler(res, 403, 'Access denied. Admin privileges required');
  }
};