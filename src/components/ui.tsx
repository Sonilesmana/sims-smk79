import * as Icons from "lucide-react";
import { clsx } from "clsx";

function Ikon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  const Comp = Cmp ?? Icons.Circle;
  return <Comp className={className} />;
}

export function Card({
  title,
  icon,
  action,
  children,
  className,
}: {
  title?: string;
  icon?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx("rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            {icon && <Ikon name={icon} className="h-4 w-4 text-sky-500" />}
            {title && <h2 className="text-sm font-semibold text-navy-900">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  nilai,
  icon,
  accent = "sky",
}: {
  label: string;
  nilai: string | number;
  icon?: string;
  accent?: "sky" | "navy" | "emerald" | "amber";
}) {
  const warna = {
    sky: "bg-sky-50 text-sky-600",
    navy: "bg-navy-50 text-navy-700",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  }[accent];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-navy-900">{nilai}</p>
        </div>
        {icon && (
          <span className={clsx("grid h-10 w-10 place-items-center rounded-lg", warna)}>
            <Ikon name={icon} className="h-5 w-5" />
          </span>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  text,
  icon = "Inbox",
  action,
}: {
  text: string;
  icon?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
      <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-white text-slate-300 shadow-sm">
        <Ikon name={icon} className="h-6 w-6" />
      </span>
      <p className="text-sm text-slate-500">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-navy-900">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "sky" | "emerald" | "amber" | "red";
}) {
  const toneCls = {
    slate: "bg-slate-100 text-slate-600",
    sky: "bg-sky-100 text-sky-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  }[tone];
  return (
    <span className={clsx("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium", toneCls)}>
      {children}
    </span>
  );
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return <div className="scrollbar-thin overflow-x-auto">{children}</div>;
}
