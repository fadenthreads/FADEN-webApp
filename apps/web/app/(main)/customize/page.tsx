import { Suspense } from "react";
import { CustomizeWizard } from "@/components/customize/customize-wizard";
import { CustomizeAuthGate } from "@/components/customize/customize-auth-gate";

export const metadata = {
  title: "Customize Your Outfit — FADEN",
  description: "Design your dream outfit and get matched with the best boutiques.",
};

export default function CustomizePage() {
  return (
    <div className="faden-page-glow min-h-[calc(100vh-120px)] px-4 py-10 lg:px-12">
      <div className="mx-auto max-w-container">
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-gold">CUSTOMIZATION</p>
          <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">
            Design Your Dream Outfit
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-foreground-muted">
            Category → inspiration → fabric → measurements → delivery → suggested boutiques →
            quotation → production → delivery.
          </p>
        </header>
        <Suspense fallback={<div className="text-center text-foreground-muted">Loading…</div>}>
          <CustomizeAuthGate>
            <CustomizeWizard />
          </CustomizeAuthGate>
        </Suspense>
      </div>
    </div>
  );
}
