export function FadenWordmark({ className }: { className?: string }) {
  return (
    <h1
      className={`font-display mt-5 text-[3.5rem] font-bold leading-none tracking-[0.14em] text-navy md:mt-6 md:text-[5rem] lg:text-[6rem] ${className ?? ""}`}
      aria-label="FADEN"
    >
      FADEN
    </h1>
  );
}
