import { Router } from "express";
import { auth } from "../middleware/auth.js";
import Batch from "../models/Batch.js";
import Subject from "../models/Subject.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/batches",
  auth,
  asyncHandler(async (req, res) => {
    const query = {};
    if (req.user.role !== "admin") {
      const department = String(req.user.department || "").trim();
      if (!department) {
        return res.json({ batches: [] });
      }

      query.department = department;

      if (req.user.role === "student" && req.user.batch) {
        query._id = req.user.batch;
      }
    }

    const batches = await Batch.find(query).sort({ name: 1 });
    res.json({ batches });
  })
);

router.get(
  "/subjects",
  auth,
  asyncHandler(async (req, res) => {
    const query = {};
    if (req.user.role !== "admin") {
      const department = String(req.user.department || "").trim();
      if (!department) {
        return res.json({ subjects: [] });
      }
      query.department = department;
    }

    const subjects = await Subject.find(query).sort({ name: 1 });
    res.json({ subjects });
  })
);

export default router;
