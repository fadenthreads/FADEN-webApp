import { Header } from "@/components/layout/header";
import { CategoryNavWrapper } from "@/components/layout/category-nav-wrapper";
import { Footer } from "@/components/layout/footer";
import { ChatFab } from "@/components/layout/chat-fab";
import { BottomNav } from "@/components/layout/bottom-nav";
import { DiscoveryProvider } from "@/components/discovery/discovery-context";
import { SavedItemsProvider } from "@/components/saved-items/saved-items-context";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <DiscoveryProvider>
      <SavedItemsProvider>
        <Header />
        <CategoryNavWrapper />
        <main className="pb-24">{children}</main>
        <Footer />
        <ChatFab />
        <BottomNav />
      </SavedItemsProvider>
    </DiscoveryProvider>
  );
}
