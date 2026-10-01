import { execSync } from "child_process";
import { loadEnv } from "./env.js";
import { startDatabase, stopDatabase } from "./db.js";
import { apiRoot } from "./paths.js";

loadEnv();
await startDatabase();

execSync("npx prisma generate", { cwd: apiRoot, stdio: "inherit", env: process.env });
execSync("npx prisma db push", { cwd: apiRoot, stdio: "inherit", env: process.env });

const { seed } = await import("./seed.js");
await seed();
const { startServer } = await import("./server.js");
await startServer();

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void stopDatabase().finally(() => process.exit(0));
  });
}
