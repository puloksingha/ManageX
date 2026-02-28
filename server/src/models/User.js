import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      required: true,
      default: "student"
    },
    emailVerified: { type: Boolean, default: false },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "", trim: true, maxlength: 300 },
    phone: { type: String, default: "", trim: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
    department: { type: String, trim: true }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
