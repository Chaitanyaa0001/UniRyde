import type { Request, Response } from "express";
import { AppError } from "../../utils/app-error";
import {
  deleteCurrentUserService,
  getCurrentUserService,
  updateCurrentUserService,
} from "./users.service";
import { updateUserSchema } from "./users.schema";
import { COOKIE_OPTIONS } from "../auth/auth.controller";

// Get Current User Controller

export const getCurrentUser = async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new AppError(401, "Authentication is required");
  }

  const user = await getCurrentUserService(req.userId);

  return res.status(200).json({ user });
};

// Update Current User Controller

export const updateCurrentUser = async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new AppError(401, "Authentication is required");
  }

  const data = updateUserSchema.parse(req.body);

  const user = await updateCurrentUserService(req.userId, data);

  return res.status(200).json({ user });
};

// Delete Current User Controller

export const deleteCurrentUser = async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new AppError(401, "Authentication is required");
  }

  await deleteCurrentUserService(req.userId);

  return res.clearCookie("sid", COOKIE_OPTIONS).status(204).end();
};
