import { apiRequest } from "@/lib/api";

import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "./auth.types";

export const registerUser = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const loginUser = async (
  payload: LoginPayload,
): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const logoutUser = async (): Promise<void> => {
  return apiRequest<void>("/auth/logout", {
    method: "POST",
  });
};

export const logoutAllUsers = async (): Promise<void> => {
  return apiRequest<void>("/auth/logout-all", {
    method: "POST",
  });
};