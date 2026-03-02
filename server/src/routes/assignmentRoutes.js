import { Router } from "express";
import { body } from "express-validator";
import {
  createAssignment,
  deleteAssignment,
  listAssignments,
  updateAssignment
} from "../controllers/assignmentController.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/roleCheck.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", auth, listAssignments);

router.post(
  "/",
  auth,
  roleCheck("department", "admin"),
  upload.array("attachments", 4),
  [
    body("title").notEmpty(),
    body("description").notEmpty(),
    body("subject").notEmpty(),
    body("batch").notEmpty(),
    body("dueDate").isISO8601(),
    body("maxMarks").isNumeric()
  ],
  validate,
  createAssignment
);

router.put(
  "/:id",
  auth,
  roleCheck("department", "admin"),
  upload.array("attachments", 4),
  updateAssignment
);

router.delete("/:id", auth, roleCheck("department", "admin"), deleteAssignment);

export default router;
