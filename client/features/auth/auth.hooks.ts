
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser, registerUser } from "./auth.api";
import type {
  LoginPayload,
  RegisterPayload,
  User,
} from "./auth.types";

export const AUTH_USER_QUERY_KEY = ["auth", "user"] as const;

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),

    onSuccess: () => {
      // Registration does not create a session in your backend.
      queryClient.setQueryData<User | null>(
        AUTH_USER_QUERY_KEY,
        null,
      );
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),

    onSuccess: (data) => {
      // Login sets the sid cookie on the backend.
      // Store the authenticated user in the shared query cache.
      queryClient.setQueryData<User>(
        AUTH_USER_QUERY_KEY,
        data.user,
      );
    },
  });
}
