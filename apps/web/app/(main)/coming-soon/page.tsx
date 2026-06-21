import Link from "next/link";
import { Button, EmptyState } from "@faden/ui";

export default function ComingSoonPage() {
  return (
    <EmptyState
      title="Coming Soon"
      description="We're stitching something beautiful. Stay tuned."
    >
      <Button asChild>
        <Link href="/">Back to Home</Link>
      </Button>
    </EmptyState>
  );
}
