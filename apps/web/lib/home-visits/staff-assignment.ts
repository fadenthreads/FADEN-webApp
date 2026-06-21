import type { OwnerStaffMember } from "@/lib/dashboard/boutique-staff";
import type { MeasurementAssistantGender } from "@/data/measurement-fields";

export function pickStaffForHomeVisit(
  staff: OwnerStaffMember[],
  preference: MeasurementAssistantGender,
): OwnerStaffMember | null {
  const eligible = staff.filter((member) => member.isActive && member.canDoHomeVisits);
  if (!eligible.length) return null;

  if (preference === "female" || preference === "male") {
    const genderMatch = eligible.filter((member) => member.gender === preference);
    if (genderMatch.length) return genderMatch[0];
  }

  return eligible[0];
}
