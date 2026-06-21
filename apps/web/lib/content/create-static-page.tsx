import type { Metadata } from "next";
import { StaticPageView } from "@/components/static/static-page-view";
import { getStaticPage, staticPageMetadata, type StaticPageSlug } from "@/lib/content/static-pages";

export function createStaticPage(slug: StaticPageSlug) {
  function Page() {
    return <StaticPageView page={getStaticPage(slug)} />;
  }

  return Page;
}

export function createStaticPageMetadata(slug: StaticPageSlug): Metadata {
  return staticPageMetadata(slug);
}
