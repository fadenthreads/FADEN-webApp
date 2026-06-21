import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign In — FADEN",
  description: "Sign in to your FADEN account.",
};

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{ next?: string; registered?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <LoginForm
      next={params.next ?? "/"}
      registered={Boolean(params.registered)}
      authError={params.error ?? null}
    />
  );
}
