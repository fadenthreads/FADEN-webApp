import { describe, it, expect } from "vitest";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  confirmed: ["in_progress"],
  in_progress: ["shipped"],
};

function canTransition(from: string, to: string): boolean {
  return (ALLOWED_TRANSITIONS[from] ?? []).includes(to);
}

describe("Order status state machine", () => {
  it("allows confirmed → in_progress", () => { expect(canTransition("confirmed", "in_progress")).toBe(true); });
  it("allows in_progress → shipped", () => { expect(canTransition("in_progress", "shipped")).toBe(true); });
  it("blocks confirmed → shipped (must go through in_progress)", () => { expect(canTransition("confirmed", "shipped")).toBe(false); });
  it("blocks shipped → delivered (admin-only transition)", () => { expect(canTransition("shipped", "delivered")).toBe(false); });
  it("blocks any backward transition", () => { expect(canTransition("in_progress", "confirmed")).toBe(false); });
  it("blocks transitions from terminal states", () => {
    expect(canTransition("delivered", "in_progress")).toBe(false);
    expect(canTransition("cancelled", "confirmed")).toBe(false);
  });
  it("blocks transitions from draft", () => { expect(canTransition("draft", "confirmed")).toBe(false); });
  it("blocks self-transitions", () => {
    expect(canTransition("confirmed", "confirmed")).toBe(false);
    expect(canTransition("in_progress", "in_progress")).toBe(false);
  });
});
