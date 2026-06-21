"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@faden/ui";
import { Home, UserRound } from "lucide-react";
import { PremiumCard } from "@/components/ui/premium-card";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { FormField, TextArea } from "@/components/ui/form-field";
import {
  captureHomeVisitMeasurementsAction,
  completeHomeVisitAction,
  confirmHomeVisit,
} from "@/actions/home-visits";
import { SelfMeasurementFields } from "@/components/measurement/self-measurement-fields";
import type { HomeMeasurementVisit } from "@/lib/home-visits/queries";
import { formatHomeVisitWhen } from "@/lib/home-visits/queries";
import type { OwnerStaffMember } from "@/lib/dashboard/boutique-staff";
import { pickStaffForHomeVisit } from "@/lib/home-visits/staff-assignment";
import {
  EMPTY_SELF_MEASUREMENTS,
  type MeasurementAssistantGender,
  type MeasurementUnit,
  type SelfMeasurements,
} from "@/data/measurement-fields";
import { todayIsoDate } from "@/lib/datetime/format";

interface OwnerHomeVisitActionsProps {
  visit: HomeMeasurementVisit;
  boutiqueId: string;
  staff: OwnerStaffMember[];
}

function isoFromDateTime(date: string, time: string): string | null {
  if (!date || !time) return null;
  const parsed = new Date(`${date}T${time}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function OwnerHomeVisitActions({ visit, boutiqueId, staff }: OwnerHomeVisitActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const defaultStart = visit.confirmedStart ?? visit.requestedStart;
  const defaultEnd = visit.confirmedEnd ?? visit.requestedEnd;
  const startDate = defaultStart.slice(0, 10);
  const startTime = defaultStart.slice(11, 16);

  const [confirmDate, setConfirmDate] = useState(startDate);
  const [confirmTime, setConfirmTime] = useState(startTime);
  const [assignedStaffId, setAssignedStaffId] = useState(visit.assignedStaffId ?? "");
  const [ownerNotes, setOwnerNotes] = useState(visit.ownerNotes ?? "");
  const [measurements, setMeasurements] = useState<SelfMeasurements>(
    visit.capturedMeasurements ?? { ...EMPTY_SELF_MEASUREMENTS },
  );
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>(visit.measurementUnit ?? "in");
  const [saveToCustomer, setSaveToCustomer] = useState(true);
  const [savedLabel, setSavedLabel] = useState("Home visit measurements");

  const suggestedStaff = pickStaffForHomeVisit(staff, visit.assistantGenderPreference);
  const homeStaff = staff.filter((member) => member.isActive && member.canDoHomeVisits);

  function handleConfirm() {
    const confirmedStart = isoFromDateTime(confirmDate, confirmTime);
    if (!confirmedStart) {
      setError("Select a valid date and time.");
      return;
    }
    const end = new Date(new Date(confirmedStart).getTime() + 60 * 60 * 1000).toISOString();

    startTransition(async () => {
      setError(null);
      const result = await confirmHomeVisit({
        boutiqueId,
        visitId: visit.id,
        confirmedStart,
        confirmedEnd: end,
        assignedStaffId: assignedStaffId || suggestedStaff?.id,
        ownerNotes,
        assistantGenderPreference: visit.assistantGenderPreference,
      });
      if (!result.ok) {
        setError(result.error ?? "Failed to confirm");
        return;
      }
      setMessage("Home visit confirmed and staff assigned.");
      router.refresh();
    });
  }

  function handleCapture() {
    startTransition(async () => {
      setError(null);
      const result = await captureHomeVisitMeasurementsAction({
        boutiqueId,
        visitId: visit.id,
        measurements: measurements as unknown as Record<string, string | undefined>,
        measurementUnit,
      });
      if (!result.ok) {
        setError(result.error ?? "Failed to save measurements");
        return;
      }
      setMessage("Customer measurements saved.");
      router.refresh();
    });
  }

  function handleComplete() {
    startTransition(async () => {
      setError(null);
      const result = await completeHomeVisitAction({
        boutiqueId,
        visitId: visit.id,
        saveToCustomerAccount: saveToCustomer,
        savedMeasurementLabel: savedLabel,
      });
      if (!result.ok) {
        setError(result.error ?? "Failed to complete visit");
        return;
      }
      setMessage("Home visit marked as done.");
      router.refresh();
    });
  }

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-gold/20 bg-gold/5 p-4">
      <div className="flex items-start gap-3">
        <Home className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Home measurement visit</p>
          <p className="mt-1 text-sm text-foreground-muted">
            Requested: {formatHomeVisitWhen(visit.requestedStart, visit.requestedEnd)}
          </p>
          {visit.visitAddress && (
            <p className="mt-1 text-sm text-foreground-muted">Address: {visit.visitAddress}</p>
          )}
          {visit.visitLatitude != null && visit.visitLongitude != null && (
            <a
              href={`https://www.google.com/maps?q=${visit.visitLatitude},${visit.visitLongitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-gold hover:text-gold-light"
            >
              Open map pin
            </a>
          )}
          <p className="mt-1 text-xs capitalize text-foreground-muted">Status: {visit.status}</p>
          {visit.assignedStaffName && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
              <UserRound className="h-3.5 w-3.5 text-gold" aria-hidden />
              Assigned: {visit.assignedStaffName}
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {message && <p className="text-sm text-gold">{message}</p>}

      {visit.status === "requested" && (
        <div className="space-y-4 border-t border-border/60 pt-4">
          <p className="text-sm font-medium text-foreground">Confirm session</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Confirmed date">
              <DatePicker value={confirmDate} onChange={setConfirmDate} min={todayIsoDate()} />
            </FormField>
            <FormField label="Confirmed time">
              <TimePicker value={confirmTime} onChange={setConfirmTime} />
            </FormField>
          </div>
          <FormField
            label="Assign staff member"
            hint={
              suggestedStaff
                ? `Suggested: ${suggestedStaff.fullName} (matches ${visit.assistantGenderPreference} preference)`
                : "Mark staff as available for home visits in the Staff panel."
            }
          >
            <select
              className="faden-field"
              value={assignedStaffId || suggestedStaff?.id || ""}
              onChange={(e) => setAssignedStaffId(e.target.value)}
            >
              <option value="">Auto-assign best match</option>
              {homeStaff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.fullName}
                  {member.gender ? ` (${member.gender})` : ""}
                  {member.role ? ` · ${member.role}` : ""}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Notes for your team">
            <TextArea value={ownerNotes} onChange={(e) => setOwnerNotes(e.target.value)} rows={2} />
          </FormField>
          <Button type="button" variant="luxury" size="sm" disabled={pending} onClick={handleConfirm}>
            Confirm home visit
          </Button>
        </div>
      )}

      {(visit.status === "confirmed" || visit.status === "completed") && (
        <div className="space-y-4 border-t border-border/60 pt-4">
          <p className="text-sm font-medium text-foreground">Customer measurements (on visit)</p>
          <SelfMeasurementFields
            values={measurements}
            unit={measurementUnit}
            onValuesChange={setMeasurements}
            onUnitChange={setMeasurementUnit}
          />
          {visit.status === "confirmed" && (
            <>
              <Button type="button" variant="luxury-outline" size="sm" disabled={pending} onClick={handleCapture}>
                Save measurements
              </Button>
              <div className="rounded-xl border border-border bg-background-elevated p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={saveToCustomer}
                    onChange={(e) => setSaveToCustomer(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-gold"
                  />
                  <span className="text-sm text-foreground-muted">
                    Offer to save these measurements to the customer&apos;s account when marking done
                  </span>
                </label>
                {saveToCustomer && (
                  <FormField label="Profile name for customer" className="mt-3">
                    <input
                      className="faden-field"
                      value={savedLabel}
                      onChange={(e) => setSavedLabel(e.target.value)}
                    />
                  </FormField>
                )}
              </div>
              <Button type="button" variant="luxury" size="sm" disabled={pending} onClick={handleComplete}>
                Mark visit as done
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
