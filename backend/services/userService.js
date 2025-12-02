import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const createUser = async (data) => {
  const passwordHash = await bcrypt.hash(data.password, 10);
  return await User.create({ ...data, passwordHash });
};

export const validateUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
};

export const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // store hashed refresh token
  user.refreshTokens.push({
    tokenHash: bcrypt.hashSync(refreshToken, 10),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000)
  });

  await user.save();

  return { accessToken, refreshToken };
};
