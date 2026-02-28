import { Router } from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import {
  forgotPassword,
  login,
  logout,
  logoutAll,
  me,
  refresh,
  register,
  resendVerification,
  resetPassword,
  verifyEmail
} from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many login attempts. Try again in 15 minutes."
});

router.post(
  "/register",
  [
    body("name").isString().isLength({ min: 2, max: 80 }).withMessage("Name must be 2-80 characters"),
    body("email").isEmail().withMessage("Enter a valid email").matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).withMessage("Email format is invalid"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must include an uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must include a lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must include a number")
      .matches(/[^A-Za-z0-9]/)
      .withMessage("Password must include a special character"),
    body("role")
      .optional()
      .isIn(["student", "teacher", "admin"])
      .withMessage("Role must be student, teacher, or admin"),
    body("department").optional().isString().isLength({ max: 120 }).withMessage("Department must be up to 120 characters"),
    body("adminSecurityKey").optional().isString().isLength({ min: 4, max: 120 })
  ],
  validate,
  register
);

router.post(
  "/verify-email",
  [body("email").isEmail(), body("code").isLength({ min: 6, max: 6 }).isNumeric()],
  validate,
  verifyEmail
);

router.post("/resend-verification", [body("email").isEmail()], validate, resendVerification);

router.post(
  "/login",
  loginLimiter,
  [body("email").isEmail(), body("password").notEmpty(), body("adminSecurityKey").optional().isString()],
  validate,
  login
);

router.post("/forgot-password", [body("email").isEmail()], validate, forgotPassword);
router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("token").isString().isLength({ min: 20 }),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must include an uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must include a lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must include a number")
      .matches(/[^A-Za-z0-9]/)
      .withMessage("Password must include a special character")
  ],
  validate,
  resetPassword
);

router.post("/refresh", [body("refreshToken").notEmpty()], validate, refresh);
router.post("/logout", auth, logout);
router.post("/logout-all", auth, logoutAll);
router.get("/me", auth, me);

export default router;
