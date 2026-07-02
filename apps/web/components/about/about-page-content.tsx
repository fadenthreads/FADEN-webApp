import { StaticPageView } from "@/components/static/static-page-view";
import { CoreAim } from "@/components/landing/core-aim";
import { ProblemsWeSolve } from "@/components/landing/problems-we-solve";
import { getStaticPage } from "@/lib/content/static-pages";

export function AboutPageContent() {
  return (
    <>
      <StaticPageView page={getStaticPage("about")} />
      <CoreAim />
      <ProblemsWeSolve />
    </>
  );
}
