import { Header } from "@/components/layout/header";
import { CategoryNavWrapper } from "@/components/layout/category-nav-wrapper";
import { Footer } from "@/components/layout/footer";
import { ChatFab } from "@/components/layout/chat-fab";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ScrollLockRecovery } from "@/components/layout/scroll-lock-recovery";
import { DiscoveryProvider } from "@/components/discovery/discovery-context";
import { SavedItemsProvider } from "@/components/saved-items/saved-items-context";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <DiscoveryProvider>
      <SavedItemsProvider>
        <ScrollLockRecovery />
        <Header />
        <CategoryNavWrapper />
        <main className="pb-[calc(var(--bottom-nav-offset)+env(safe-area-inset-bottom,0px))]">{children}</main>
        <Footer />
        <ChatFab />
        <BottomNav />
      </SavedItemsProvider>
    </DiscoveryProvider>
  );
}
