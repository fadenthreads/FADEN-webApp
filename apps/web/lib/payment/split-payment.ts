export type PaymentPhase = "deposit" | "balance";

export const MAX_ADVANCE_PERCENT = 40;

export function getDefaultAdvancePercent(fabricSource: string | null | undefined): number {
  return fabricSource === "customer" ? 0 : MAX_ADVANCE_PERCENT;
}

export function computeDepositAmount(total: number, advancePercent: number): number {
  const capped = Math.min(Math.max(advancePercent, 0), MAX_ADVANCE_PERCENT);
  if (capped <= 0 || total <= 0) return 0;
  return Math.round((total * capped) / 100);
}

export function computeBalanceAmount(total: number, advancePercent: number): number {
  return Math.max(0, total - computeDepositAmount(total, advancePercent));
}

export interface CapturedPaymentSlice {
  amount: number;
  metadata?: { phase?: string } | null;
}

export interface OutstandingPayment {
  phase: PaymentPhase;
  dueAmount: number;
  advancePercent: number;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
}

function readPhase(metadata: CapturedPaymentSlice["metadata"]): PaymentPhase | null {
  const phase = metadata?.phase;
  return phase === "deposit" || phase === "balance" ? phase : null;
}

export function resolveOutstandingPayment(params: {
  total: number;
  advancePercent: number;
  orderStatus: string;
  capturedPayments: CapturedPaymentSlice[];
}): OutstandingPayment | null {
  const { total, orderStatus, capturedPayments } = params;
  const advancePercent = Math.min(Math.max(params.advancePercent, 0), MAX_ADVANCE_PERCENT);
  const depositAmount = computeDepositAmount(total, advancePercent);
  const balanceAmount = computeBalanceAmount(total, advancePercent);
  const capturedTotal = capturedPayments.reduce((sum, payment) => sum + payment.amount, 0);

  if (total > 0 && capturedTotal >= total - 0.01) return null;

  const depositPaid =
    depositAmount <= 0 ||
    capturedPayments.some(
      (payment) => readPhase(payment.metadata) === "deposit" || payment.amount >= depositAmount - 0.01,
    );

  const balancePaid = capturedPayments.some((payment) => readPhase(payment.metadata) === "balance");

  if (orderStatus === "confirmed" && !depositPaid && depositAmount > 0) {
    return {
      phase: "deposit",
      dueAmount: depositAmount,
      advancePercent,
      totalAmount: total,
      depositAmount,
      balanceAmount,
    };
  }

  if (orderStatus === "shipped" && depositPaid && !balancePaid && balanceAmount > 0) {
    const remaining = Math.max(0, total - capturedTotal);
    return {
      phase: "balance",
      dueAmount: remaining > 0 ? remaining : balanceAmount,
      advancePercent,
      totalAmount: total,
      depositAmount,
      balanceAmount,
    };
  }

  return null;
}

export function paymentPhaseLabel(phase: PaymentPhase): string {
  return phase === "deposit" ? "Advance payment" : "Balance payment";
}
