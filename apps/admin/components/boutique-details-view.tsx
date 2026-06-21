import type { BoutiqueRegistrationInput } from "@faden/validators";
import {
  BOUTIQUE_DETAIL_SECTIONS,
  BOUTIQUE_FIELD_LABELS,
  formatBoutiqueFieldValue,
} from "@faden/database";

interface BoutiqueDetailsViewProps {
  details: BoutiqueRegistrationInput;
  defaultOpen?: boolean;
  /** When false, sections render inline (for nesting inside another panel). */
  collapsible?: boolean;
  summaryLabel?: string;
}

const MULTILINE_FIELDS = new Set<keyof BoutiqueRegistrationInput>([
  "address",
  "mapsUrl",
  "portfolioPhotoUrls",
  "outfitTypes",
  "servicesOffered",
  "pricingInfo",
  "reviewsSummary",
  "trustMediaUrls",
  "socialLinks",
  "communicationPrefs",
]);

function BoutiqueDetailsSections({ details }: { details: BoutiqueRegistrationInput }) {
  return (
    <div className="space-y-6">
      {BOUTIQUE_DETAIL_SECTIONS.map((section) => (
        <section key={section.title}>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gold/80">
            {section.title}
          </h4>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {section.fields.map((field) => (
              <div key={field} className={MULTILINE_FIELDS.has(field) ? "sm:col-span-2" : undefined}>
                <dt className="text-xs uppercase tracking-wide text-foreground-muted/80">
                  {BOUTIQUE_FIELD_LABELS[field]}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                  {formatBoutiqueFieldValue(field, details)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

export function BoutiqueDetailsView({
  details,
  defaultOpen = false,
  collapsible = true,
  summaryLabel = "View all boutique details",
}: BoutiqueDetailsViewProps) {
  if (!collapsible) {
    return <BoutiqueDetailsSections details={details} />;
  }

  return (
    <details className="mt-4" open={defaultOpen}>
      <summary className="cursor-pointer text-sm font-medium text-gold hover:text-gold-light">
        {summaryLabel}
      </summary>
      <div className="mt-4">
        <BoutiqueDetailsSections details={details} />
      </div>
    </details>
  );
}
