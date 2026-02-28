import type { PropsWithChildren } from "react";

interface EmptyPlaceholderProps extends PropsWithChildren {
  title: string;
  description: string;
}

export function EmptyPlaceholder({
  title,
  description,
  children
}: EmptyPlaceholderProps) {
  return (
    <div className="rounded-panel border border-dashed border-sand bg-white/80 p-8 text-center shadow-card">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-steel">{description}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}
