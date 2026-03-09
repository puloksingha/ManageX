import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Batch from "../models/Batch.js";
import Subject from "../models/Subject.js";
import Department from "../models/Department.js";
import AuditLog from "../models/AuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  adminEmail
} from "../utils/adminSecurity.js";

const safeUser =
  "_id name email role department batch approved emailVerified avatarUrl phone bio createdAt updatedAt";

const rolesWithDepartment = new Set(["student", "department", "teacher"]);

const resolveDepartmentName = async (department, { activeOnly = true } = {}) => {
  const trimmed = String(department || "").trim();
  if (!trimmed) return "";

  const query = { normalizedName: trimmed.toLowerCase() };
  if (activeOnly) query.active = true;

  const record = await Department.findOne(query);
  return record?.name || "";
};

export const createUser = asyncHandler(async (req, res) => {
  const role = req.body.role || "student";
  const email = req.body.email.toLowerCase().trim();

  if (role === "admin") {
    res.status(403);
    throw new Error("Creating admin users is disabled");
  }

  if (adminEmail && email === adminEmail) {
    res.status(403);
    throw new Error("Configured admin email is reserved for admin account only");
  }

  let resolvedDepartment = "";
  if (rolesWithDepartment.has(role)) {
    resolvedDepartment = await resolveDepartmentName(req.body.department, { activeOnly: true });
    if (!resolvedDepartment) {
      res.status(400);
      throw new Error("Please select a valid department");
    }
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error("Email already exists");
  }

  const payload = {
    name: req.body.name,
    email,
    password: req.body.password,
    role,
    approved: true,
    department: resolvedDepartment,
    batch: req.body.batch || undefined,
    phone: req.body.phone || "",
    bio: req.body.bio || "",
    avatarUrl: req.body.avatarUrl || "",
    emailVerified: true
  };

  const user = await User.create({
    ...payload
  });

  await AuditLog.create({
    action: "ADMIN_CREATED_USER",
    performedBy: req.user._id,
    targetEntity: `User:${user._id}`
  });

  const created = await User.findById(user._id)
    .select(safeUser)
    .populate("batch", "name department");

  res.status(201).json({ message: "User created", user: created });
});

export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const search = (req.query.search || "").trim();
  const role = (req.query.role || "").trim();
  const excludeAdmin = ["true", "1"].includes(String(req.query.excludeAdmin || "").toLowerCase());

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } }
    ];
  }
  if (role && ["student", "department", "teacher", "admin"].includes(role)) {
    filter.role = role === "department" ? { $in: ["department", "teacher"] } : role;
  } else if (excludeAdmin) {
    filter.role = { $ne: "admin" };
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(safeUser)
      .populate("batch", "name department")
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
  const allowed = ["name", "email", "department", "role", "batch", "approved", "emailVerified", "phone", "bio", "avatarUrl"];
  const updates = {};
  for (const key of allowed) {
    if (typeof req.body[key] !== "undefined") updates[key] = req.body[key];
  }

  const currentUser = await User.findById(req.params.id);
  if (!currentUser) {
    res.status(404);
    throw new Error("User not found");
  }

  if (updates.role === "admin" && currentUser.role !== "admin") {
    res.status(403);
    throw new Error("Promoting users to admin is disabled");
  }

  if (typeof updates.email !== "undefined") {
    updates.email = String(updates.email).toLowerCase().trim();
    const existing = await User.findOne({ email: updates.email, _id: { $ne: currentUser._id } });
    if (existing) {
      res.status(409);
      throw new Error("Email already exists");
    }

    if (currentUser.role === "admin" && adminEmail && updates.email !== adminEmail) {
      res.status(403);
      throw new Error("Admin email must match configured admin email");
    }

    if (currentUser.role !== "admin" && adminEmail && updates.email === adminEmail) {
      res.status(403);
      throw new Error("Configured admin email is reserved for admin account only");
    }
  }

  if (currentUser.role === "admin" && updates.role && updates.role !== "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      res.status(400);
      throw new Error("At least one admin account must remain");
    }
  }

  if (updates.batch === "") {
    updates.batch = null;
  }

  const nextRole = updates.role || currentUser.role;
  const departmentChanged = typeof updates.department !== "undefined";
  const roleChanged = typeof updates.role !== "undefined";

  if (rolesWithDepartment.has(nextRole) && (departmentChanged || roleChanged || !currentUser.department)) {
    const departmentToValidate = departmentChanged ? updates.department : currentUser.department;
    const resolved = await resolveDepartmentName(departmentToValidate, { activeOnly: true });
    if (!resolved) {
      res.status(400);
      throw new Error("Please select a valid department");
    }
    updates.department = resolved;
  }

  if (nextRole === "admin" && roleChanged && !departmentChanged) {
    updates.department = "";
  }

  Object.assign(currentUser, updates);
  await currentUser.save();

  const user = await User.findById(currentUser._id)
    .select(safeUser)
    .populate("batch", "name department");
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

  if (user.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      res.status(400);
      throw new Error("Cannot delete the last admin account");
    }
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

export const createDepartment = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  if (!name) {
    res.status(400);
    throw new Error("Department name is required");
  }

  const existing = await Department.findOne({ normalizedName: name.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error("Department already exists");
  }

  const department = await Department.create({
    name,
    active: typeof req.body.active === "boolean" ? req.body.active : true,
    createdBy: req.user._id
  });

  await AuditLog.create({
    action: "DEPARTMENT_CREATED",
    performedBy: req.user._id,
    targetEntity: `Department:${department._id}`
  });

  res.status(201).json({ message: "Department created", department });
});

export const listDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });

  const enriched = await Promise.all(
    departments.map(async (department) => {
      const [userCount, batchCount, subjectCount] = await Promise.all([
        User.countDocuments({ department: department.name }),
        Batch.countDocuments({ department: department.name }),
        Subject.countDocuments({ department: department.name })
      ]);

      return {
        ...department.toObject(),
        userCount,
        batchCount,
        subjectCount
      };
    })
  );

  res.json({ departments: enriched });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error("Department not found");
  }

  const previousName = department.name;
  const nextName = typeof req.body.name === "undefined" ? previousName : String(req.body.name || "").trim();

  if (!nextName) {
    res.status(400);
    throw new Error("Department name is required");
  }

  if (nextName.toLowerCase() !== previousName.toLowerCase()) {
    const exists = await Department.findOne({
      normalizedName: nextName.toLowerCase(),
      _id: { $ne: department._id }
    });
    if (exists) {
      res.status(409);
      throw new Error("Department already exists");
    }
  }

  department.name = nextName;
  if (typeof req.body.active === "boolean") {
    department.active = req.body.active;
  }
  await department.save();

  if (previousName !== department.name) {
    await Promise.all([
      User.updateMany({ department: previousName }, { $set: { department: department.name } }),
      Batch.updateMany({ department: previousName }, { $set: { department: department.name } }),
      Subject.updateMany({ department: previousName }, { $set: { department: department.name } })
    ]);
  }

  await AuditLog.create({
    action: "DEPARTMENT_UPDATED",
    performedBy: req.user._id,
    targetEntity: `Department:${department._id}`
  });

  res.json({ message: "Department updated", department });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error("Department not found");
  }

  const [userCount, batchCount, subjectCount] = await Promise.all([
    User.countDocuments({ department: department.name }),
    Batch.countDocuments({ department: department.name }),
    Subject.countDocuments({ department: department.name })
  ]);

  if (userCount > 0 || batchCount > 0 || subjectCount > 0) {
    res.status(400);
    throw new Error("Cannot delete department while it is linked to users, batches, or subjects");
  }

  await department.deleteOne();

  await AuditLog.create({
    action: "DEPARTMENT_DELETED",
    performedBy: req.user._id,
    targetEntity: `Department:${req.params.id}`
  });

  res.json({ message: "Department deleted" });
});

export const createBatch = asyncHandler(async (req, res) => {
  const department = await resolveDepartmentName(req.body.department, { activeOnly: true });
  if (!department) {
    res.status(400);
    throw new Error("Please select a valid department");
  }

  const batch = await Batch.create({
    name: req.body.name,
    department
  });
  await AuditLog.create({
    action: "BATCH_CREATED",
    performedBy: req.user._id,
    targetEntity: `Batch:${batch._id}`
  });
  res.status(201).json({ batch });
});

export const listBatches = asyncHandler(async (req, res) => {
  const batches = await Batch.find().sort({ createdAt: -1 });

  const enriched = await Promise.all(
    batches.map(async (batch) => {
      const [studentCount, teacherCount, assignmentCount] = await Promise.all([
        User.countDocuments({ batch: batch._id, role: "student" }),
        User.countDocuments({ batch: batch._id, role: { $in: ["department", "teacher"] } }),
        Assignment.countDocuments({ batch: batch._id })
      ]);

      return {
        ...batch.toObject(),
        studentCount,
        teacherCount,
        assignmentCount
      };
    })
  );

  res.json({ batches: enriched });
});

export const updateBatch = asyncHandler(async (req, res) => {
  const updates = {};
  if (typeof req.body.name !== "undefined") updates.name = req.body.name;
  if (typeof req.body.department !== "undefined") {
    const department = await resolveDepartmentName(req.body.department, { activeOnly: true });
    if (!department) {
      res.status(400);
      throw new Error("Please select a valid department");
    }
    updates.department = department;
  }

  const batch = await Batch.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });

  if (!batch) {
    res.status(404);
    throw new Error("Batch not found");
  }

  await AuditLog.create({
    action: "BATCH_UPDATED",
    performedBy: req.user._id,
    targetEntity: `Batch:${batch._id}`
  });

  res.json({ message: "Batch updated", batch });
});

export const deleteBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);
  if (!batch) {
    res.status(404);
    throw new Error("Batch not found");
  }

  const assignmentCount = await Assignment.countDocuments({ batch: batch._id });
  if (assignmentCount > 0) {
    res.status(400);
    throw new Error("Cannot delete batch while assignments are linked to it");
  }

  await User.updateMany({ batch: batch._id }, { $unset: { batch: 1 } });
  await batch.deleteOne();

  await AuditLog.create({
    action: "BATCH_DELETED",
    performedBy: req.user._id,
    targetEntity: `Batch:${req.params.id}`
  });

  res.json({ message: "Batch deleted" });
});

export const createSubject = asyncHandler(async (req, res) => {
  const department = await resolveDepartmentName(req.body.department, { activeOnly: true });
  if (!department) {
    res.status(400);
    throw new Error("Please select a valid department");
  }

  const subject = await Subject.create({
    name: req.body.name,
    department,
    teacher: req.body.teacher || undefined
  });
  await AuditLog.create({
    action: "SUBJECT_CREATED",
    performedBy: req.user._id,
    targetEntity: `Subject:${subject._id}`
  });
  res.status(201).json({ subject });
});

export const listSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find()
    .populate("teacher", "name email")
    .sort({ createdAt: -1 });

  const enriched = await Promise.all(
    subjects.map(async (subject) => {
      const assignmentCount = await Assignment.countDocuments({ subject: subject._id });
      return {
        ...subject.toObject(),
        assignmentCount
      };
    })
  );

  res.json({ subjects: enriched });
});

export const updateSubject = asyncHandler(async (req, res) => {
  const updates = {};
  if (typeof req.body.name !== "undefined") updates.name = req.body.name;
  if (typeof req.body.department !== "undefined") {
    const department = await resolveDepartmentName(req.body.department, { activeOnly: true });
    if (!department) {
      res.status(400);
      throw new Error("Please select a valid department");
    }
    updates.department = department;
  }
  if (typeof req.body.teacher !== "undefined") updates.teacher = req.body.teacher || null;

  const subject = await Subject.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  }).populate("teacher", "name email");

  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }

  await AuditLog.create({
    action: "SUBJECT_UPDATED",
    performedBy: req.user._id,
    targetEntity: `Subject:${subject._id}`
  });

  res.json({ message: "Subject updated", subject });
});

export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }

  const assignmentCount = await Assignment.countDocuments({ subject: subject._id });
  if (assignmentCount > 0) {
    res.status(400);
    throw new Error("Cannot delete subject while assignments are linked to it");
  }

  await subject.deleteOne();

  await AuditLog.create({
    action: "SUBJECT_DELETED",
    performedBy: req.user._id,
    targetEntity: `Subject:${req.params.id}`
  });

  res.json({ message: "Subject deleted" });
});

export const dashboard = asyncHandler(async (req, res) => {
  const [totalUsers, activeAssignments, overdueSubmissions, teachers, students] = await Promise.all([
    User.countDocuments(),
    Assignment.countDocuments({ dueDate: { $gte: new Date() } }),
    Submission.countDocuments({ status: "Late" }),
    User.countDocuments({ role: { $in: ["department", "teacher"] } }),
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
