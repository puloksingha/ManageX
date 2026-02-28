import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, required: true, min: 1 },
    attachments: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model("Assignment", assignmentSchema);