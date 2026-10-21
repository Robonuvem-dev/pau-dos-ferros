import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="bg-hero text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-3xl opacity-90">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
