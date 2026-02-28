import jwt from "jsonwebtoken";
import crypto from "crypto";

export const signAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m" }
  );

export const signRefreshToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, jti: crypto.randomUUID() },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d" }
  );
