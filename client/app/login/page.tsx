export const instant = false;

// Keep your existing imports and page component below.
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  return <AuthForm mode="login" />;
}