import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Role, User } from "@prisma/client";

declare global {
  namespace Express {
    interface Locals {
      actor?: User;
    }
  }
}
import { prisma } from "./prisma.js";

export type AuthToken = { sub: string; role: Role; email: string; purpose?: string; targetHash?: string };

function secret() {
  return process.env.JWT_SECRET || "";
}

export function signAdmin(user: { id: string; role: Role; email: string }) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email, purpose: "admin" }, secret(), {
    expiresIn: "8h",
  });
}

export function signOtp(channel: "email" | "sms", targetHash: string) {
  return jwt.sign({ purpose: `otp-${channel}`, targetHash }, secret(), { expiresIn: "30m" });
}

export function verifyOtpToken(token: string, channel: "email" | "sms", targetHash: string) {
  try {
    const payload = jwt.verify(token, secret()) as AuthToken;
    return payload.purpose === `otp-${channel}` && payload.targetHash === targetHash;
  } catch {
    return false;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Sign in required." });
  try {
    const payload = jwt.verify(token, secret()) as AuthToken;
    if (payload.purpose !== "admin" || !payload.sub) {
      return res.status(401).json({ error: "Sign in required." });
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.active) return res.status(401).json({ error: "This account is not active." });
    res.locals.actor = user;
    next();
  } catch {
    return res.status(401).json({ error: "Your session has ended. Sign in again." });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const actor = res.locals.actor as { role: Role } | undefined;
    if (!actor || !roles.includes(actor.role)) {
      return res.status(403).json({ error: "You do not have access to this action." });
    }
    next();
  };
}

export function requireClientHeader(req: Request, res: Response, next: NextFunction) {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && req.get("x-mpgis-request") !== "1") {
    return res.status(403).json({ error: "Request blocked." });
  }
  next();
}
