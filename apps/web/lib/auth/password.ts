import { strongPasswordSchema } from "@faden/validators";

export const PASSWORD_REQUIREMENTS = [
  "At least 8 characters",
  "1 uppercase letter (A–Z)",
  "1 lowercase letter (a–z)",
  "1 number (0–9)",
  "1 special character (!@#$…)",
] as const;

export function validatePasswordStrength(password: string): string | null {
  const result = strongPasswordSchema.safeParse(password);
  return result.success ? null : (result.error.errors[0]?.message ?? "Password is too weak");
}

export function passwordRequirementChecks(password: string) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}
