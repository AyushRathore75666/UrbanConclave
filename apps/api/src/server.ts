import cors from "cors";
import express from "express";
import helmet from "helmet";
import { registerPublic, handleUploadError } from "./routes/public.js";
import { registerAdmin } from "./routes/admin.js";
import { requireClientHeader } from "./auth.js";

export function createApp() {
  const app = express();
  if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: (process.env.WEB_ORIGIN || "http://localhost:3000").split(","),
      allowedHeaders: ["Content-Type", "Authorization", "X-MPGIS-Request"],
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use("/api/admin", requireClientHeader);
  registerPublic(app);
  registerAdmin(app);
  app.use(handleUploadError);
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    const status = /not a valid|larger than|not accepted|Captcha|Verify|expired|district|sector/i.test(message) ? 400 : 500;
    if (status === 500) console.error(error);
    res.status(status).json({
      error: status === 500 && process.env.NODE_ENV === "production" ? "Something went wrong." : message,
    });
  });
  return app;
}

export function startServer() {
  const port = Number(process.env.PORT || 4000);
  const app = createApp();
  return new Promise<void>((resolve) => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`API listening on http://127.0.0.1:${port}`);
      resolve();
    });
  });
}
