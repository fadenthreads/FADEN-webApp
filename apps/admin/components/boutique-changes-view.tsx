import type { BoutiqueRegistrationInput } from "@faden/validators";
import { diffBoutiqueDetails } from "@faden/database";

interface BoutiqueChangesViewProps {
  current: BoutiqueRegistrationInput;
  proposed: BoutiqueRegistrationInput;
}

export function BoutiqueChangesView({ current, proposed }: BoutiqueChangesViewProps) {
  const changes = diffBoutiqueDetails(current, proposed);

  if (!changes.length) {
    return (
      <p className="mt-4 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground-muted">
        No field changes detected in this request.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-gold/30">
      <div className="border-b border-gold/20 bg-gold/10 px-4 py-2">
        <p className="text-sm font-medium text-gold">
          {changes.length} field{changes.length === 1 ? "" : "s"} changed
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background-soft text-left text-xs uppercase tracking-wide text-foreground-muted">
              <th className="px-4 py-3 font-medium">Field</th>
              <th className="px-4 py-3 font-medium">Current (live)</th>
              <th className="px-4 py-3 font-medium">Proposed</th>
            </tr>
          </thead>
          <tbody>
            {changes.map((change) => (
              <tr key={change.field} className="border-b border-border/60 align-top last:border-0">
                <td className="px-4 py-3 font-medium text-gold">{change.label}</td>
                <td className="px-4 py-3 whitespace-pre-wrap text-foreground-muted">{change.before}</td>
                <td className="px-4 py-3 whitespace-pre-wrap text-foreground">{change.after}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
