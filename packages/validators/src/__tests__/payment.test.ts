import { describe, it, expect } from "vitest";
import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
  strongPasswordSchema,
  loginSchema,
  signupSchema,
} from "../index";

describe("createPaymentOrderSchema", () => {
  it("accepts valid orderId", () => {
    expect(createPaymentOrderSchema.safeParse({ orderId: "123e4567-e89b-12d3-a456-426614174000" }).success).toBe(true);
  });
  it("accepts optional phase", () => {
    const result = createPaymentOrderSchema.safeParse({ orderId: "123e4567-e89b-12d3-a456-426614174000", phase: "deposit" });
    expect(result.success).toBe(true);
    expect(result.data?.phase).toBe("deposit");
  });
  it("rejects invalid phase", () => {
    expect(createPaymentOrderSchema.safeParse({ orderId: "123e4567-e89b-12d3-a456-426614174000", phase: "full" }).success).toBe(false);
  });
  it("rejects non-UUID orderId", () => {
    expect(createPaymentOrderSchema.safeParse({ orderId: "not-a-uuid" }).success).toBe(false);
  });
});

describe("verifyPaymentSchema — mock field removed", () => {
  it("accepts valid paymentId without mock field", () => {
    expect(verifyPaymentSchema.safeParse({ paymentId: "123e4567-e89b-12d3-a456-426614174000" }).success).toBe(true);
  });
  it("silently strips unknown mock field", () => {
    const result = verifyPaymentSchema.safeParse({ paymentId: "123e4567-e89b-12d3-a456-426614174000", mock: true });
    expect(result.success).toBe(true);
    expect((result.data as Record<string, unknown>)?.mock).toBeUndefined();
  });
  it("rejects missing paymentId", () => {
    expect(verifyPaymentSchema.safeParse({}).success).toBe(false);
  });
});

describe("strongPasswordSchema", () => {
  it("accepts a strong password", () => { expect(strongPasswordSchema.safeParse("Str0ng!Pass").success).toBe(true); });
  it("rejects password without uppercase", () => { expect(strongPasswordSchema.safeParse("str0ng!pass").success).toBe(false); });
  it("rejects password without number", () => { expect(strongPasswordSchema.safeParse("Strongpass!").success).toBe(false); });
  it("rejects password without special character", () => { expect(strongPasswordSchema.safeParse("Str0ngPass1").success).toBe(false); });
  it("rejects password shorter than 8 characters", () => { expect(strongPasswordSchema.safeParse("S1!aB").success).toBe(false); });
});

describe("loginSchema", () => {
  it("normalizes email to lowercase and trimmed", () => {
    const result = loginSchema.safeParse({ email: "  Test@Example.COM  ", password: "secret" });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("test@example.com");
  });
  it("rejects invalid email", () => { expect(loginSchema.safeParse({ email: "not-an-email", password: "secret" }).success).toBe(false); });
});

describe("signupSchema", () => {
  it("accepts valid signup input", () => {
    expect(signupSchema.safeParse({ fullName: "Test User", email: "test@example.com", password: "Str0ng!Pass", role: "customer" }).success).toBe(true);
  });
  it("defaults role to customer", () => {
    const result = signupSchema.safeParse({ fullName: "Test User", email: "test@example.com", password: "Str0ng!Pass" });
    expect(result.success).toBe(true);
    expect(result.data?.role).toBe("customer");
  });
});
