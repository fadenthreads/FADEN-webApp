import Link from "next/link";
import type { StaticPageContent } from "@/lib/content/static-pages";
import { ContactDetailsCard } from "@/components/static/contact-details-card";

interface StaticPageViewProps {
  page: StaticPageContent;
}

export function StaticPageView({ page }: StaticPageViewProps) {
  const isContactPage = page.slug === "contact";

  return (
    <article className="px-4 pb-section-gap pt-10 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-border pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">FADEN</p>
          <h1 className="mt-3 font-display text-3xl font-semibold md:text-4xl">{page.title}</h1>
          {page.intro && (
            <p className="mt-4 text-base leading-relaxed text-foreground-muted md:text-lg">{page.intro}</p>
          )}
        </header>

        {isContactPage && (
          <ContactDetailsCard className="mt-8" title="Get in touch" />
        )}

        {page.faq && page.faq.length > 0 && (
          <div className="mt-10 space-y-6">
            {page.faq.map((item) => (
              <section key={item.question} className="rounded-xl border border-border bg-background-elevated p-5">
                <h2 className="font-display text-lg font-semibold">{item.question}</h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground-muted">{item.answer}</p>
              </section>
            ))}
          </div>
        )}

        {page.sections.length > 0 && (
          <div className="mt-10 space-y-10">
            {page.sections.map((section) => (
              <section key={section.heading ?? section.paragraphs[0]?.slice(0, 40)}>
                {section.heading && (
                  <h2 className="font-display text-xl font-semibold text-gold">{section.heading}</h2>
                )}
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className={`text-sm leading-relaxed text-foreground-muted md:text-base ${section.heading ? "mt-3" : ""}`}
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-foreground-muted md:text-base">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}

        <footer className="mt-12 border-t border-border pt-6">
          <Link href="/" className="text-sm font-medium text-gold hover:underline">
            ← Back to home
          </Link>
        </footer>
      </div>
    </article>
  );
}
