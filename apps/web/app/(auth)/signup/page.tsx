import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Create Account — FADEN",
  description: "Join FADEN as a customer or boutique owner.",
};

export const dynamic = "force-dynamic";

interface SignupPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;

  return <SignupForm next={params.next ?? "/register-boutique"} />;
}
