import { createUploadMiddleware } from "./createUploadMiddleware.js";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-zip-compressed"
];

export const upload = createUploadMiddleware({
  allowedMimeTypes,
  errorMessage: "Only JPG, PNG, WEBP, PDF, DOCX, and ZIP files are allowed",
  maxFileSize: 10 * 1024 * 1024
});
