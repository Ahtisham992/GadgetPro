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
    res.status(401); throw new Error('Invalid email or password');
  }
  if (!user.isVerified) {
    res.status(401); throw new Error('Please verify your email first. Check your inbox for the OTP.');
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    addresses: user.addresses || [],
    token: generateToken(user._id),
  });
});

// @desc    Register a new user — sends OTP
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingVerified = await User.findOne({ email, isVerified: true });
  if (existingVerified) {
    res.status(400); throw new Error('An account with this email already exists.');
  }

  await User.deleteOne({ email, isVerified: false });

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  const hashedOtp = await bcrypt.hash(otp, 10);

  await User.create({ name, email, password, isVerified: false, otp: hashedOtp, otpExpiry });
  await sendOtpEmail(email, otp, name);

  res.status(201).json({ message: 'OTP sent to your email.', email });
});

// @desc    Verify OTP to complete registration
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email, isVerified: false });

  if (!user) { res.status(404); throw new Error('No pending registration found. Please register again.'); }
  if (user.otpExpiry < new Date()) { res.status(400); throw new Error('OTP has expired. Please register again.'); }

  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch) { res.status(400); throw new Error('Invalid OTP. Please check your email and try again.'); }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    addresses: user.addresses || [],
    token: generateToken(user._id),
  });
});

// @desc    Google OAuth — sign in or register via Google ID token
// @route   POST /api/users/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) { res.status(400); throw new Error('No Google credential provided'); }

  // Verify the Google ID token via Google's tokeninfo endpoint (no extra npm needed)
  const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
  if (!tokenInfoRes.ok) { res.status(401); throw new Error('Invalid Google token'); }

  const payload = await tokenInfoRes.json();
  const { email, name, sub: googleId, picture } = payload;

  if (!email) { res.status(400); throw new Error('Could not retrieve email from Google'); }

  // Verify the audience matches our client ID (if set)
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (clientId && payload.aud !== clientId) {
    res.status(401); throw new Error('Token audience mismatch');
  }

  // Find or create user
  let user = await User.findOne({ email });

  if (!user) {
    // New user via Google — auto-verified, random password
    const randomPassword = Math.random().toString(36).slice(-10);
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      password: randomPassword,
      isVerified: true,
      googleId,
      avatar: picture,
    });
  } else if (!user.isVerified) {
    // Existing unverified account — verify it via Google
    user.isVerified = true;
    user.googleId = googleId;
    await user.save();
  } else {
    // Existing verified user — just update googleId if missing
    if (!user.googleId) { user.googleId = googleId; await user.save(); }
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    addresses: user.addresses || [],
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

  if (!updatedUser) { res.status(404); throw new Error('User not found'); }
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

  if (!updatedUser) { res.status(404); throw new Error('User not found'); }
  res.json(updatedUser.addresses);
});

// @desc    Get user profile (including addresses)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    addresses: user.addresses,
  });
});

export { authUser, registerUser, verifyOtp, googleAuth, addAddress, deleteAddress, getUserProfile };