import type { Prisma, Role } from "@prisma/client";
import { prisma } from "./prisma.js";

export async function audit(input: {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ip?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId || null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId || null,
      metadata: input.metadata,
      ip: input.ip || null,
    },
  });
}

export function canSeePii(role: Role) {
  return role === "SUPER_ADMIN" || role === "INVESTMENT_TEAM";
}

export function canEditLeads(role: Role) {
  return role === "SUPER_ADMIN" || role === "INVESTMENT_TEAM";
}

export function canEditContent(role: Role) {
  return role === "SUPER_ADMIN" || role === "CONTENT_EDITOR";
}

export function canExport(role: Role) {
  return role === "SUPER_ADMIN" || role === "INVESTMENT_TEAM";
}
