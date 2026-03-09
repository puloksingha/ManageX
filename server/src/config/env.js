const splitEnvList = (...values) =>
  values
    .flatMap((value) => String(value || "").split(","))
    .map((value) => value.trim())
    .filter(Boolean);

export const allowedOrigins = Array.from(
  new Set([
    ...splitEnvList(process.env.CLIENT_URL, process.env.CLIENT_URLS),
    ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173", "http://127.0.0.1:5173"])
  ])
);

export const isEmailMockEnabled = String(process.env.EMAIL_MOCK || "false").toLowerCase() === "true";

export const validateEnv = () => {
  const required = [
    "MONGO_URI",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ADMIN_SECURITY_KEY",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD"
  ];

  if (!allowedOrigins.length) {
    required.push("CLIENT_URL or CLIENT_URLS");
  }

  if (!isEmailMockEnabled) {
    required.push("SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "MAIL_FROM");
  }

  const missing = required.filter((key) => !String(process.env[key] || "").trim() && !key.includes(" or "));

  if (!allowedOrigins.length) {
    missing.push("CLIENT_URL or CLIENT_URLS");
  }

  if (missing.length) {
    throw new Error(`Missing required environment configuration: ${missing.join(", ")}`);
  }
};

