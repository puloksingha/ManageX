import { Router } from "express";
import { body } from "express-validator";
import {
  createDepartment,
  deleteBatch,
  deleteDepartment,
  deleteSubject,
  createBatch,
  createSubject,
  createUser,
  dashboard,
  deleteUser,
  listBatches,
  listAuditLogs,
  listSubjects,
  listDepartments,
  listUsers,
  resetPassword,
  updateBatch,
  updateDepartment,
  updateSubject,
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
    body("role").isIn(["student", "department", "teacher"]),
    body("adminSecurityKey").optional().isString()
  ],
  validate,
  createUser
);
router.patch(
  "/users/:id",
  [
    body("email").optional().isEmail(),
    body("role").optional().isIn(["student", "department", "teacher"]),
    body("adminSecurityKey").optional().isString()
  ],
  validate,
  updateUser
);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/reset-password", [body("password").isLength({ min: 8 })], validate, resetPassword);
router.get("/departments", listDepartments);
router.post("/departments", [body("name").notEmpty(), body("active").optional().isBoolean()], validate, createDepartment);
router.patch(
  "/departments/:id",
  [body("name").optional().notEmpty(), body("active").optional().isBoolean()],
  validate,
  updateDepartment
);
router.delete("/departments/:id", deleteDepartment);
router.get("/batches", listBatches);
router.post("/batches", [body("name").notEmpty(), body("department").notEmpty()], validate, createBatch);
router.patch("/batches/:id", [body("name").optional().notEmpty(), body("department").optional().notEmpty()], validate, updateBatch);
router.delete("/batches/:id", deleteBatch);
router.get("/subjects", listSubjects);
router.post("/subjects", [body("name").notEmpty(), body("department").notEmpty()], validate, createSubject);
router.patch("/subjects/:id", [body("name").optional().notEmpty(), body("department").optional().notEmpty()], validate, updateSubject);
router.delete("/subjects/:id", deleteSubject);
router.get("/audit-logs", listAuditLogs);

export default router;
