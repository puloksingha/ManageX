import Assignment from "../models/Assignment.js";
import AuditLog from "../models/AuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createAssignment = asyncHandler(async (req, res) => {
  const attachments = req.files?.map((file) => `/uploads/${file.filename}`) || [];

  const assignment = await Assignment.create({
    ...req.body,
    createdBy: req.user._id,
    attachments
  });

  await AuditLog.create({
    action: "ASSIGNMENT_CREATED",
    performedBy: req.user._id,
    targetEntity: `Assignment:${assignment._id}`
  });

  res.status(201).json({ message: "Assignment created", assignment });
});

export const listAssignments = asyncHandler(async (req, res) => {
  const { subject, batch, status } = req.query;
  const query = {};
  if (subject) query.subject = subject;
  if (batch) query.batch = batch;

  const assignments = await Assignment.find(query)
    .populate("subject", "name")
    .populate("batch", "name")
    .populate("createdBy", "name email")
    .sort({ dueDate: 1 });

  const now = new Date();
  const mapped = assignments.map((assignment) => ({
    ...assignment.toObject(),
    status: assignment.dueDate < now ? "Overdue" : "Open"
  }));

  const filtered = status ? mapped.filter((item) => item.status === status) : mapped;
  res.json({ assignments: filtered });
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    res.status(404);
    throw new Error("Assignment not found");
  }

  if (String(assignment.createdBy) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only owner teacher or admin can edit this assignment");
  }

  const nextAttachments = req.files?.length
    ? req.files.map((file) => `/uploads/${file.filename}`)
    : assignment.attachments;

  Object.assign(assignment, { ...req.body, attachments: nextAttachments });
  await assignment.save();

  await AuditLog.create({
    action: "ASSIGNMENT_UPDATED",
    performedBy: req.user._id,
    targetEntity: `Assignment:${assignment._id}`
  });

  res.json({ message: "Assignment updated", assignment });
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    res.status(404);
    throw new Error("Assignment not found");
  }

  if (String(assignment.createdBy) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only owner teacher or admin can delete this assignment");
  }

  await assignment.deleteOne();

  await AuditLog.create({
    action: "ASSIGNMENT_DELETED",
    performedBy: req.user._id,
    targetEntity: `Assignment:${assignment._id}`
  });

  res.json({ message: "Assignment deleted" });
});