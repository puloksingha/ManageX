import { createUploadMiddleware } from "./createUploadMiddleware.js";

export const avatarUpload = createUploadMiddleware({
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  errorMessage: "Only JPG, PNG, and WEBP images are allowed",
  maxFileSize: 5 * 1024 * 1024
});
