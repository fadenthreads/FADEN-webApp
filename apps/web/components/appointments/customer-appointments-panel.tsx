"use client";

import Link from "next/link";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import {
  appointmentJoinWindow,
  formatAppointmentWhen,
  type FittingAppointmentSummary,
} from "@/lib/appointments/queries";

interface JoinLiveFittingButtonProps {
  appointment: {
    scheduled_start: string;
    scheduled_end: string;
    daily_room_url: string | null;
    status: string;
  };
  className?: string;
}

export function JoinLiveFittingButton({ appointment, className }: JoinLiveFittingButtonProps) {
  const { isActive, isPast } = appointmentJoinWindow(
    appointment.scheduled_start,
    appointment.scheduled_end,
  );

  if (!appointment.daily_room_url || appointment.status === "cancelled") {
    return null;
  }

  if (isPast) {
    return (
      <Button type="button" variant="luxury-outline" disabled className={className}>
        Fitting ended
      </Button>
    );
  }

  if (isActive) {
    return (
      <Button asChild variant="luxury" className={className}>
        <a href={appointment.daily_room_url} target="_blank" rel="noopener noreferrer">
          Join video call
        </a>
      </Button>
    );
  }

  return (
    <Button asChild variant="luxury-outline" className={className}>
      <a href={appointment.daily_room_url} target="_blank" rel="noopener noreferrer">
        Open meeting link
      </a>
    </Button>
  );
}

interface CustomerAppointmentsPanelProps {
  appointments: FittingAppointmentSummary[];
  embedded?: boolean;
}

export function CustomerAppointmentsPanel({
  appointments,
  embedded = false,
}: CustomerAppointmentsPanelProps) {
  if (appointments.length === 0) {
    return (
      <PremiumCard hover={false}>
        {!embedded && (
          <>
            <p className="text-xs font-semibold tracking-[0.25em] text-gold">VIDEO FITTINGS</p>
            <h2 className="mt-2 font-display text-xl font-semibold">Upcoming appointments</h2>
          </>
        )}
        <p className={embedded ? "text-sm text-foreground-muted" : "mt-2 text-sm text-foreground-muted"}>
          No video fittings scheduled yet. Book a slot from a boutique profile or during customization.
        </p>
        <Button asChild variant="luxury-outline" className="mt-4">
          <Link href="/">Browse boutiques</Link>
        </Button>
      </PremiumCard>
    );
  }

  return (
    <div>
      {!embedded && (
        <>
          <p className="text-xs font-semibold tracking-[0.25em] text-gold">VIDEO FITTINGS</p>
          <h2 className="mt-2 font-display text-xl font-semibold">Upcoming appointments</h2>
        </>
      )}
      <div className={embedded ? "space-y-4" : "mt-4 space-y-4"}>
        {appointments.map((appointment) => {
          const boutiqueName = appointment.boutique?.name ?? "Boutique";
          const boutiqueSlug = appointment.boutique?.slug ?? null;

          return (
            <PremiumCard key={appointment.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" hover={false}>
              <div>
                <p className="font-medium text-foreground">{boutiqueName}</p>
                <p className="mt-1 text-sm text-foreground-muted">
                  {formatAppointmentWhen(appointment.scheduled_start, appointment.scheduled_end)}
                </p>
                <p className="mt-1 text-xs capitalize text-foreground-muted">
                  Status: {appointment.status}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <JoinLiveFittingButton appointment={appointment} />
                {boutiqueSlug && (
                  <Button asChild variant="luxury-outline">
                    <Link href={`/boutique/${boutiqueSlug}`}>Boutique</Link>
                  </Button>
                )}
              </div>
            </PremiumCard>
          );
        })}
      </div>
    </div>
  );
}
