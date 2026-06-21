import { Header } from "@/components/layout/header";
import { CategoryNavWrapper } from "@/components/layout/category-nav-wrapper";
import { Footer } from "@/components/layout/footer";
import { ChatFab } from "@/components/layout/chat-fab";
import { DiscoveryProvider } from "@/components/discovery/discovery-context";
import { SavedItemsProvider } from "@/components/saved-items/saved-items-context";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <DiscoveryProvider>
      <SavedItemsProvider>
        <Header />
        <CategoryNavWrapper />
        <main>{children}</main>
        <Footer />
        <ChatFab />
      </SavedItemsProvider>
    </DiscoveryProvider>
  );
}
