import { AlterationBookingForm } from "@/components/alterations/alteration-booking-form";

export const metadata = {
  title: "Book Alterations — FADEN",
  description: "Book garment alterations with the nearest available verified boutique.",
};

export default function AlterationsPage() {
  return (
    <div className="faden-page-glow min-h-[calc(100vh-120px)] px-4 py-10 lg:px-12">
      <div className="mx-auto max-w-container">
        <AlterationBookingForm />
      </div>
    </div>
  );
}
