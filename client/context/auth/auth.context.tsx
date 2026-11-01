
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api";
import { getCurrentUser } from "@/features/users/users.api";
import { logoutUser } from "@/features/auth/auth.api";
import { AUTH_USER_QUERY_KEY } from "@/features/auth/auth.hooks";
import type { User } from "@/features/auth/auth.types";
import {
  connectChatSocket,
  disconnectChatSocket,
} from "@/features/chat/chat.socket";

type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

type AuthContextType = {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

const PUBLIC_PATHS = ["/", "/login", "/register"];

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery<User | null>({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: async () => {
      try {
        return await getCurrentUser();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }

        throw error;
      }
    },
    retry: false,
    staleTime: 60 * 1000,
  });

  const status: AuthStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : user
        ? "authenticated"
        : "unauthenticated";

  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isAuthPage =
    pathname === "/login" || pathname === "/register";

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, null);
      router.replace("/login");
    }
  }, [queryClient, router]);

  const refreshUser = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Connect chat only when a valid user is available.
  useEffect(() => {
    if (status === "authenticated" && user) {
      connectChatSocket();
    } else {
      disconnectChatSocket();
    }

    return () => {
      disconnectChatSocket();
    };
  }, [status, user]);

  // Handle route protection and authenticated-user redirects.
  useEffect(() => {
    if (status === "loading" || status === "error") {
      return;
    }

    if (status === "unauthenticated" && !isPublicPath) {
      router.replace("/login");
      return;
    }

    if (status === "authenticated" && isAuthPage) {
      router.replace("/profile");
    }
  }, [status, isPublicPath, isAuthPage, router]);

  // Never render protected pages before authentication is verified.
  if (!isPublicPath && status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7FAFA] text-sm text-gray-500">
        Checking your session...
      </div>
    );
  }

  if (!isPublicPath && status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7FAFA] text-sm text-gray-500">
        Redirecting to login...
      </div>
    );
  }

  if (!isPublicPath && status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F7FAFA] px-6 text-center">
        <p className="text-sm text-gray-600">
          We couldn't verify your session. Please check your connection and try again.
        </p>

        <button
          onClick={() => void refreshUser()}
          className="rounded-xl bg-[#009F9F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#008888]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        status,
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading",
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
