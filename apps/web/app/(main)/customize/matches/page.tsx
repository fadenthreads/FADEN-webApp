import { Suspense } from "react";
import { SuggestedBoutiquesPage } from "@/components/customize/suggested-boutiques-page";

export const metadata = {
  title: "Suggested Boutiques — FADEN",
  description: "Browse matched boutiques for your custom outfit before submitting.",
};

export default function CustomizeMatchesPage() {
  return (
    <div className="faden-page-glow min-h-[calc(100vh-120px)] px-4 py-10 lg:px-12">
      <div className="mx-auto max-w-container">
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-gold">BOUTIQUE MATCHING</p>
          <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">Suggested Boutiques</h1>
          <p className="mx-auto mt-3 max-w-xl text-foreground-muted">
            Boutiques matched by outfit type and your location. View profiles, choose one studio, or
            request quotations from several and pick your favorite.
          </p>
        </header>
        <Suspense fallback={<div className="text-center text-foreground-muted">Loading…</div>}>
          <SuggestedBoutiquesPage />
        </Suspense>
      </div>
    </div>
  );
}
