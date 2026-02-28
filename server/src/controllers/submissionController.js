import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import AuditLog from "../models/AuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const submitAssignment = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Submission file is required");
  }

  const assignment = await Assignment.findById(req.body.assignment);
  if (!assignment) {
    res.status(404);
    throw new Error("Assignment not found");
  }

  const isLate = new Date() > assignment.dueDate;

  const submission = await Submission.findOneAndUpdate(
    { assignment: assignment._id, student: req.user._id },
    {
      fileUrl: `/uploads/${req.file.filename}`,
      notes: req.body.notes || "",
      submittedAt: new Date(),
      status: isLate ? "Late" : "Submitted"
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await AuditLog.create({
    action: "ASSIGNMENT_SUBMITTED",
    performedBy: req.user._id,
    targetEntity: `Submission:${submission._id}`
  });

  res.status(201).json({ message: "Submission saved", submission });
});

export const listSubmissions = asyncHandler(async (req, res) => {
  const query = {};

  if (req.user.role === "student") {
    query.student = req.user._id;
  }

  if (req.query.assignment) {
    query.assignment = req.query.assignment;
  }

  const submissions = await Submission.find(query)
    .populate("assignment", "title dueDate maxMarks")
    .populate("student", "name email")
    .sort({ submittedAt: -1 });

  res.json({ submissions });
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const { marks, feedback } = req.body;

  const submission = await Submission.findById(req.params.id).populate("assignment");
  if (!submission) {
    res.status(404);
    throw new Error("Submission not found");
  }

  if (Number(marks) > submission.assignment.maxMarks) {
    res.status(422);
    throw new Error("Marks exceed assignment max marks");
  }

  submission.marks = marks;
  submission.feedback = feedback;
  submission.status = "Graded";
  await submission.save();

  await AuditLog.create({
    action: "SUBMISSION_GRADED",
    performedBy: req.user._id,
    targetEntity: `Submission:${submission._id}`
  });

  res.json({ message: "Submission graded", submission });
});