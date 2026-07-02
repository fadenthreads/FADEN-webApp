/** FADEN platform UPI payment destination (Google Pay / any UPI app). */
export const FADEN_UPI = {
  payeeName: "meghana jhadi",
  upiId: "meghanajhadi28@oksbi",
  bankName: "State Bank of India",
  qrImagePath: "/payments/faden-upi-qr.png",
} as const;

export function isUpiPaymentEnabled(): boolean {
  return Boolean(FADEN_UPI.upiId);
}

export function buildUpiDeepLink(amountInr: number, note?: string): string {
  const params = new URLSearchParams({
    pa: FADEN_UPI.upiId,
    pn: FADEN_UPI.payeeName,
    am: amountInr.toFixed(2),
    cu: "INR",
  });
  if (note) {
    params.set("tn", note.slice(0, 80));
  }
  return `upi://pay?${params.toString()}`;
}

export function buildUpiWebLink(amountInr: number, note?: string): string {
  return buildUpiDeepLink(amountInr, note);
}
