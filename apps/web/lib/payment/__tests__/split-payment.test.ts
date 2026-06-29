import { describe, it, expect } from "vitest";
import {
  resolveOutstandingPayment,
  computeDepositAmount,
  computeBalanceAmount,
  getDefaultAdvancePercent,
  MAX_ADVANCE_PERCENT,
} from "../split-payment";

describe("computeDepositAmount", () => {
  it("computes 40% of total", () => { expect(computeDepositAmount(1000, 40)).toBe(400); });
  it("rounds to nearest integer", () => { expect(computeDepositAmount(333, 40)).toBe(133); });
  it("caps advance at MAX_ADVANCE_PERCENT (40%)", () => {
    expect(computeDepositAmount(1000, 60)).toBe(computeDepositAmount(1000, MAX_ADVANCE_PERCENT));
  });
  it("returns 0 when advance is 0", () => { expect(computeDepositAmount(1000, 0)).toBe(0); });
  it("returns 0 when total is 0", () => { expect(computeDepositAmount(0, 40)).toBe(0); });
});

describe("computeBalanceAmount", () => {
  it("returns total minus deposit", () => { expect(computeBalanceAmount(1000, 40)).toBe(600); });
  it("returns full total when advance is 0", () => { expect(computeBalanceAmount(1000, 0)).toBe(1000); });
});

describe("getDefaultAdvancePercent", () => {
  it("returns 0 when customer provides fabric", () => { expect(getDefaultAdvancePercent("customer")).toBe(0); });
  it("returns MAX_ADVANCE_PERCENT when boutique provides fabric", () => { expect(getDefaultAdvancePercent("boutique")).toBe(MAX_ADVANCE_PERCENT); });
  it("returns MAX_ADVANCE_PERCENT for null fabric source", () => { expect(getDefaultAdvancePercent(null)).toBe(MAX_ADVANCE_PERCENT); });
});

describe("resolveOutstandingPayment", () => {
  const base = { total: 1000, advancePercent: 40, capturedPayments: [] };

  it("returns deposit phase when order confirmed with no payments", () => {
    const result = resolveOutstandingPayment({ ...base, orderStatus: "confirmed" });
    expect(result?.phase).toBe("deposit");
    expect(result?.dueAmount).toBe(400);
  });
  it("returns null when order is confirmed but fully paid", () => {
    expect(resolveOutstandingPayment({ ...base, orderStatus: "confirmed", capturedPayments: [{ amount: 1000, metadata: null }] })).toBeNull();
  });
  it("returns balance phase when order shipped and deposit paid", () => {
    const result = resolveOutstandingPayment({ ...base, orderStatus: "shipped", capturedPayments: [{ amount: 400, metadata: { phase: "deposit" } }] });
    expect(result?.phase).toBe("balance");
    expect(result?.dueAmount).toBe(600);
  });
  it("returns null when balance is already paid", () => {
    expect(resolveOutstandingPayment({ ...base, orderStatus: "shipped", capturedPayments: [{ amount: 400, metadata: { phase: "deposit" } }, { amount: 600, metadata: { phase: "balance" } }] })).toBeNull();
  });
  it("returns null when order status is in_progress", () => {
    expect(resolveOutstandingPayment({ ...base, orderStatus: "in_progress" })).toBeNull();
  });
  it("returns null when order is delivered", () => {
    expect(resolveOutstandingPayment({ ...base, orderStatus: "delivered" })).toBeNull();
  });
});
