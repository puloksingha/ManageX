import multer from "multer";
import path from "path";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-").toLowerCase();
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!allowed.has(file.mimetype)) {
    return cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
  }
  cb(null, true);
};

export const avatarUpload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });