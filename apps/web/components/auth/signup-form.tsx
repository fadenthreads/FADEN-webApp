"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { FormField, SelectInput, TextInput } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { formatAuthError } from "@/lib/auth-errors";
import { PASSWORD_REQUIREMENTS, passwordRequirementChecks } from "@/lib/auth/password";
import { authFetch, isBrowserSupabaseConfigured, navigateAfterAuth } from "@/lib/supabase/client";
import { signupFormSchema } from "@faden/validators";

interface SignupFormProps {
  next?: string;
  defaultRole?: "customer" | "boutique_owner";
}

export function SignupForm({ next = "/register-boutique", defaultRole = "customer" }: SignupFormProps) {
  const t = useTranslations("Auth");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"customer" | "boutique_owner">(defaultRole);
  const checks = passwordRequirementChecks(password);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isBrowserSupabaseConfigured()) {
      setError(t("supabaseNotConfigured"));
      return;
    }

    const formData = new FormData(event.currentTarget);
    const parsed = signupFormSchema.safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      role: formData.get("role") || defaultRole,
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? t("invalidInput"));
      return;
    }

    setPending(true);
    try {
      const { res, payload } = await authFetch("/auth/signup", {
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        password: parsed.data.password,
        role: parsed.data.role,
        next,
      });

      if (!res.ok || !payload.ok) {
        setError(payload.error ?? t("signupFailed"));
        setPending(false);
        return;
      }

      navigateAfterAuth(payload.redirect ?? "/login?registered=1");
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "AbortError"
          ? t("requestTimeout")
          : formatAuthError(err);
      setError(message);
      setPending(false);
    }
  }

  return (
    <PremiumCard className="mx-auto w-full max-w-md" hover={false}>
      <p className="text-xs font-semibold tracking-[0.3em] text-gold">{t("joinFaden")}</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">{t("createAccount")}</h1>
      <p className="mt-2 text-sm text-foreground-muted">{t("signupSubtitle")}</p>

      <div className="mt-6">
        <OAuthButtons next={next} role={selectedRole} />
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <FormField label={t("fullName")}>
          <TextInput name="fullName" required placeholder={t("fullNamePlaceholder")} autoComplete="name" />
        </FormField>
        <FormField label={t("email")}>
          <TextInput name="email" type="email" required placeholder={t("emailPlaceholder")} autoComplete="email" />
        </FormField>
        <FormField label={t("password")} hint={t("passwordHint")}>
          <PasswordInput
            name="password"
            required
            placeholder={t("passwordPlaceholder")}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ul className="mt-2 space-y-1 text-xs text-foreground-muted">
            {PASSWORD_REQUIREMENTS.map((req, i) => {
              const keys = ["length", "upper", "lower", "number", "special"] as const;
              const ok = checks[keys[i]];
              return (
                <li key={req} className={ok ? "text-gold-light" : undefined}>
                  {ok ? "✓" : "○"} {req}
                </li>
              );
            })}
          </ul>
        </FormField>
        <FormField label={t("confirmPassword")}>
          <PasswordInput
            name="confirmPassword"
            required
            placeholder={t("confirmPasswordPlaceholder")}
            autoComplete="new-password"
          />
        </FormField>
        <FormField label={t("joiningAs")}>
          <SelectInput
            name="role"
            value={selectedRole}
            onChange={(event) =>
              setSelectedRole(event.target.value === "boutique_owner" ? "boutique_owner" : "customer")
            }
            options={[
              { value: "customer", label: t("roleCustomer") },
              { value: "boutique_owner", label: t("roleBoutiqueOwner") },
            ]}
          />
        </FormField>
        <Button type="submit" variant="luxury" className="w-full" disabled={pending}>
          {pending ? t("creatingAccount") : t("createAccount")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-muted">
        {t("alreadyHaveAccount")}{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-gold hover:text-gold-light">
          {t("signIn")}
        </Link>
      </p>
    </PremiumCard>
  );
}
