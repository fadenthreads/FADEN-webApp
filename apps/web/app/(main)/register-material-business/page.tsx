import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MaterialBusinessRegistrationForm } from "@/components/register-material-business/material-business-registration-form";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Register Material Business — FADEN",
  description: "List your fabric and material business on FADEN and sell to customers online.",
};

export default async function RegisterMaterialBusinessPage() {
  const t = await getTranslations("RegisterMaterialBusiness");

  if (isWebSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/login?next=${encodeURIComponent("/register-material-business")}`);
    }
  }

  return (
    <div className="faden-page-glow min-h-[calc(100vh-120px)] px-4 py-10 lg:px-12">
      <div className="mx-auto max-w-container">
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-gold">{t("eyebrow")}</p>
          <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">{t("title")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-foreground-muted">{t("subtitle")}</p>
          <p className="mt-4 text-sm text-foreground-muted">
            <Link href="/login?next=/register-material-business" className="text-gold hover:text-gold-light">
              {t("signIn")}
            </Link>
            {" · "}
            <Link href="/signup?next=/register-material-business" className="text-gold hover:text-gold-light">
              {t("createAccount")}
            </Link>
          </p>
        </header>
        <MaterialBusinessRegistrationForm />
      </div>
    </div>
  );
}
