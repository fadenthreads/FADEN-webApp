import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata = {
  title: "Admin Sign In — FADEN",
};

export const dynamic = "force-dynamic";

interface AdminLoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <AdminLoginForm forbidden={params.error === "forbidden"} />
    </div>
  );
}
