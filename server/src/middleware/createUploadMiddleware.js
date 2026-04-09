import multer from "multer";

export const createUploadMiddleware = ({ allowedMimeTypes, errorMessage, maxFileSize }) => {
  const allowed = new Set(allowedMimeTypes);

  const fileFilter = (req, file, cb) => {
    if (!allowed.has(file.mimetype)) {
      return cb(new Error(errorMessage));
    }

    cb(null, true);
  };

  return multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: maxFileSize }
  });
};
