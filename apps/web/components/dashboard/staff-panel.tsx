"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@faden/ui";
import { Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { PremiumCard } from "@/components/ui/premium-card";
import {
  addBoutiqueStaffMember,
  removeBoutiqueStaffMember,
  updateBoutiqueStaffMemberAction,
} from "@/actions/boutique-staff";
import type { OwnerStaffMember } from "@/lib/dashboard/boutique-staff";
import { STAFF_SETUP_MESSAGE } from "@/lib/dashboard/boutique-staff";
import { STAFF_PAY_PERIOD_LABELS } from "@/lib/boutique/staff-roles";
import {
  EMPTY_STAFF_FORM,
  StaffForm,
  type StaffFormValues,
} from "@/components/dashboard/staff-form";

function staffToFormValues(member: OwnerStaffMember): StaffFormValues {
  return {
    fullName: member.fullName,
    role: member.role ?? "",
    phone: member.phone ?? "",
    email: member.email ?? "",
    payAmount: member.payAmount,
    payPeriod: member.payPeriod,
    notes: member.notes ?? "",
    gender: member.gender ?? "",
    canDoHomeVisits: member.canDoHomeVisits,
  };
}

function formatPay(member: OwnerStaffMember): string {
  const period = STAFF_PAY_PERIOD_LABELS[member.payPeriod] ?? member.payPeriod;
  return `${member.payAmount} · ${period}`;
}

interface StaffPanelProps {
  boutiqueId: string;
  staff: OwnerStaffMember[];
  staffTableAvailable: boolean;
}

export function StaffPanel({ boutiqueId, staff, staffTableAvailable }: StaffPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<StaffFormValues>(EMPTY_STAFF_FORM);

  const activeStaff = staff.filter((member) => member.isActive);
  const inactiveStaff = staff.filter((member) => !member.isActive);

  function openAddForm() {
    if (!staffTableAvailable) {
      setError(STAFF_SETUP_MESSAGE);
      return;
    }
    setEditingId(null);
    setFormValues(EMPTY_STAFF_FORM);
    setError(null);
    setMessage(null);
    setShowForm(true);
  }

  function openEditForm(member: OwnerStaffMember) {
    setEditingId(member.id);
    setFormValues(staffToFormValues(member));
    setError(null);
    setMessage(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormValues(EMPTY_STAFF_FORM);
  }

  function handleSave() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const payload = {
        boutiqueId,
        fullName: formValues.fullName,
        role: formValues.role || undefined,
        phone: formValues.phone || undefined,
        email: formValues.email || undefined,
        payAmount: formValues.payAmount,
        payPeriod: formValues.payPeriod,
        notes: formValues.notes || undefined,
        gender: formValues.gender || undefined,
        canDoHomeVisits: formValues.canDoHomeVisits,
      };

      const result = editingId
        ? await updateBoutiqueStaffMemberAction({ ...payload, id: editingId })
        : await addBoutiqueStaffMember(payload);

      if (!result.ok) {
        setError(result.error ?? "Failed to save staff member");
        return;
      }

      closeForm();
      setMessage(editingId ? "Staff member updated." : "Staff member added.");
      router.refresh();
    });
  }

  function handleRemove(staffId: string, name: string) {
    if (!window.confirm(`Remove ${name} from your staff list?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await removeBoutiqueStaffMember({ boutiqueId, staffId });
      if (!result.ok) {
        setError(result.error ?? "Failed to remove staff member");
        return;
      }
      if (editingId === staffId) closeForm();
      setMessage("Staff member removed.");
      router.refresh();
    });
  }

  function handleToggleActive(member: OwnerStaffMember) {
    setError(null);
    startTransition(async () => {
      const result = await updateBoutiqueStaffMemberAction({
        boutiqueId,
        id: member.id,
        isActive: !member.isActive,
      });
      if (!result.ok) {
        setError(result.error ?? "Failed to update status");
        return;
      }
      router.refresh();
    });
  }

  function renderStaffCard(member: OwnerStaffMember) {
    return (
      <li
        key={member.id}
        className={`rounded-xl border px-4 py-4 ${
          member.isActive ? "border-gold/15 bg-background-elevated" : "border-border/60 opacity-70"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
              <UserRound className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="font-semibold">{member.fullName}</p>
              <p className="text-sm text-gold">{member.role || "Team member"}</p>
              <p className="mt-1 text-sm font-medium">{formatPay(member)}</p>
              {(member.phone || member.email) && (
                <p className="mt-2 text-xs text-foreground-muted">
                  {[member.phone, member.email].filter(Boolean).join(" · ")}
                </p>
              )}
              {member.notes && (
                <p className="mt-2 text-xs text-foreground-muted">{member.notes}</p>
              )}
              <p className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                {member.gender && (
                  <span className="rounded-full border border-border px-2 py-0.5 capitalize text-foreground-muted">
                    {member.gender}
                  </span>
                )}
                {member.canDoHomeVisits && (
                  <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-gold">
                    Home visits
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="luxury-outline" onClick={() => openEditForm(member)}>
              <Pencil className="mr-1 h-3.5 w-3.5" aria-hidden />
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="luxury-outline"
              onClick={() => handleToggleActive(member)}
              disabled={pending}
            >
              {member.isActive ? "Mark inactive" : "Mark active"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="luxury-outline"
              onClick={() => handleRemove(member.id, member.fullName)}
              disabled={pending}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" aria-hidden />
              Remove
            </Button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <div className="space-y-4">
      <PremiumCard hover={false}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-gold">Staff Management</h3>
            <p className="mt-2 text-sm text-foreground-muted">
              Add your team — roles, contact details, and pay. Only you can see this in the dashboard.
            </p>
          </div>
          <Button type="button" variant="luxury" size="sm" onClick={openAddForm} disabled={!staffTableAvailable}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />
            Add staff
          </Button>
        </div>
        {!staffTableAvailable && (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground-muted">
            {STAFF_SETUP_MESSAGE}
          </p>
        )}
      </PremiumCard>

      {showForm && (
        <PremiumCard hover={false} className="border-gold/30">
          <h4 className="font-semibold text-gold">{editingId ? "Edit staff member" : "Add staff member"}</h4>
          <div className="mt-4">
            <StaffForm
              values={formValues}
              onChange={setFormValues}
              onSubmit={handleSave}
              onCancel={closeForm}
              submitLabel={editingId ? "Save changes" : "Add to team"}
              pending={pending}
            />
          </div>
        </PremiumCard>
      )}

      <PremiumCard hover={false}>
        <h4 className="font-semibold text-gold">Your team ({activeStaff.length} active)</h4>
        {staff.length === 0 ? (
          <p className="mt-4 text-sm text-foreground-muted">
            No staff added yet. Use Add staff to record tailors, designers, and support team pay.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {activeStaff.map(renderStaffCard)}
            {inactiveStaff.length > 0 && (
              <>
                <li className="pt-2 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                  Inactive
                </li>
                {inactiveStaff.map(renderStaffCard)}
              </>
            )}
          </ul>
        )}
      </PremiumCard>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {message && <p className="text-sm text-gold">{message}</p>}
    </div>
  );
}
