export const roleCheck = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const normalizedUserRole = req.user.role === "teacher" ? "department" : req.user.role;
  const normalizedRoles = roles.map((role) => (role === "teacher" ? "department" : role));
  if (!normalizedRoles.includes(normalizedUserRole)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
