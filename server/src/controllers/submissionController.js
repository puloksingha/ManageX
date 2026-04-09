import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import AuditLog from "../models/AuditLog.js";
import Subject from "../models/Subject.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadSingleFile } from "../utils/storage.js";

const isDepartmentRole = (role) => role === "department" || role === "teacher";

export const submitAssignment = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Submission file is required");
  }

  const assignment = await Assignment.findById(req.body.assignment)
    .populate("subject", "department")
    .populate("batch", "department");
  if (!assignment) {
    res.status(404);
    throw new Error("Assignment not found");
  }

  const studentDepartment = String(req.user.department || "").trim();
  const assignmentDepartment = String(assignment.subject?.department || "").trim();

  if (req.user.batch && String(assignment.batch?._id || "") !== String(req.user.batch)) {
    res.status(403);
    throw new Error("Students can submit only assignments from their own batch");
  }

  if (studentDepartment && assignmentDepartment && studentDepartment !== assignmentDepartment) {
    res.status(403);
    throw new Error("Students can submit only assignments from their own department");
  }

  const isLate = new Date() > assignment.dueDate;
  const storedFile = await uploadSingleFile(req.file, { folder: "submissions" });

  const submission = await Submission.findOneAndUpdate(
    { assignment: assignment._id, student: req.user._id },
    {
      fileUrl: storedFile.url,
      fileName: storedFile.name || req.file.originalname || "",
      fileType: storedFile.mimeType || req.file.mimetype || "",
      fileProvider: storedFile.provider || "",
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

  if (isDepartmentRole(req.user.role)) {
    const teacherDepartment = String(req.user.department || "").trim();
    if (!teacherDepartment) {
      return res.json({ submissions: [] });
    }

    const departmentSubjects = await Subject.find({ department: teacherDepartment }).select("_id");
    if (!departmentSubjects.length) {
      return res.json({ submissions: [] });
    }

    const departmentAssignments = await Assignment.find({
      subject: { $in: departmentSubjects.map((subject) => subject._id) }
    }).select("_id");

    if (!departmentAssignments.length) {
      return res.json({ submissions: [] });
    }

    query.assignment = { $in: departmentAssignments.map((assignment) => assignment._id) };
  }

  if (req.query.assignment) {
    if (isDepartmentRole(req.user.role)) {
      if (!query.assignment.$in.some((id) => String(id) === String(req.query.assignment))) {
        return res.json({ submissions: [] });
      }
      query.assignment = req.query.assignment;
    } else {
      query.assignment = req.query.assignment;
    }
  }

  const submissions = await Submission.find(query)
    .populate("assignment", "title dueDate maxMarks")
    .populate("student", "name email")
    .sort({ submittedAt: -1 });

  res.json({ submissions });
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const { marks, feedback } = req.body;

  const submission = await Submission.findById(req.params.id).populate({
    path: "assignment",
    populate: { path: "subject", select: "department" }
  });
  if (!submission) {
    res.status(404);
    throw new Error("Submission not found");
  }

  if (isDepartmentRole(req.user.role)) {
    const teacherDepartment = String(req.user.department || "").trim();
    const assignmentDepartment = String(submission.assignment?.subject?.department || "").trim();

    if (!teacherDepartment || teacherDepartment !== assignmentDepartment) {
      res.status(403);
      throw new Error("Department accounts can grade submissions only within their own department");
    }
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
