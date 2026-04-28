import clsx from "clsx";

export function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "green" | "amber" | "red" | "blue" | "slate" | "violet" }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", {
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200": tone === "green",
      "bg-amber-50 text-amber-700 ring-1 ring-amber-200": tone === "amber",
      "bg-rose-50 text-rose-700 ring-1 ring-rose-200": tone === "red",
      "bg-sky-50 text-sky-700 ring-1 ring-sky-200": tone === "blue",
      "bg-violet-50 text-violet-700 ring-1 ring-violet-200": tone === "violet",
      "bg-slate-100 text-slate-700 ring-1 ring-slate-200": tone === "slate"
    })}>{children}</span>
  );
}
