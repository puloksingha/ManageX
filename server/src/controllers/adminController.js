import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Batch from "../models/Batch.js";
import Subject from "../models/Subject.js";
import AuditLog from "../models/AuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const safeUser = "name email role department batch emailVerified avatarUrl createdAt";

export const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error("Email already exists");
  }

  const user = await User.create({
    ...req.body,
    email,
    emailVerified: true
  });

  await AuditLog.create({
    action: "ADMIN_CREATED_USER",
    performedBy: req.user._id,
    targetEntity: `User:${user._id}`
  });

  res.status(201).json({ message: "User created", user });
});

export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const search = (req.query.search || "").trim();
  const role = (req.query.role || "").trim();

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } }
    ];
  }
  if (role && ["student", "teacher", "admin"].includes(role)) {
    filter.role = role;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(`-password ${safeUser}`)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter)
  ]);

  res.json({
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1)
    }
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const allowed = ["name", "department", "role", "batch", "emailVerified", "phone", "bio"];
  const updates = {};
  for (const key of allowed) {
    if (typeof req.body[key] !== "undefined") updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select(`-password ${safeUser}`);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await AuditLog.create({
    action: "ADMIN_UPDATED_USER",
    performedBy: req.user._id,
    targetEntity: `User:${user._id}`
  });

  res.json({ message: "User updated", user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.deleteOne();

  await AuditLog.create({
    action: "ADMIN_DELETED_USER",
    performedBy: req.user._id,
    targetEntity: `User:${req.params.id}`
  });

  res.json({ message: "User deleted" });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.password = password;
  await user.save();

  await AuditLog.create({
    action: "ADMIN_RESET_PASSWORD",
    performedBy: req.user._id,
    targetEntity: `User:${user._id}`
  });

  res.json({ message: "Password reset" });
});

export const createBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.create(req.body);
  await AuditLog.create({
    action: "BATCH_CREATED",
    performedBy: req.user._id,
    targetEntity: `Batch:${batch._id}`
  });
  res.status(201).json({ batch });
});

export const createSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.create(req.body);
  await AuditLog.create({
    action: "SUBJECT_CREATED",
    performedBy: req.user._id,
    targetEntity: `Subject:${subject._id}`
  });
  res.status(201).json({ subject });
});

export const dashboard = asyncHandler(async (req, res) => {
  const [totalUsers, activeAssignments, overdueSubmissions, teachers, students] = await Promise.all([
    User.countDocuments(),
    Assignment.countDocuments({ dueDate: { $gte: new Date() } }),
    Submission.countDocuments({ status: "Late" }),
    User.countDocuments({ role: "teacher" }),
    User.countDocuments({ role: "student" })
  ]);

  const submissionRateBySubject = await Submission.aggregate([
    {
      $lookup: {
        from: "assignments",
        localField: "assignment",
        foreignField: "_id",
        as: "assignment"
      }
    },
    { $unwind: "$assignment" },
    {
      $group: {
        _id: "$assignment.subject",
        total: { $sum: 1 },
        avgMarks: { $avg: "$marks" }
      }
    }
  ]);

  res.json({
    totalUsers,
    teachers,
    students,
    activeAssignments,
    overdueSubmissions,
    submissionRateBySubject
  });
});

export const listAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find()
    .populate("performedBy", "name email role")
    .sort({ createdAt: -1 })
    .limit(200);
  res.json({ logs });
});
