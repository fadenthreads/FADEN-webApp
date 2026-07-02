import { AboutPageContent } from "@/components/about/about-page-content";
import { createStaticPageMetadata } from "@/lib/content/create-static-page";

export const metadata = createStaticPageMetadata("about");
export default function AboutPage() {
  return <AboutPageContent />;
}
