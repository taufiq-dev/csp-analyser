import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { ParsedSource } from "@/lib/csp/types"

const RISK_STYLES: Record<ParsedSource["risk"], string> = {
  danger:
    "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15",
  warn: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15",
  ok: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15",
  info: "border-border bg-muted text-muted-foreground hover:bg-muted/70",
}

const RISK_LABEL: Record<ParsedSource["risk"], string> = {
  danger: "Risky",
  warn: "Use with care",
  ok: "Safe",
  info: "Informational",
}

export function SourceChip({ source }: { source: ParsedSource }) {
  const ignored = source.override?.ignored

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className={cn(
          "inline-flex max-w-full cursor-help items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-xs leading-relaxed transition-colors duration-150 ease-out",
          ignored
            ? "border-dashed border-border bg-muted/40 text-muted-foreground"
            : RISK_STYLES[source.risk],
        )}
      >
        <span className={cn("truncate", ignored && "line-through decoration-muted-foreground/60")}>
          {source.raw}
        </span>
        {ignored && (
          <span className="rounded-sm bg-background/60 px-1 text-[9px] font-medium tracking-wide text-muted-foreground uppercase no-underline">
            ignored
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent
        className="w-[270px] max-w-[270px] flex-col items-stretch gap-0 text-left"
        side="top"
      >
        <p className="mb-1 flex items-center gap-1.5 font-mono text-[11px] font-semibold">
          {source.label}
          <span className="rounded bg-background/15 px-1 py-px text-[10px] font-normal text-background/70">
            {ignored ? "Ignored" : RISK_LABEL[source.risk]}
          </span>
        </p>
        <p className="text-xs leading-snug text-background/80">{source.description}</p>
        {source.override?.reason && (
          <p className="mt-1.5 border-t border-background/15 pt-1.5 text-xs leading-snug text-background/70">
            {source.override.reason}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
