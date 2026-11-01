import { apiRequest } from "@/lib/api";
import type { User } from "@/features/auth/auth.types";

export type UpdateUserPayload = {
  username?: string;
  profilePhotoId?: string;
  profilePhotoUrl?: string;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiRequest<{ user: User }>("/users/me", {
    method: "GET",
  });

  return response.user;
};

export const updateCurrentUser = async (
  payload: UpdateUserPayload,
): Promise<User> => {
  const response = await apiRequest<{ user: User }>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return response.user;
};

export const deleteCurrentUser = async (): Promise<void> => {
  return apiRequest<void>("/users/me", {
    method: "DELETE",
  });
};