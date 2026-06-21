"use client";

import Link from "next/link";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { JoinLiveFittingButton } from "@/components/appointments/customer-appointments-panel";
import {
  formatAppointmentWhen,
  type TailorAppointmentSummary,
} from "@/lib/appointments/queries";

interface OwnerAppointmentsPanelProps {
  appointments: TailorAppointmentSummary[];
}

export function OwnerAppointmentsPanel({ appointments }: OwnerAppointmentsPanelProps) {
  if (appointments.length === 0) {
    return (
      <PremiumCard hover={false}>
        <p className="text-xs font-semibold tracking-[0.25em] text-gold">VIDEO FITTINGS</p>
        <h2 className="mt-2 font-display text-xl font-semibold">Upcoming video measurements</h2>
        <p className="mt-2 text-sm text-foreground-muted">
          When you schedule a video measurement from a customization request, it appears here with the
          Cal.com join link.
        </p>
        <Button asChild variant="luxury-outline" className="mt-4">
          <Link href="/dashboard?panel=customization">View customization requests</Link>
        </Button>
      </PremiumCard>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.25em] text-gold">VIDEO FITTINGS</p>
      <h2 className="mt-2 font-display text-xl font-semibold">Upcoming video measurements</h2>
      <div className="mt-4 space-y-4">
        {appointments.map((appointment) => {
          const customerName =
            appointment.customer?.name ??
            (appointment.metadata?.customerName as string | undefined) ??
            "Customer";

          return (
            <PremiumCard
              key={appointment.id}
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              hover={false}
            >
              <div>
                <p className="font-medium text-foreground">{customerName}</p>
                {appointment.customer?.email && (
                  <p className="mt-1 text-xs text-foreground-muted">{appointment.customer.email}</p>
                )}
                <p className="mt-1 text-sm text-foreground-muted">
                  {formatAppointmentWhen(appointment.scheduled_start, appointment.scheduled_end)}
                </p>
                <p className="mt-1 text-xs capitalize text-foreground-muted">
                  Status: {appointment.status}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <JoinLiveFittingButton appointment={appointment} />
                {appointment.cal_booking_uid && appointment.customization_request_id && (
                  <Button asChild variant="luxury-outline">
                    <Link
                      href={`/dashboard/requests/${appointment.customization_request_id}/schedule-video?reschedule=1`}
                    >
                      Reschedule
                    </Link>
                  </Button>
                )}
                {appointment.customization_request_id && (
                  <Button asChild variant="luxury-outline">
                    <Link href={`/dashboard/requests/${appointment.customization_request_id}`}>
                      View request
                    </Link>
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
