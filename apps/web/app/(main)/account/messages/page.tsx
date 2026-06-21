import { AccountSectionHeader } from "@/components/account/account-section-header";
import { MessagesPanel } from "@/components/dashboard/messages-panel";
import { PremiumCard } from "@/components/ui/premium-card";
import {
  listConversationMessages,
  listCustomerConversations,
} from "@/lib/customization/queries";
import { requireAccountUser } from "@/lib/account/require-account-user";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "Messages — FADEN",
  description: "Chat with boutiques about your orders.",
};

export const dynamic = "force-dynamic";

export default async function AccountMessagesPage() {
  const { user, supabase } = await requireAccountUser("/account/messages");

  let conversations: Awaited<ReturnType<typeof listCustomerConversations>> = [];
  let messagesByConversation: Record<
    string,
    Awaited<ReturnType<typeof listConversationMessages>>
  > = {};
  let error: string | null = null;

  if (isWebSupabaseConfigured()) {
    try {
      conversations = await listCustomerConversations(supabase, user.id);
      await Promise.all(
        conversations.map(async (conversation) => {
          messagesByConversation[conversation.id] = await listConversationMessages(
            supabase,
            conversation.id,
          );
        }),
      );
    } catch (err) {
      error = err instanceof Error ? err.message : "Could not load messages";
      conversations = [];
      messagesByConversation = {};
    }
  }

  return (
    <div>
      <AccountSectionHeader
        title="Messages"
        description="Chat with boutiques about your customization requests and orders."
      />
      {error && (
        <PremiumCard className="mb-6 border-amber-500/30 bg-amber-500/5" hover={false}>
          <p className="text-sm text-amber-200">{error}</p>
        </PremiumCard>
      )}
      <MessagesPanel
        mode="customer"
        conversations={conversations}
        initialMessages={messagesByConversation}
        embedded
      />
    </div>
  );
}
