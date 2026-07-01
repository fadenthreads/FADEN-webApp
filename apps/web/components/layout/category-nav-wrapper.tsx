import { DiscoveryFilterBar } from "./discovery-filter-bar";
import { CategoryNav } from "./category-nav";

export function CategoryNavWrapper() {
  return (
    <>
      <DiscoveryFilterBar />
      <CategoryNav outfitsRowOnly />
    </>
  );
}
