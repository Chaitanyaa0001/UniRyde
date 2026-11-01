
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthVisual from "./AuthVisual";
import { useAuth } from "@/context/auth/auth.context";
import { useLogin, useRegister } from "@/features/auth/auth.hooks";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

type AuthValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === "signup";
  const router = useRouter();

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const [values, setValues] = useState<AuthValues>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const activeMutation = isSignup
    ? registerMutation
    : loginMutation;

  const loading = activeMutation.isPending;

  const updateField = (
    field: keyof AuthValues,
    value: string,
  ) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    setValidationError("");
    loginMutation.reset();
    registerMutation.reset();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (authLoading || isAuthenticated) {
      return;
    }

    setValidationError("");
    loginMutation.reset();
    registerMutation.reset();

    const email = values.email.trim().toLowerCase();

    if (isSignup) {
      const username = values.username.trim();

      if (username.length < 3 || username.length > 20) {
        setValidationError(
          "Username must be between 3 and 20 characters.",
        );
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setValidationError(
          "Username can only contain letters, numbers, and underscores.",
        );
        return;
      }

      if (
        values.password.length < 8 ||
        values.password.length > 72
      ) {
        setValidationError(
          "Password must be between 8 and 72 characters.",
        );
        return;
      }

      if (values.password !== values.confirmPassword) {
        setValidationError("Passwords do not match.");
        return;
      }

      try {
        await registerMutation.mutateAsync({
          username,
          email,
          password: values.password,
        });

        router.replace("/login?registered=1");
      } catch {
        // TanStack Query stores the error in registerMutation.error.
      }

      return;
    }

    if (!values.password) {
      setValidationError("Password is required.");
      return;
    }

    try {
      await loginMutation.mutateAsync({
        email,
        password: values.password,
      });

      // Login succeeded and the session cookie is set.
      // AuthContext now has the authenticated user.
      router.replace("/profile");
    } catch {
      // TanStack Query stores the error in loginMutation.error.
    }
  };

  const mutationError = activeMutation.error;

  const errorMessage =
    validationError ||
    (mutationError instanceof Error
      ? mutationError.message
      : "");

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#292F3A] outline-none transition placeholder:text-gray-400 focus:border-[#009F9F] focus:bg-white focus:ring-4 focus:ring-[#009F9F]/10";

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left campus visual */}
      <AuthVisual mode={mode} />

      {/* Right form */}
      <section className="flex min-h-screen w-full items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <Link
            href="/"
            className="mb-12 flex items-center justify-center gap-2 lg:hidden"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#009F9F] text-xl text-white">
              🚘
            </span>

            <span className="text-xl font-bold text-[#292F3A]">
              UniRyde
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <span className="mb-4 inline-flex rounded-full bg-[#E7F7F5] px-3 py-1.5 text-xs font-semibold text-[#008C89]">
              {isSignup ? "JOIN THE COMMUNITY" : "WELCOME BACK"}
            </span>

            <h2 className="text-3xl font-bold tracking-tight text-[#292F3A]">
              {isSignup
                ? "Create your account"
                : "Welcome back!"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {isSignup
                ? "Join your campus community and find your next ride."
                : "Log in to UniRyde and pick up where you left off."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Username
                </label>

                <input
                  type="text"
                  placeholder="Choose a username"
                  className={inputClass}
                  value={values.username}
                  onChange={(e) =>
                    updateField("username", e.target.value)
                  }
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]+"
                  autoComplete="username"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email address
              </label>

              <input
                type="email"
                placeholder="you@university.edu"
                className={inputClass}
                value={values.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`${inputClass} pr-16`}
                  value={values.password}
                  onChange={(e) =>
                    updateField("password", e.target.value)
                  }
                  required
                  minLength={isSignup ? 8 : 1}
                  maxLength={isSignup ? 72 : undefined}
                  autoComplete={
                    isSignup
                      ? "new-password"
                      : "current-password"
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#009F9F] hover:text-[#007D7D]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {isSignup && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Confirm password
                </label>

                <input
                  type="password"
                  placeholder="Re-enter your password"
                  className={inputClass}
                  value={values.confirmPassword}
                  onChange={(e) =>
                    updateField(
                      "confirmPassword",
                      e.target.value,
                    )
                  }
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            {!isSignup && (
              <div className="flex justify-end">
                <span className="text-xs text-gray-400">
                  Forgot password? Contact support.
                </span>
              </div>
            )}

            {/* Error feedback */}
            {errorMessage && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
              >
                {errorMessage}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || authLoading || isAuthenticated}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#009F9F] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#009F9F]/20 transition hover:-translate-y-0.5 hover:bg-[#008888] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {authLoading
                ? "Checking session..."
                : loading
                  ? "Please wait..."
                  : isAuthenticated
                    ? "Already logged in"
                    : isSignup
                      ? "Create account"
                      : "Log in"}

              {!loading && !authLoading && !isAuthenticated && (
                <span>→</span>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <div className="mt-7 text-center text-sm text-gray-500">
            {isSignup
              ? "Already have an account?"
              : "New to UniRyde?"}

            <Link
              href={isSignup ? "/login" : "/register"}
              className="ml-1 font-semibold text-[#009F9F] hover:text-[#007D7D]"
            >
              {isSignup ? "Log in" : "Sign up"}
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>🔒</span>
            Your account and personal information stay secure.
          </div>
        </div>
      </section>
    </div>
  );
}
