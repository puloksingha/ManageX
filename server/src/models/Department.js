import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    normalizedName: { type: String, required: true, unique: true, index: true },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

departmentSchema.pre("validate", function (next) {
  const name = String(this.name || "").trim();
  this.name = name;
  this.normalizedName = name.toLowerCase();
  next();
});

export default mongoose.model("Department", departmentSchema);
