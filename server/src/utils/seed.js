import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Department from "../models/Department.js";

const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
const adminName = (process.env.ADMIN_NAME || "System Admin").trim();
const adminDepartment = "Administration";
const seedDepartments = String(process.env.SEED_DEPARTMENTS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const assertRequiredEnv = () => {
  const missing = [];
  if (!process.env.MONGO_URI) missing.push("MONGO_URI");
  if (!adminEmail) missing.push("ADMIN_EMAIL");
  if (!adminPassword) missing.push("ADMIN_PASSWORD");

  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
};

const upsertDepartment = async (name) => {
  const trimmed = String(name || "").trim();
  if (!trimmed) return null;

  return Department.findOneAndUpdate(
    { normalizedName: trimmed.toLowerCase() },
    { name: trimmed, active: true },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

const ensureSingleAdmin = async () => {
  const adminUsers = await User.find({ role: "admin" }).select("_id email");
  const unexpectedAdmins = adminUsers.filter((user) => user.email !== adminEmail);

  if (unexpectedAdmins.length > 0) {
    throw new Error(
      `Refusing to seed: found non-configured admin accounts: ${unexpectedAdmins
        .map((user) => user.email)
        .join(", ")}`
    );
  }

  const existingConfiguredAdmin = adminUsers.find((user) => user.email === adminEmail);
  if (adminUsers.length > 1) {
    throw new Error("Refusing to seed: multiple admin accounts found.");
  }

  if (existingConfiguredAdmin) {
    const admin = await User.findById(existingConfiguredAdmin._id);
    admin.name = adminName;
    admin.role = "admin";
    admin.department = adminDepartment;
    admin.emailVerified = true;
    await admin.save();
    return { created: false, admin };
  }

  const admin = await User.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: "admin",
    department: adminDepartment,
    emailVerified: true
  });

  return { created: true, admin };
};

const run = async () => {
  try {
    assertRequiredEnv();
    await connectDB();

    const baseDepartments = [adminDepartment, ...seedDepartments];
    const uniqueDepartments = [...new Set(baseDepartments)];
    for (const name of uniqueDepartments) {
      await upsertDepartment(name);
    }

    const adminResult = await ensureSingleAdmin();
    const [users, departments] = await Promise.all([User.countDocuments(), Department.countDocuments()]);

    console.log("");
    console.log("Production bootstrap completed.");
    console.log(`Admin: ${adminResult.admin.email} (${adminResult.created ? "created" : "verified"})`);
    console.log(`Users: ${users}`);
    console.log(`Departments: ${departments}`);
  } catch (error) {
    console.error(error.message || error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    process.exit(process.exitCode || 0);
  }
};

run();
