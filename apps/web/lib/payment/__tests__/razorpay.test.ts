import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createHmac } from "crypto";

const TEST_SECRET = "test_razorpay_secret_key";

beforeEach(() => {
  process.env.RAZORPAY_KEY_SECRET = TEST_SECRET;
  process.env.RAZORPAY_KEY_ID = "rzp_test_123";
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = "rzp_test_123";
});

afterEach(() => {
  delete process.env.RAZORPAY_KEY_SECRET;
  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
});

function makeSignature(orderId: string, paymentId: string, secret: string): string {
  return createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

describe("verifyRazorpaySignature", () => {
  it("accepts a valid signature", async () => {
    const { verifyRazorpaySignature } = await import("../razorpay");
    const signature = makeSignature("order_test123", "pay_test456", TEST_SECRET);
    expect(verifyRazorpaySignature({ orderId: "order_test123", paymentId: "pay_test456", signature })).toBe(true);
  });
  it("rejects a tampered signature", async () => {
    const { verifyRazorpaySignature } = await import("../razorpay");
    expect(verifyRazorpaySignature({ orderId: "order_test123", paymentId: "pay_test456", signature: "tampered" })).toBe(false);
  });
  it("rejects when orderId is swapped (prevents replay attacks)", async () => {
    const { verifyRazorpaySignature } = await import("../razorpay");
    const signature = makeSignature("order_test123", "pay_test456", TEST_SECRET);
    expect(verifyRazorpaySignature({ orderId: "pay_test456", paymentId: "order_test123", signature })).toBe(false);
  });
  it("returns false when secret is not configured", async () => {
    delete process.env.RAZORPAY_KEY_SECRET;
    const { verifyRazorpaySignature } = await import("../razorpay");
    expect(verifyRazorpaySignature({ orderId: "order_test123", paymentId: "pay_test456", signature: "any" })).toBe(false);
  });
});

describe("isRazorpayConfigured", () => {
  it("returns true when all keys are set", async () => {
    const { isRazorpayConfigured } = await import("../razorpay");
    expect(isRazorpayConfigured()).toBe(true);
  });
  it("returns false when keys are missing", async () => {
    delete process.env.RAZORPAY_KEY_ID;
    const { isRazorpayConfigured } = await import("../razorpay");
    expect(isRazorpayConfigured()).toBe(false);
  });
});

describe("amountToPaise", () => {
  it("converts INR to paise correctly", async () => {
    const { amountToPaise } = await import("../razorpay");
    expect(amountToPaise(100)).toBe(10000);
    expect(amountToPaise(1)).toBe(100);
    expect(amountToPaise(99.99)).toBe(9999);
  });
});
