import axios from "axios";

const rawBaseURL = String(import.meta.env.VITE_API_BASE_URL || "/api").trim();
const baseURL = rawBaseURL.replace(/\/+$/, "");

const resolveApiOrigin = (url) => {
  if (/^https?:\/\//i.test(url)) {
    return url.replace(/\/api\/?$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
};

export const apiOrigin = resolveApiOrigin(baseURL);

export const resolveAssetUrl = (value) => {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return "";
  }

  if (/^(?:https?:)?\/\//i.test(rawValue) || rawValue.startsWith("data:") || rawValue.startsWith("blob:")) {
    return rawValue;
  }

  const normalizedPath = rawValue.startsWith("/") ? rawValue : `/${rawValue}`;
  return apiOrigin ? `${apiOrigin}${normalizedPath}` : normalizedPath;
};

export const withAssetVersion = (value, version) => {
  const resolvedValue = resolveAssetUrl(value);
  if (!resolvedValue || !version) {
    return resolvedValue;
  }

  const separator = resolvedValue.includes("?") ? "&" : "?";
  return `${resolvedValue}${separator}v=${encodeURIComponent(version)}`;
};

export const api = axios.create({
  baseURL
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};
