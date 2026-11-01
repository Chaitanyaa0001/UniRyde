import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { errorHandler } from "./middleware/error-handler.js";
import { env } from "./config/env.config.js";

// Import Routes
import authRoutes from "./modules/auth/auth.route.js";
import userRoutes from "./modules/users/users.route.js";
import carpoolRoutes from "./modules/carpools/carpool.route.js";
import chatRoutes from "./modules/chat/chat.route.js";

const app: Express = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use((req, _res, next) => {
  console.log("REQUEST:", req.method, req.originalUrl);
  next();
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/carpools", carpoolRoutes);
app.use("/api/v1/chat", chatRoutes);

app.get("/api/v1/health", (_req, res) => {
  return res.status(200).json({ message: "UniRyde API is running" });
});

// 404 Error
app.use((_req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use(errorHandler);

export default app;
