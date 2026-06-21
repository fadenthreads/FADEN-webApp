"use client";

import { useMemo } from "react";
import { Button } from "@faden/ui";
import type { StaffPayPeriod } from "@/lib/dashboard/boutique-staff";
import {
  BOUTIQUE_STAFF_ROLE_SUGGESTIONS,
  STAFF_PAY_PERIOD_LABELS,
} from "@/lib/boutique/staff-roles";

const STAFF_FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-gold/25 bg-black px-3 py-2 text-sm text-white placeholder:text-white/45 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30";

export interface StaffFormValues {
  fullName: string;
  role: string;
  phone: string;
  email: string;
  payAmount: string;
  payPeriod: StaffPayPeriod;
  notes: string;
  gender: "" | "female" | "male";
  canDoHomeVisits: boolean;
}

export const EMPTY_STAFF_FORM: StaffFormValues = {
  fullName: "",
  role: "",
  phone: "",
  email: "",
  payAmount: "",
  payPeriod: "monthly",
  notes: "",
  gender: "",
  canDoHomeVisits: false,
};

interface StaffFormProps {
  values: StaffFormValues;
  onChange: (values: StaffFormValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  pending: boolean;
}

export function StaffForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  pending,
}: StaffFormProps) {
  function patch(partial: Partial<StaffFormValues>) {
    onChange({ ...values, ...partial });
  }

  const roleSuggestions = useMemo(() => {
    const needle = values.role.trim().toLowerCase();
    return BOUTIQUE_STAFF_ROLE_SUGGESTIONS.filter(
      (role) => !needle || role.toLowerCase().includes(needle),
    );
  }, [values.role]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="text-foreground-muted">Full name</span>
          <input
            required
            value={values.fullName}
            onChange={(e) => patch({ fullName: e.target.value })}
            className={STAFF_FIELD_CLASS}
            placeholder="Priya Sharma"
          />
        </label>
        <label className="block text-sm">
          <span className="text-foreground-muted">Role</span>
          <input
            value={values.role}
            onChange={(e) => patch({ role: e.target.value })}
            list="staff-role-suggestions"
            className={STAFF_FIELD_CLASS}
            placeholder="Master tailor"
          />
          <datalist id="staff-role-suggestions">
            {roleSuggestions.map((role) => (
              <option key={role} value={role} />
            ))}
          </datalist>
        </label>
        <label className="block text-sm">
          <span className="text-foreground-muted">Phone (optional)</span>
          <input
            value={values.phone}
            onChange={(e) => patch({ phone: e.target.value })}
            className={STAFF_FIELD_CLASS}
            placeholder="+91 98765 43210"
          />
        </label>
        <label className="block text-sm">
          <span className="text-foreground-muted">Email (optional)</span>
          <input
            type="email"
            value={values.email}
            onChange={(e) => patch({ email: e.target.value })}
            className={STAFF_FIELD_CLASS}
            placeholder="name@example.com"
          />
        </label>
        <label className="block text-sm">
          <span className="text-foreground-muted">Pay amount</span>
          <input
            required
            value={values.payAmount}
            onChange={(e) => patch({ payAmount: e.target.value })}
            className={STAFF_FIELD_CLASS}
            placeholder="₹18,000"
          />
        </label>
        <label className="block text-sm">
          <span className="text-foreground-muted">Pay period</span>
          <select
            value={values.payPeriod}
            onChange={(e) => patch({ payPeriod: e.target.value as StaffPayPeriod })}
            className={STAFF_FIELD_CLASS}
          >
            {(Object.keys(STAFF_PAY_PERIOD_LABELS) as StaffPayPeriod[]).map((key) => (
              <option key={key} value={key} className="bg-black text-white">
                {STAFF_PAY_PERIOD_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-foreground-muted">Gender (for home visit matching)</span>
          <select
            value={values.gender}
            onChange={(e) => patch({ gender: e.target.value as StaffFormValues["gender"] })}
            className={STAFF_FIELD_CLASS}
          >
            <option value="" className="bg-black text-white">
              Not specified
            </option>
            <option value="female" className="bg-black text-white">
              Female
            </option>
            <option value="male" className="bg-black text-white">
              Male
            </option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={values.canDoHomeVisits}
            onChange={(e) => patch({ canDoHomeVisits: e.target.checked })}
            className="h-4 w-4 accent-gold"
          />
          <span className="text-foreground-muted">Available for home measurement visits</span>
        </label>
      </div>
      {BOUTIQUE_STAFF_ROLE_SUGGESTIONS.length > 0 && (
        <div>
          <p className="text-xs font-medium text-foreground-muted">Role suggestions</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {BOUTIQUE_STAFF_ROLE_SUGGESTIONS.slice(0, 10).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => patch({ role })}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  values.role.toLowerCase() === role.toLowerCase()
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-border text-foreground-muted hover:border-gold/40 hover:text-gold"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}
      <label className="block text-sm">
        <span className="text-foreground-muted">Notes (optional)</span>
        <textarea
          value={values.notes}
          onChange={(e) => patch({ notes: e.target.value })}
          rows={2}
          className={STAFF_FIELD_CLASS}
          placeholder="Skills, shift timings, specialization…"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="luxury"
          disabled={pending || !values.fullName.trim() || !values.payAmount.trim()}
          onClick={onSubmit}
        >
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Button type="button" variant="luxury-outline" disabled={pending} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
