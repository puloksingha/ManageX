import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true },
    notes: { type: String, trim: true, default: "" },
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Pending", "Submitted", "Late", "Graded"],
      default: "Submitted"
    },
    marks: { type: Number, min: 0 },
    feedback: { type: String, trim: true }
  },
  { timestamps: true }
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export default mongoose.model("Submission", submissionSchema);