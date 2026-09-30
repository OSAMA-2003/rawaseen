import { createApp } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

const startServer = async () => {
  // 1. Establish Database Connection
  await connectDB();

  // 2. Create Express App
  const app = createApp();

  // 3. Start Listening
  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Rawasin API Server running on port ${env.PORT} in [${env.NODE_ENV}] mode`);
    console.log(`🔗 Healthcheck available at: http://localhost:${env.PORT}/health`);
  });

  // Graceful Shutdown Handlers
  const gracefulShutdown = (signal: string) => {
    console.log(`\n🛑 ${signal} received. Initiating graceful shutdown...`);
    server.close(() => {
      console.log("🔒 HTTP server closed.");
      process.exit(0);
    });

    // Force shutdown after 10s if connections refuse to close
    setTimeout(() => {
      console.error("⚠️ Forcefully shutting down after timeout.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  process.on("unhandledRejection", (reason: any) => {
    console.error("💥 Unhandled Promise Rejection:", reason);
  });

  process.on("uncaughtException", (error: Error) => {
    console.error("💥 Uncaught Exception:", error);
    process.exit(1);
  });
};

startServer();
