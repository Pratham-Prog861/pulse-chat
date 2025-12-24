import userRoutes from "./userRoutes.js";
import roomRoutes from "./roomRoutes.js";
import messageRoutes from "./messageRoutes.js";
import { Express } from "express";

export const setupRoutes = (app: Express): void => {
  app.use("/api/users", userRoutes);
  app.use("/api/rooms", roomRoutes);
  app.use("/api/messages", messageRoutes);
};
