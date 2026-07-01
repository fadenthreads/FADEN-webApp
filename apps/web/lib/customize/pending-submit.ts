const PENDING_SUBMIT_KEY = "faden:pending-customize-submit";

export function setPendingCustomizeSubmit(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) {
    window.sessionStorage.setItem(PENDING_SUBMIT_KEY, "1");
  } else {
    window.sessionStorage.removeItem(PENDING_SUBMIT_KEY);
  }
}

export function consumePendingCustomizeSubmit(): boolean {
  if (typeof window === "undefined") return false;
  const pending = window.sessionStorage.getItem(PENDING_SUBMIT_KEY) === "1";
  if (pending) window.sessionStorage.removeItem(PENDING_SUBMIT_KEY);
  return pending;
}
