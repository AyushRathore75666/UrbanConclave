import crypto from "crypto";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { apiRoot, repoRoot } from "./paths.js";

const envPath = path.join(apiRoot, ".env");

if (!fs.existsSync(envPath)) {
  const examplePath = path.join(repoRoot, ".env.example");
  const example = fs.readFileSync(examplePath, "utf8");
  const key = crypto.randomBytes(32).toString("hex");
  const jwt = crypto.randomBytes(32).toString("hex");
  const filled = example
    .replace("DATA_ENCRYPTION_KEY=", `DATA_ENCRYPTION_KEY=${key}`)
    .replace("JWT_SECRET=", `JWT_SECRET=${jwt}`);
  fs.writeFileSync(envPath, filled, { mode: 0o600 });
  console.log("Created apps/api/.env with generated secrets.");
}

dotenv.config({ path: envPath });

function required(name: string, min = 1) {
  const value = process.env[name] || "";
  if (value.length < min) {
    throw new Error(`${name} is missing. Set it in apps/api/.env.`);
  }
  return value;
}

export function loadEnv() {
  required("JWT_SECRET", 32);
  const key = required("DATA_ENCRYPTION_KEY", 64);
  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error("DATA_ENCRYPTION_KEY must be 64 hex characters.");
  }
  if (!process.env.SEED_ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD.length < 10) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 10 characters.");
  }
}
