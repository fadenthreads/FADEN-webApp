import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listConversationMessages,
  listCustomerConversations,
  listCustomerCustomizationRequests,
  type ConversationSummary,
  type CustomizationRequestSummary,
  type MessageRow,
} from "@/lib/customization/queries";
import { listCustomerOrderHistory, type CustomerOrderHistoryItem } from "@/lib/orders/customer-order-history";
import { listCustomerAppointments, type FittingAppointmentSummary } from "@/lib/appointments/queries";
import { listCustomerPayableOrders, listCustomerPayments, type PayableOrder, type PaymentSummary } from "@/lib/payment/queries";
import { listCustomerQuotations, type QuotationSummary } from "@/lib/quotation/queries";
import { listCustomerReviewableOrders, type ReviewableOrder } from "@/lib/review/queries";

export interface AccountDashboardData {
  customizationRequests: CustomizationRequestSummary[];
  quotations: QuotationSummary[];
  payableOrders: PayableOrder[];
  payments: PaymentSummary[];
  orderHistory: CustomerOrderHistoryItem[];
  reviewableOrders: ReviewableOrder[];
  appointments: FittingAppointmentSummary[];
  conversations: ConversationSummary[];
  messagesByConversation: Record<string, MessageRow[]>;
  loadErrors: string[];
}

async function loadSafe<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T,
  errors: string[],
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    errors.push(
      `${label}: ${error instanceof Error ? error.message : "failed to load"}`,
    );
    return fallback;
  }
}

/** Loads account sections independently so one missing table does not hide everything. */
export async function loadAccountDashboardData(
  supabase: SupabaseClient,
  userId: string,
): Promise<AccountDashboardData> {
  const loadErrors: string[] = [];

  const customizationRequests = await loadSafe(
    "Customization requests",
    () => listCustomerCustomizationRequests(supabase, userId),
    [],
    loadErrors,
  );

  const quotations = await loadSafe(
    "Quotations",
    () => listCustomerQuotations(supabase, userId),
    [],
    loadErrors,
  );

  const payableOrders = await loadSafe(
    "Payable orders",
    () => listCustomerPayableOrders(supabase, userId),
    [],
    loadErrors,
  );

  const payments = await loadSafe(
    "Payments",
    () => listCustomerPayments(supabase, userId),
    [],
    loadErrors,
  );

  const orderHistory = await loadSafe(
    "Order history",
    () => listCustomerOrderHistory(supabase, userId),
    [],
    loadErrors,
  );

  const reviewableOrders = await loadSafe(
    "Reviews",
    () => listCustomerReviewableOrders(supabase, userId),
    [],
    loadErrors,
  );

  const appointments = await loadSafe(
    "Appointments",
    () => listCustomerAppointments(supabase, userId),
    [],
    loadErrors,
  );

  const conversations = await loadSafe(
    "Messages",
    () => listCustomerConversations(supabase, userId),
    [],
    loadErrors,
  );

  const messagesByConversation: Record<string, MessageRow[]> = {};

  await Promise.all(
    conversations.map(async (conversation) => {
      messagesByConversation[conversation.id] = await loadSafe(
        `Messages for ${conversation.id.slice(0, 8)}`,
        () => listConversationMessages(supabase, conversation.id),
        [],
        loadErrors,
      );
    }),
  );

  return {
    customizationRequests,
    quotations,
    payableOrders,
    payments,
    orderHistory,
    reviewableOrders,
    appointments,
    conversations,
    messagesByConversation,
    loadErrors,
  };
}
