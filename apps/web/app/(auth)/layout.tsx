import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="faden-page-glow flex min-h-screen flex-col">
      <header className="mx-auto flex h-16 w-full max-w-container items-center justify-between gap-3 px-4 lg:px-12">
        <Link href="/" className="font-display text-2xl font-bold tracking-[0.14em] text-navy">
          FADEN
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/" className="text-sm text-foreground-muted transition-colors hover:text-gold">
            ← Back to home
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">{children}</main>
    </div>
  );
}
