interface AccountSectionHeaderProps {
  title: string;
  description: string;
}

export function AccountSectionHeader({ title, description }: AccountSectionHeaderProps) {
  return (
    <header className="mb-6">
      <h2 className="font-display text-2xl font-semibold text-gold">{title}</h2>
      <p className="mt-2 text-sm text-foreground-muted">{description}</p>
    </header>
  );
}
