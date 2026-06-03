import type { Analysis } from "@/lib/csp/types"

export function SummaryBar({ analysis }: { analysis: Analysis }) {
  const { counts } = analysis

  const stats = [
    { label: "Explicitly set", value: counts.explicit, color: "var(--color-cat-fetch)" },
    { label: "Inherited", value: counts.inherited, color: "var(--cat-navigation)" },
    { label: "Not set", value: counts.unset, color: "var(--muted-foreground)" },
    { label: "Unknown", value: counts.unknown, color: "var(--destructive)" },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl border bg-card p-3 sm:grid-cols-4 sm:gap-3">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col items-center justify-center px-2 py-1">
          <span
            className="tabular text-2xl font-semibold leading-none"
            style={{ color: s.color }}
          >
            {s.value}
          </span>
          <span className="mt-1 text-center text-[11px] leading-tight text-muted-foreground">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  )
}
