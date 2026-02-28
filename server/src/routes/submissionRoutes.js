import { Router } from "express";
import { body } from "express-validator";
import {
  gradeSubmission,
  listSubmissions,
  submitAssignment
} from "../controllers/submissionController.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/roleCheck.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", auth, listSubmissions);

router.post(
  "/",
  auth,
  roleCheck("student"),
  upload.single("file"),
  [body("assignment").notEmpty(), body("notes").optional().isString()],
  validate,
  submitAssignment
);

router.patch(
  "/:id/grade",
  auth,
  roleCheck("teacher", "admin"),
  [body("marks").isNumeric(), body("feedback").optional().isString()],
  validate,
  gradeSubmission
);

export default router;