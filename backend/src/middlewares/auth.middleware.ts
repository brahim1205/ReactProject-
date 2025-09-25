import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export interface AuthRequest extends Request {
  userId?: number;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token:any = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token,JWT_SECRET);
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded
    ) {
      req.userId = (decoded as { userId: number }).userId;
      next();
    } else {
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }
  } catch {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};
