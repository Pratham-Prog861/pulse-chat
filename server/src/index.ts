import express, { Express } from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import { setupRoutes } from "./routes/index.js";
import { setupSocketIO } from "./socket/index.js";

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupRoutes(app);

setupSocketIO(httpServer);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    httpServer.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log(`🌐 Network: http://192.168.1.5:${PORT}`);
      console.log(`🔌 Socket.IO ready for connections`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
