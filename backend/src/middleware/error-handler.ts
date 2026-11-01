import type { ErrorRequestHandler } from "express";
import * as z from "zod";
import { AppError } from "../utils/app-error.js";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: z.flattenError(error).fieldErrors,
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error(error);

  return res.status(500).json({ message: "Internal server error" });
};
