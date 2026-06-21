interface ReferenceImageGalleryProps {
  images: string[];
  title?: string;
}

export function ReferenceImageGallery({ images, title }: ReferenceImageGalleryProps) {
  if (!images.length) return null;

  return (
    <div>
      {title && <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted/70">{title}</p>}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((src, index) => (
          <li
            key={`${index}-${src.slice(0, 32)}`}
            className="overflow-hidden rounded-lg border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Reference ${index + 1}`}
              className="aspect-square w-full cursor-pointer object-cover transition-opacity hover:opacity-90"
              onClick={() => window.open(src, "_blank", "noopener,noreferrer")}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
