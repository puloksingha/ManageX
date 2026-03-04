export const adminSecurityKey = (process.env.ADMIN_SECURITY_KEY || "").trim();
export const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
export const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();

export const requireAdminSecurityKey = (res, providedKey) => {
  if (!adminSecurityKey) {
    res.status(500);
    throw new Error("Admin security key is not configured on the server");
  }

  if (String(providedKey || "").trim() !== adminSecurityKey) {
    res.status(403);
    throw new Error("Invalid admin security key");
  }
};

export const requireAdminIdentity = (res, email, password) => {
  if (!adminEmail || !adminPassword) {
    res.status(500);
    throw new Error("Admin email/password is not configured on the server");
  }

  if (String(email || "").trim().toLowerCase() !== adminEmail) {
    res.status(403);
    throw new Error("Invalid admin email");
  }

  if (String(password || "").trim() !== adminPassword) {
    res.status(403);
    throw new Error("Invalid admin password");
  }
};
