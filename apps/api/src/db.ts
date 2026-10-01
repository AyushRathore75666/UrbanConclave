import fs from "fs";
import path from "path";
import EmbeddedPostgres from "embedded-postgres";
import { dataDir } from "./paths.js";

let instance: EmbeddedPostgres | null = null;

export async function startDatabase() {
  if (process.env.USE_EMBEDDED_PG === "false") {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required when USE_EMBEDDED_PG=false.");
    }
    return;
  }

  const port = Number(process.env.EMBEDDED_PG_PORT || 5433);
  const databaseDir = path.join(dataDir, "pg");
  fs.mkdirSync(databaseDir, { recursive: true });

  const pg = new EmbeddedPostgres({
    databaseDir,
    user: "postgres",
    password: "postgres",
    port,
    persistent: true,
    initdbFlags: ["--encoding=UTF8", "--locale=C", "--lc-messages=C"],
  });

  if (!fs.existsSync(path.join(databaseDir, "PG_VERSION"))) {
    await pg.initialise();
  }
  await pg.start();
  const client = pg.getPgClient("postgres");
  await client.connect();
  const existing = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", ["mpgis"]);
  await client.end();
  if (existing.rowCount === 0) {
    await pg.createDatabase("mpgis");
  }

  process.env.DATABASE_URL = `postgresql://postgres:postgres@127.0.0.1:${port}/mpgis`;
  instance = pg;
  console.log(`Postgres is ready on 127.0.0.1:${port}/mpgis`);
}

export async function stopDatabase() {
  if (!instance) return;
  await instance.stop();
  instance = null;
}
