import { createClient } from "redis";
import { env } from "../config/env.config.js";

export const redis = createClient({
  url: env.REDIS_URL,
});

redis.on("error", (err) => console.error("Redis Client Error", err));
