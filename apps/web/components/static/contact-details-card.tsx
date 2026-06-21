import { Mail, Phone } from "lucide-react";
import { FADEN_CONTACT } from "@/lib/content/faden-contact";

interface ContactDetailsCardProps {
  className?: string;
  title?: string;
}

export function ContactDetailsCard({
  className = "",
  title = "Contact details",
}: ContactDetailsCardProps) {
  return (
    <div className={`rounded-xl border border-gold/25 bg-gold/5 p-5 ${className}`}>
      <h2 className="font-display text-lg font-semibold text-gold">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm text-foreground md:text-base">
        <li className="flex items-start gap-3">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
          <span>
            Phone / WhatsApp:{" "}
            <a
              href={FADEN_CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gold hover:underline"
            >
              {FADEN_CONTACT.phoneDisplay}
            </a>
          </span>
        </li>
        {FADEN_CONTACT.emails.map((email) => (
          <li key={email} className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
            <span>
              Email:{" "}
              <a href={`mailto:${email}`} className="font-medium text-gold hover:underline">
                {email}
              </a>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
