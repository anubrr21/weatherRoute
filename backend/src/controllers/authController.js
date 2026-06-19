// backend/src/controllers/authController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * Generate JWT token
 */
const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Send token response
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

/**
 * Register new user
 */
export const register = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return next(new AppError('User with this email or username already exists', 400));
  }
  
  // Create new user
  const user = await User.create({
    username,
    email,
    password
  });
  
  sendTokenResponse(user, 201, res);
});

/**
 * Login user
 */
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  
  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');
  
  // Check if user exists and password is correct
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }
  
  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });
  
  sendTokenResponse(user, 200, res);
});

/**
 * Get current user profile
 */
export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('favoriteLocations')
    .populate('searchHistory');
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

/**
 * Update user profile
 */
export const updateProfile = catchAsync(async (req, res, next) => {
  const { username, preferences } = req.body;
  
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { username, preferences },
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

/**
 * Logout user (client-side token removal)
 */
export const logout = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});