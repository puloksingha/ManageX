import Assignment from "../models/Assignment.js";
import AuditLog from "../models/AuditLog.js";
import Subject from "../models/Subject.js";
import Batch from "../models/Batch.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadManyFiles } from "../utils/storage.js";

const isDepartmentRole = (role) => role === "department" || role === "teacher";

export const createAssignment = asyncHandler(async (req, res) => {
  const subjectDoc = await Subject.findById(req.body.subject).select("department");
  const batchDoc = await Batch.findById(req.body.batch).select("department");

  if (!subjectDoc || !batchDoc) {
    res.status(404);
    throw new Error("Subject or batch not found");
  }

  if (String(subjectDoc.department).trim() !== String(batchDoc.department).trim()) {
    res.status(422);
    throw new Error("Subject and batch must belong to the same department");
  }

  if (isDepartmentRole(req.user.role)) {
    const teacherDepartment = String(req.user.department || "").trim();
    if (!teacherDepartment) {
      res.status(403);
      throw new Error("Department account must have a department configured to create assignments");
    }

    if (String(subjectDoc.department).trim() !== teacherDepartment) {
      res.status(403);
      throw new Error("Department accounts can create assignments only for their own department");
    }
  }

  const uploadedAttachments = await uploadManyFiles(req.files, { folder: "assignments" });
  const attachments = uploadedAttachments.map((file) => file.url);
  const attachmentDetails = uploadedAttachments.map((file) => ({
    url: file.url,
    name: file.name || "",
    type: file.mimeType || "",
    provider: file.provider || ""
  }));

  const assignment = await Assignment.create({
    ...req.body,
    createdBy: req.user._id,
    attachments,
    attachmentDetails
  });

  await AuditLog.create({
    action: "ASSIGNMENT_CREATED",
    performedBy: req.user._id,
    targetEntity: `Assignment:${assignment._id}`
  });

  res.status(201).json({ message: "Assignment created", assignment });
});

export const listAssignments = asyncHandler(async (req, res) => {
  const { subject, batch, status, mine, departmentOnly } = req.query;
  const query = {};
  if (subject) query.subject = subject;
  if (batch) query.batch = batch;
  if (mine === "true" || mine === "1") {
    query.createdBy = req.user._id;
  }

  const applyDepartmentScope = async (department) => {
    if (!department) {
      return false;
    }

    const departmentSubjects = await Subject.find({ department }).select("_id");
    if (!departmentSubjects.length) {
      return false;
    }

    const departmentSubjectIds = departmentSubjects.map((item) => String(item._id));
    if (query.subject) {
      if (!departmentSubjectIds.includes(String(query.subject))) {
        return false;
      }
    } else {
      query.subject = { $in: departmentSubjectIds };
    }

    return true;
  };

  if (req.user.role === "student") {
    if (!req.user.batch) {
      return res.json({ assignments: [] });
    }

    if (query.batch && String(query.batch) !== String(req.user.batch)) {
      return res.json({ assignments: [] });
    }

    query.batch = req.user.batch;
    const ok = await applyDepartmentScope(String(req.user.department || "").trim());
    if (!ok) return res.json({ assignments: [] });
  }

  if (isDepartmentRole(req.user.role)) {
    const ok = await applyDepartmentScope(String(req.user.department || "").trim());
    if (!ok) return res.json({ assignments: [] });
  }

  if (departmentOnly === "true" || departmentOnly === "1") {
    const ok = await applyDepartmentScope(String(req.user.department || "").trim());
    if (!ok) return res.json({ assignments: [] });
  }

  const assignments = await Assignment.find(query)
    .populate("subject", "name department")
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
    throw new Error("Only owner department account or admin can edit this assignment");
  }

  const nextSubjectId = req.body.subject || assignment.subject;
  const nextBatchId = req.body.batch || assignment.batch;
  const [subjectDoc, batchDoc] = await Promise.all([
    Subject.findById(nextSubjectId).select("department"),
    Batch.findById(nextBatchId).select("department")
  ]);

  if (!subjectDoc || !batchDoc) {
    res.status(404);
    throw new Error("Subject or batch not found");
  }

  if (String(subjectDoc.department).trim() !== String(batchDoc.department).trim()) {
    res.status(422);
    throw new Error("Subject and batch must belong to the same department");
  }

  if (isDepartmentRole(req.user.role)) {
    const teacherDepartment = String(req.user.department || "").trim();
    if (!teacherDepartment || String(subjectDoc.department).trim() !== teacherDepartment) {
      res.status(403);
      throw new Error("Department accounts can update assignments only in their own department");
    }
  }

  const nextUploadedAttachments = req.files?.length ? await uploadManyFiles(req.files, { folder: "assignments" }) : null;
  const nextAttachments = nextUploadedAttachments?.length ? nextUploadedAttachments.map((file) => file.url) : assignment.attachments;
  const nextAttachmentDetails = nextUploadedAttachments?.length
    ? nextUploadedAttachments.map((file) => ({
        url: file.url,
        name: file.name || "",
        type: file.mimeType || "",
        provider: file.provider || ""
      }))
    : assignment.attachmentDetails;

  Object.assign(assignment, { ...req.body, attachments: nextAttachments, attachmentDetails: nextAttachmentDetails });
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
    throw new Error("Only owner department account or admin can delete this assignment");
  }

  await assignment.deleteOne();

  await AuditLog.create({
    action: "ASSIGNMENT_DELETED",
    performedBy: req.user._id,
    targetEntity: `Assignment:${assignment._id}`
  });

  res.json({ message: "Assignment deleted" });
});
