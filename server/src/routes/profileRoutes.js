import { Router } from "express";
import { body } from "express-validator";
import { auth } from "../middleware/auth.js";
import { avatarUpload } from "../middleware/avatarUpload.js";
import { validate } from "../middleware/validate.js";
import { getMyProfile, updateMyProfile, uploadMyAvatar } from "../controllers/profileController.js";

const router = Router();

router.use(auth);

router.get("/me", getMyProfile);
router.patch(
  "/me",
  [
    body("name").optional().isString().isLength({ min: 2, max: 80 }),
    body("department").optional().isString().isLength({ max: 120 }),
    body("bio").optional().isString().isLength({ max: 300 }),
    body("phone").optional().isString().isLength({ max: 30 })
  ],
  validate,
  updateMyProfile
);
router.post("/me/avatar", avatarUpload.single("avatar"), uploadMyAvatar);

export default router;
