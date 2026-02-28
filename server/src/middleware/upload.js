import multer from "multer";
import path from "path";

const allowed = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-zip-compressed"
]);

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
    return cb(new Error("Only PDF, DOCX, and ZIP files are allowed"));
  }
  cb(null, true);
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });