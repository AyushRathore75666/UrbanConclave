import path from "path";
import { fileURLToPath } from "url";

const srcDir = path.dirname(fileURLToPath(import.meta.url));

export const apiRoot = path.resolve(srcDir, "..");
export const repoRoot = path.resolve(apiRoot, "../..");
export const uploadDir = path.join(apiRoot, "uploads");
export const dataDir = path.join(apiRoot, "data");
export const contentDir = path.join(repoRoot, "content");
export const downloadDir = path.join(repoRoot, "apps/web/public/downloads");
export const outboxPath = path.join(dataDir, "outbox.log");
