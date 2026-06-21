import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { homeHref } from "@/lib/landing/home-nav";
import { FADEN_CONTACT } from "@/lib/content/faden-contact";

const FOOTER_SECTIONS = [
  {
    sectionKey: "company" as const,
    links: [
      { key: "about" as const, href: "/about" },
      { key: "careers" as const, href: "/careers" },
      { key: "press" as const, href: "/press" },
    ],
  },
  {
    sectionKey: "support" as const,
    links: [
      { key: "help" as const, href: "/help" },
      { key: "contact" as const, href: "/contact" },
      { key: "faq" as const, href: "/faq" },
    ],
  },
  {
    sectionKey: "legal" as const,
    links: [
      { key: "privacy" as const, href: "/privacy" },
      { key: "terms" as const, href: "/terms" },
    ],
  },
] as const;

export async function Footer() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background-soft">
      <div className="mx-auto max-w-container px-4 py-16 lg:px-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href={homeHref()} className="faden-logo-gradient font-display text-2xl font-bold tracking-[0.14em]">
              FADEN
            </Link>
            <p className="mt-2 font-display text-sm italic text-foreground-muted">{t("tagline")}</p>
            <div className="mt-4 space-y-1.5 text-sm text-foreground-muted">
              <p>
                <a
                  href={FADEN_CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-gold"
                >
                  {FADEN_CONTACT.phoneDisplay}
                </a>
              </p>
              {FADEN_CONTACT.emails.map((email) => (
                <p key={email}>
                  <a href={`mailto:${email}`} className="transition-colors hover:text-gold">
                    {email}
                  </a>
                </p>
              ))}
            </div>
          </div>
          {FOOTER_SECTIONS.map(({ sectionKey, links }) => (
            <div key={sectionKey}>
              <h3 className="mb-3 text-sm font-semibold text-gold">{t(`sections.${sectionKey}`)}</h3>
              <ul className="space-y-2">
                {links.map(({ key, href }) => (
                  <li key={key}>
                    <Link
                      href={href}
                      className="text-sm text-foreground-muted transition-colors hover:text-foreground"
                    >
                      {t(`links.${key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border pt-6 text-sm text-foreground-muted">
          {t("copyright", { year })}
        </div>
      </div>
    </footer>
  );
}
