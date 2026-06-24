import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BoutiqueRegistrationForm } from "@/components/register-boutique/boutique-registration-form";
import { getOwnerBoutique } from "@/lib/boutique/queries";
import {
  getOwnerBoutiqueEditDetails,
  getPendingBoutiqueModification,
} from "@/lib/boutique/modification-queries";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

interface RegisterBoutiquePageProps {
  searchParams: Promise<{ mode?: string }>;
}

export async function generateMetadata({ searchParams }: RegisterBoutiquePageProps) {
  const params = await searchParams;
  const isModify = params.mode === "modify";

  return {
    title: isModify ? "Modify Boutique Details — FADEN" : "Register Your Boutique — FADEN",
    description: isModify
      ? "Update your boutique profile on FADEN."
      : "Join FADEN and reach customers looking for trusted custom fashion.",
  };
}

export default async function RegisterBoutiquePage({ searchParams }: RegisterBoutiquePageProps) {
  const t = await getTranslations("RegisterBoutique");
  const params = await searchParams;
  const modifyRequested = params.mode === "modify";

  let modifyMode = modifyRequested;
  let boutiqueId: string | undefined;
  let boutiqueStatus: string | undefined;
  let initialForm = undefined;
  let pendingModification = null;

  if (isWebSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const next = modifyRequested ? "/register-boutique?mode=modify" : "/register-boutique";
      redirect(`/login?next=${encodeURIComponent(next)}`);
    }

    try {
      const boutique = await getOwnerBoutique(supabase, user.id);
      if (boutique) {
        modifyMode = true;
        boutiqueId = boutique.id;
        boutiqueStatus = boutique.status;

        const editDetails = await getOwnerBoutiqueEditDetails(supabase, user.id);
        if (editDetails) {
          initialForm = editDetails.form;
        }

        if (boutique.status === "verified") {
          pendingModification = await getPendingBoutiqueModification(supabase, boutique.id);
        }
      } else if (modifyRequested) {
        redirect("/register-boutique");
      }
    } catch {
      if (!modifyRequested) {
        modifyMode = false;
      }
    }
  }

  return (
    <div className="faden-page-glow min-h-[calc(100vh-120px)] px-4 py-10 lg:px-12">
      <div className="mx-auto max-w-container">
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-gold">{t("forBoutiques")}</p>
          <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">
            {modifyMode ? t("modifyTitle") : t("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-foreground-muted">{t("subtitle")}</p>
          <p className="mt-4 text-sm text-foreground-muted">
            <Link href="/login?next=/register-boutique" className="text-gold hover:text-gold-light">
              {t("signIn")}
            </Link>
            {" · "}
            <Link
              href="/signup?next=/register-boutique&role=boutique_owner"
              className="text-gold hover:text-gold-light"
            >
              {t("createAccount")}
            </Link>
          </p>
        </header>
        <BoutiqueRegistrationForm
          mode={modifyMode ? "modify" : "register"}
          boutiqueId={boutiqueId}
          boutiqueStatus={boutiqueStatus}
          initialForm={initialForm}
          pendingModification={pendingModification}
        />
      </div>
    </div>
  );
}
