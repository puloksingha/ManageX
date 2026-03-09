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
