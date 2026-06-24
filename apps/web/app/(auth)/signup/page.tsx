import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Create Account — FADEN",
  description: "Join FADEN as a customer or boutique owner.",
};

export const dynamic = "force-dynamic";

interface SignupPageProps {
  searchParams: Promise<{ next?: string; role?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const defaultRole = params.role === "boutique_owner" ? "boutique_owner" : "customer";
  const next =
    params.next ??
    (defaultRole === "boutique_owner" ? "/register-boutique" : "/");

  return <SignupForm next={next} defaultRole={defaultRole} />;
}
