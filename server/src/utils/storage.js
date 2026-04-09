import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { Readable } from "stream";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { fileStorageProvider, fileStorageRoot } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localUploadsRoot = path.join(__dirname, "../../uploads");

const sanitizeFolder = (value) =>
  String(value || "")
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .filter((segment) => segment !== "." && segment !== "..")
    .join("/");

const sanitizeFilename = (originalname) => {
  const ext = path.extname(originalname || "").toLowerCase();
  const base =
    path
      .basename(originalname || "file", ext)
      .replace(/[^\w.-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "file";

  return `${Date.now()}-${randomUUID()}-${base}${ext}`;
};

const buildCloudinaryFolder = (folder) => [sanitizeFolder(fileStorageRoot), sanitizeFolder(folder)].filter(Boolean).join("/");

const buildLocalObjectPath = (folder, originalname) =>
  [sanitizeFolder(folder), sanitizeFilename(originalname)].filter(Boolean).join("/");

let cloudinaryConfigured = false;

const configureCloudinary = () => {
  if (cloudinaryConfigured) {
    return;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  cloudinaryConfigured = true;
};

const uploadToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    configureCloudinary();

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: buildCloudinaryFolder(folder) || undefined,
        resource_type: "auto"
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url || result.url,
          path: result.public_id,
          provider: "cloudinary",
          name: file.originalname,
          mimeType: file.mimetype
        });
      }
    );

    Readable.from([file.buffer]).pipe(uploadStream);
  });

const uploadToLocal = async (file, folder) => {
  const relativePath = buildLocalObjectPath(folder, file.originalname);
  const normalizedRelativePath = relativePath.replace(/\\/g, "/");
  const absolutePath = path.join(localUploadsRoot, relativePath);

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, file.buffer);

  return {
    url: `/uploads/${normalizedRelativePath}`,
    path: normalizedRelativePath,
    provider: "local",
    name: file.originalname,
    mimeType: file.mimetype
  };
};

export const uploadSingleFile = async (file, { folder = "" } = {}) => {
  if (!file) {
    return null;
  }

  if (fileStorageProvider === "cloudinary") {
    return uploadToCloudinary(file, folder);
  }

  return uploadToLocal(file, folder);
};

export const uploadManyFiles = async (files, options = {}) => {
  if (!files?.length) {
    return [];
  }

  return Promise.all(files.map((file) => uploadSingleFile(file, options)));
};
