import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    department: { type: String, required: true, trim: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

export default mongoose.model("Batch", batchSchema);