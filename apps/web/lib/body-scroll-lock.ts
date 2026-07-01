/** Reference-counted body scroll lock — prevents stuck overflow after overlays close. */

let lockCount = 0;
let savedBodyOverflow = "";
let savedBodyPaddingRight = "";
let savedHtmlOverflow = "";

export function lockBodyScroll(): () => void {
  if (typeof document === "undefined") {
    return () => undefined;
  }

  lockCount += 1;

  if (lockCount === 1) {
    savedBodyOverflow = document.body.style.overflow;
    savedBodyPaddingRight = document.body.style.paddingRight;
    savedHtmlOverflow = document.documentElement.style.overflow;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  return () => {
    if (typeof document === "undefined") return;

    lockCount = Math.max(0, lockCount - 1);

    if (lockCount === 0) {
      document.documentElement.style.overflow = savedHtmlOverflow;
      document.body.style.overflow = savedBodyOverflow;
      document.body.style.paddingRight = savedBodyPaddingRight;
      document.body.style.touchAction = "";
    }
  };
}

/** Force-clear scroll lock (safety net on route change). */
export function resetBodyScrollLock(): void {
  if (typeof document === "undefined") return;
  lockCount = 0;
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  document.body.style.touchAction = "";
}
