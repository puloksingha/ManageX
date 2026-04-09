import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadSingleFile } from "../utils/storage.js";

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
  phone: user.phone,
  createdAt: user.createdAt
});

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password").populate("batch", "name");
  res.json({ user: sanitizeUser(user) });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "department", "bio", "phone"];
  const updates = {};
  for (const key of allowed) {
    if (typeof req.body[key] !== "undefined") updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");

  await AuditLog.create({
    action: "PROFILE_UPDATED",
    performedBy: req.user._id,
    targetEntity: `User:${req.user._id}`
  });

  res.json({ message: "Profile updated", user: sanitizeUser(user) });
});

export const uploadMyAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Avatar file is required");
  }

  const storedAvatar = await uploadSingleFile(req.file, { folder: "avatars" });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl: storedAvatar.url },
    { new: true }
  ).select("-password");

  await AuditLog.create({
    action: "AVATAR_UPDATED",
    performedBy: req.user._id,
    targetEntity: `User:${req.user._id}`
  });

  res.json({ message: "Avatar updated", user: sanitizeUser(user) });
});
