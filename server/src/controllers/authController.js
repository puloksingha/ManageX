import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import AuditLog from "../models/AuditLog.js";
import EmailVerificationToken from "../models/EmailVerificationToken.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signAccessToken, signRefreshToken } from "../utils/tokens.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/mailer.js";

const msFromExpiry = (exp = "7d") => {
  const match = String(exp).match(/^(\d+)([mhd])$/i);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === "m") return value * 60 * 1000;
  if (unit === "h") return value * 60 * 60 * 1000;
  return value * 24 * 60 * 60 * 1000;
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  batch: user.batch,
  emailVerified: user.emailVerified,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
  phone: user.phone
});

const hashValue = (value) => crypto.createHash("sha256").update(value).digest("hex");

const createVerificationCode = () => String(Math.floor(100000 + Math.random() * 900000));

const issueSessionTokens = async (user, previousRefreshToken) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const hashed = hashValue(refreshToken);

  if (previousRefreshToken) {
    const prevHashed = hashValue(previousRefreshToken);
    await RefreshToken.deleteOne({
      $or: [{ tokenHash: prevHashed }, { token: prevHashed }, { token: previousRefreshToken }]
    });
  }

  await RefreshToken.create({
    user: user._id,
    token: hashed,
    tokenHash: hashed,
    expiresAt: new Date(Date.now() + msFromExpiry(process.env.REFRESH_TOKEN_EXPIRES || "7d"))
  });

  return { accessToken, refreshToken };
};

const sendVerificationCodeForUser = async (user) => {
  const code = createVerificationCode();

  await EmailVerificationToken.deleteMany({ user: user._id });
  await EmailVerificationToken.create({
    user: user._id,
    tokenHash: hashValue(code),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000)
  });

  await sendVerificationEmail({ toEmail: user.email, name: user.name, code });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, department, batch, role } = req.body;
  const normalized = email.toLowerCase();
  const normalizedRole = ["student", "teacher", "admin"].includes(role) ? role : "student";

  const exists = await User.findOne({ email: normalized });
  if (exists) {
    res.status(409);
    throw new Error("Email already exists");
  }

  const user = await User.create({
    name,
    email: normalized,
    password,
    role: normalizedRole,
    department,
    batch,
    emailVerified: false
  });

  await sendVerificationCodeForUser(user);

  await AuditLog.create({
    action: "USER_REGISTERED",
    performedBy: user._id,
    targetEntity: `User:${user._id}`
  });

  res.status(201).json({
    message: "Registration successful. Verify your email to sign in.",
    user: sanitizeUser(user)
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  const normalized = email.toLowerCase();

  const user = await User.findOne({ email: normalized });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const token = await EmailVerificationToken.findOne({ user: user._id }).sort({ createdAt: -1 });
  if (!token || token.expiresAt < new Date()) {
    res.status(400);
    throw new Error("Verification code expired. Request a new code.");
  }

  if (token.tokenHash !== hashValue(String(code))) {
    res.status(400);
    throw new Error("Invalid verification code");
  }

  user.emailVerified = true;
  await user.save();
  await EmailVerificationToken.deleteMany({ user: user._id });

  await AuditLog.create({
    action: "EMAIL_VERIFIED",
    performedBy: user._id,
    targetEntity: `User:${user._id}`
  });

  res.json({ message: "Email verified successfully" });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.emailVerified) {
    return res.json({ message: "Email already verified" });
  }

  await sendVerificationCodeForUser(user);
  res.json({ message: "Verification code sent" });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (!user.emailVerified) {
    res.status(403);
    throw new Error("Please verify your email before logging in");
  }

  const { accessToken, refreshToken } = await issueSessionTokens(user);

  await AuditLog.create({
    action: "USER_LOGIN",
    performedBy: user._id,
    targetEntity: `User:${user._id}`
  });

  res.json({
    message: "Login successful",
    accessToken,
    refreshToken,
    user: sanitizeUser(user)
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400);
    throw new Error("Refresh token is required");
  }

  const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(payload.id);
  if (!user) {
    res.status(401);
    throw new Error("User no longer exists");
  }

  const hashed = hashValue(refreshToken);
  const stored = await RefreshToken.findOne({
    user: user._id,
    $or: [{ tokenHash: hashed }, { token: hashed }, { token: refreshToken }]
  });
  if (!stored) {
    await RefreshToken.deleteMany({ user: user._id });
    res.status(401);
    throw new Error("Refresh token reuse detected. Please login again.");
  }

  const tokens = await issueSessionTokens(user, refreshToken);
  res.json({ ...tokens, user: sanitizeUser(user) });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    const hashed = hashValue(refreshToken);
    await RefreshToken.deleteOne({
      $or: [{ tokenHash: hashed }, { token: hashed }, { token: refreshToken }]
    });
  }

  if (req.user) {
    await AuditLog.create({
      action: "USER_LOGOUT",
      performedBy: req.user._id,
      targetEntity: `User:${req.user._id}`
    });
  }

  res.json({ message: "Logged out" });
});

export const logoutAll = asyncHandler(async (req, res) => {
  await RefreshToken.deleteMany({ user: req.user._id });

  await AuditLog.create({
    action: "USER_LOGOUT_ALL",
    performedBy: req.user._id,
    targetEntity: `User:${req.user._id}`
  });

  res.json({ message: "Logged out from all devices" });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalized = email.toLowerCase();
  const genericResponse = { message: "If the account exists, a reset link has been sent." };

  const user = await User.findOne({ email: normalized });
  if (!user || !user.emailVerified) {
    return res.json(genericResponse);
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  await PasswordResetToken.create({
    user: user._id,
    tokenHash: hashValue(rawToken),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000)
  });

  await sendPasswordResetEmail({ toEmail: user.email, name: user.name, token: rawToken });

  await AuditLog.create({
    action: "PASSWORD_RESET_REQUESTED",
    performedBy: user._id,
    targetEntity: `User:${user._id}`
  });

  return res.json(genericResponse);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, newPassword } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(400);
    throw new Error("Invalid reset request");
  }

  const hashed = hashValue(token);
  const resetDoc = await PasswordResetToken.findOne({
    user: user._id,
    tokenHash: hashed,
    usedAt: { $exists: false },
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!resetDoc) {
    res.status(400);
    throw new Error("Reset token is invalid or expired");
  }

  user.password = newPassword;
  await user.save();

  resetDoc.usedAt = new Date();
  await resetDoc.save();

  await PasswordResetToken.deleteMany({ user: user._id, _id: { $ne: resetDoc._id } });
  await RefreshToken.deleteMany({ user: user._id });

  await AuditLog.create({
    action: "PASSWORD_RESET_COMPLETED",
    performedBy: user._id,
    targetEntity: `User:${user._id}`
  });

  res.json({ message: "Password reset successful. Please login again." });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});
