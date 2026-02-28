import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

const seedUsers = [
  {
    name: "System Admin",
    email: "admin@college.edu",
    password: "Admin@123",
    role: "admin",
    department: "Administration",
    emailVerified: true
  },
  {
    name: "Default Teacher",
    email: "teacher@college.edu",
    password: "Teacher@123",
    role: "teacher",
    department: "Computer Science",
    emailVerified: true
  },
  {
    name: "Default Student",
    email: "student@college.edu",
    password: "Student@123",
    role: "student",
    department: "Computer Science",
    emailVerified: true
  }
];

const run = async () => {
  try {
    await connectDB();

    for (const payload of seedUsers) {
      const exists = await User.findOne({ email: payload.email });
      if (!exists) {
        await User.create(payload);
        console.log(`Created: ${payload.email}`);
      } else {
        if (!exists.emailVerified) {
          exists.emailVerified = true;
          await exists.save();
          console.log(`Updated verification: ${payload.email}`);
        }
        console.log(`Skipped: ${payload.email}`);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
