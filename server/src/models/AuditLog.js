import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, trim: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetEntity: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);