import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '../utils/emailService.js';
import asyncHandler from 'express-async-handler';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isVerified) {
    res.status(401);
    throw new Error('Please verify your email first. Check your inbox for the OTP.');
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
  });
});

// @desc    Register a new user — sends OTP, does NOT log in immediately
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingVerified = await User.findOne({ email, isVerified: true });
  if (existingVerified) {
    res.status(400);
    throw new Error('An account with this email already exists.');
  }

  // Delete any stale unverified account with the same email
  await User.deleteOne({ email, isVerified: false });

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const hashedOtp = await bcrypt.hash(otp, 10);

  await User.create({ name, email, password, isVerified: false, otp: hashedOtp, otpExpiry });

  // Send OTP email (gracefully skip if no email config)
  await sendOtpEmail(email, otp, name);

  res.status(201).json({ message: 'OTP sent to your email. Please verify to complete registration.', email });
});

// @desc    Verify OTP to complete registration
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email, isVerified: false });

  if (!user) {
    res.status(404);
    throw new Error('No pending registration found for this email. Please register again.');
  }

  if (user.otpExpiry < new Date()) {
    res.status(400);
    throw new Error('OTP has expired. Please register again to get a new code.');
  }

  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch) {
    res.status(400);
    throw new Error('Invalid OTP. Please check your email and try again.');
  }

  // OTP correct — verify the user
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
  });
});

// @desc    Add an address to user profile
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const { label, address, city, postalCode, country, phone } = req.body;
  
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $push: { addresses: { label, address, city, postalCode, country, phone } } },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(201).json(updatedUser.addresses);
});

// @desc    Delete an address from user profile
// @route   DELETE /api/users/addresses/:addrId
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { addresses: { _id: req.params.addrId } } },
    { new: true }
  );

  if (!updatedUser) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(updatedUser.addresses);
});

// @desc    Get user profile (including addresses)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, addresses: user.addresses });
});

export { authUser, registerUser, verifyOtp, addAddress, deleteAddress, getUserProfile };
