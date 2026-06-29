export default function SearchLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 animate-pulse rounded-full bg-background-elevated" />
        <div className="absolute bottom-0 left-1/2 h-8 w-8 -translate-x-1/2 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    </div>
  );
}
