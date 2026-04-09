const IMAGE_MIME_PREFIX = "image/";

const extensionLabels = {
  pdf: "PDF",
  doc: "DOC",
  docx: "DOCX",
  zip: "ZIP",
  jpg: "Image",
  jpeg: "Image",
  png: "Image",
  webp: "Image"
};

const mimeLabels = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/zip": "ZIP",
  "application/x-zip-compressed": "ZIP"
};

export const getAssetExtension = (value) => {
  const normalized = String(value || "").split("?")[0].split("#")[0];
  const match = normalized.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "";
};

export const getAssetTypeLabel = ({ type = "", url = "" } = {}) => {
  const normalizedType = String(type || "").toLowerCase();
  if (normalizedType.startsWith(IMAGE_MIME_PREFIX)) {
    return "Image";
  }

  if (mimeLabels[normalizedType]) {
    return mimeLabels[normalizedType];
  }

  const extension = getAssetExtension(url);
  return extensionLabels[extension] || "File";
};

export const getAssetActionLabel = ({ type = "", url = "", defaultLabel = "Open file" } = {}) => {
  const kind = getAssetTypeLabel({ type, url });
  return kind === "File" ? defaultLabel : `Open ${kind}`;
};

export const getAssetDisplayName = ({ name = "", url = "" } = {}) => {
  const normalizedName = String(name || "").trim();
  if (normalizedName) {
    return normalizedName;
  }

  const normalizedUrl = String(url || "").split("?")[0].split("#")[0];
  if (!normalizedUrl) {
    return "";
  }

  const candidate = normalizedUrl.split("/").pop() || "";
  return decodeURIComponent(candidate);
};
