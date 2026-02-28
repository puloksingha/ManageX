import { Router } from "express";
import { body } from "express-validator";
import {
  createBatch,
  createSubject,
  createUser,
  dashboard,
  deleteUser,
  listAuditLogs,
  listUsers,
  resetPassword,
  updateUser
} from "../controllers/adminController.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/roleCheck.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(auth, roleCheck("admin"));

router.get("/dashboard", dashboard);
router.get("/users", listUsers);
router.post(
  "/users",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password")
      .isLength({ min: 8 })
      .matches(/[A-Z]/)
      .matches(/[a-z]/)
      .matches(/[0-9]/)
      .matches(/[^A-Za-z0-9]/),
    body("role").isIn(["student", "teacher", "admin"]) 
  ],
  validate,
  createUser
);
router.patch("/users/:id", [body("role").optional().isIn(["student", "teacher", "admin"])], validate, updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/reset-password", [body("password").isLength({ min: 8 })], validate, resetPassword);
router.post("/batches", [body("name").notEmpty(), body("department").notEmpty()], validate, createBatch);
router.post("/subjects", [body("name").notEmpty(), body("department").notEmpty()], validate, createSubject);
router.get("/audit-logs", listAuditLogs);

export default router;