/** Reference-counted body scroll lock — prevents stuck overflow after overlays close. */

let lockCount = 0;
let savedOverflow = "";
let savedPaddingRight = "";

export function lockBodyScroll(): () => void {
  if (typeof document === "undefined") {
    return () => undefined;
  }

  lockCount += 1;

  if (lockCount === 1) {
    savedOverflow = document.body.style.overflow;
    savedPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  return () => {
    if (typeof document === "undefined") return;

    lockCount = Math.max(0, lockCount - 1);

    if (lockCount === 0) {
      document.body.style.overflow = savedOverflow;
      document.body.style.paddingRight = savedPaddingRight;
    }
  };
}

/** Force-clear scroll lock (safety net on route change). */
export function resetBodyScrollLock(): void {
  if (typeof document === "undefined") return;
  lockCount = 0;
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
}
