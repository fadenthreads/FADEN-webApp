import { CareersPageContent } from "@/components/careers/careers-page-content";
import { createStaticPageMetadata } from "@/lib/content/create-static-page";

export const metadata = createStaticPageMetadata("careers");

export default function CareersPage() {
  return <CareersPageContent />;
}
