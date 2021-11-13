import jwt from "jsonwebtoken";

export default function generateToken(password) {
  return jwt.sign({ password }, "jwtSecret", { expiresIn: "24hr" });
}
