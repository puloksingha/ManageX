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
    const batches = await Batch.find().sort({ name: 1 });
    res.json({ batches });
  })
);

router.get(
  "/subjects",
  auth,
  asyncHandler(async (req, res) => {
    const subjects = await Subject.find().sort({ name: 1 });
    res.json({ subjects });
  })
);

export default router;