import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { SourceChip } from "@/components/source-chip"
import type { ParsedSource } from "@/lib/csp/types"

/**
 * Renders a source list with sensible truncation so a directive carrying 100+
 * sources (or an inherited copy of one) doesn't flood the card.
 *
 * - Explicit lists show `initialShown` chips, then a "+N more" toggle.
 * - Inherited lists (`startCollapsed`) are hidden behind a "Show N sources"
 *   toggle, since they just duplicate the parent shown elsewhere.
 */
export function SourceChipList({
  sources,
  initialShown = 14,
  startCollapsed = false,
}: {
  sources: ParsedSource[]
  initialShown?: number
  startCollapsed?: boolean
}) {
  const [open, setOpen] = useState(!startCollapsed)
  const [showAll, setShowAll] = useState(false)

  if (sources.length === 0) return null

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground"
      >
        <ChevronRight className="size-3.5" />
        Show {sources.length} inherited source{sources.length > 1 ? "s" : ""}
      </button>
    )
  }

  const shown = showAll ? sources : sources.slice(0, initialShown)
  const remaining = sources.length - shown.length

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((s, i) => (
        <SourceChip key={`${s.raw}-${i}`} source={s} />
      ))}

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="tabular rounded-md border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground"
        >
          +{remaining} more
        </button>
      )}
      {showAll && sources.length > initialShown && (
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className="rounded-md px-2 py-0.5 text-xs text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground"
        >
          show less
        </button>
      )}
      {startCollapsed && (
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setShowAll(false)
          }}
          className="rounded-md px-2 py-0.5 text-xs text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground"
        >
          hide
        </button>
      )}
    </div>
  )
}
