import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  ArrowRight,
  ChevronDown,
  CircleSlash,
  CornerDownRight,
  ExternalLink,
  Info,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SourceChipList } from "@/components/source-chip-list"
import { cn } from "@/lib/utils"
import type { AnalyzedDirective } from "@/lib/csp/types"

const STATUS: Record<
  AnalyzedDirective["status"],
  { label: string; className: string }
> = {
  explicit: {
    label: "Set",
    className:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  inherited: {
    label: "Inherited",
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  unset: {
    label: "Not set",
    className: "border-border bg-muted text-muted-foreground",
  },
}

export function DirectiveCard({ directive }: { directive: AnalyzedDirective }) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const { meta, status, sources, effectiveFrom, rawValues, duplicated } = directive

  const isFlag = !meta.takesSources
  const flagEnabled = status === "explicit" && isFlag
  const ignoredCount = sources.filter((s) => s.override?.ignored).length

  return (
    <div
      className={cn(
        "group/card overflow-hidden rounded-xl border bg-card transition-colors duration-200 ease-out",
        status === "unset" && "opacity-[0.72] hover:opacity-100",
      )}
      style={{ borderColor: `color-mix(in oklab, var(--color-${categoryToken(meta.category)}) 22%, var(--border))` }}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
      >
        <span
          aria-hidden
          className="mt-1.5 size-2 shrink-0 rounded-full"
          style={{ background: `var(--color-${categoryToken(meta.category)})` }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <code className="font-mono text-sm font-medium text-foreground">
              {meta.name}
            </code>
            {meta.deprecated && (
              <Badge variant="outline" className="h-5 border-destructive/40 px-1.5 text-[10px] text-destructive">
                deprecated
              </Badge>
            )}
            {meta.experimental && !meta.deprecated && (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                experimental
              </Badge>
            )}
            {duplicated && (
              <Badge variant="outline" className="h-5 border-amber-500/40 px-1.5 text-[10px] text-amber-600 dark:text-amber-400">
                duplicate ignored
              </Badge>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta.summary}</p>
        </div>

        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
            STATUS[status].className,
          )}
        >
          {STATUS[status].label}
        </span>
        <ChevronDown
          className={cn(
            "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Values / effect summary */}
      <div className="px-4 pb-3 pl-9">
        {status === "explicit" && (
          <div className="flex flex-wrap items-center gap-1.5">
            {isFlag ? (
              flagEnabled ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                  Enabled
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">present</span>
              )
            ) : sources.length ? (
              <SourceChipList sources={sources} />
            ) : (
              <span className="text-xs text-muted-foreground italic">
                (no value — empty list blocks everything)
              </span>
            )}
          </div>
        )}

        {status === "inherited" && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <CornerDownRight className="size-3.5" />
              inherits <code className="font-mono">{effectiveFrom}</code>
              <span className="tabular text-muted-foreground">({sources.length})</span>
            </span>
            <SourceChipList sources={sources} startCollapsed />
          </div>
        )}

        {status === "unset" && (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <CircleSlash className="mt-0.5 size-3.5 shrink-0" />
            <span>{meta.whenAbsent}</span>
          </p>
        )}

        {ignoredCount > 0 && (
          <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <Info className="mt-px size-3 shrink-0" />
            <span>
              {ignoredCount} value{ignoredCount > 1 ? "s are" : " is"} ignored by modern
              browsers (nonce / strict-dynamic interaction) — hover to see why.
            </span>
          </p>
        )}
      </div>

      {/* Expandable explanation */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.165, 0.84, 0.44, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-border/60 bg-muted/30 px-4 py-3 pl-9 text-sm">
              <p className="leading-relaxed text-foreground/90">{meta.description}</p>

              {rawValues.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Raw: </span>
                  <code className="font-mono text-foreground/80">
                    {meta.name} {rawValues.join(" ")}
                  </code>
                </div>
              )}

              {meta.fallback.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground">Fallback chain:</span>
                  <FallbackChain
                    name={meta.name}
                    chain={meta.fallback}
                    effective={effectiveFrom}
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Info className="size-3.5" /> When absent: {meta.whenAbsent}
                </span>
              </div>

              {meta.example && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Example: </span>
                  <code className="font-mono text-foreground/80">{meta.example}</code>
                </div>
              )}

              <a
                href={meta.mdn}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                MDN reference <ExternalLink className="size-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FallbackChain({
  name,
  chain,
  effective,
}: {
  name: string
  chain: string[]
  effective: string | null
}) {
  const nodes = [name, ...chain]
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {nodes.map((node, i) => (
        <span key={node} className="inline-flex items-center gap-1">
          <code
            className={cn(
              "rounded px-1.5 py-0.5 font-mono",
              node === effective
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/30"
                : "bg-muted text-muted-foreground",
            )}
          >
            {node}
          </code>
          {i < nodes.length - 1 && (
            <ArrowRight className="size-3 text-muted-foreground/60" />
          )}
        </span>
      ))}
    </span>
  )
}

function categoryToken(category: AnalyzedDirective["meta"]["category"]): string {
  switch (category) {
    case "fetch":
      return "cat-fetch"
    case "document":
      return "cat-document"
    case "navigation":
      return "cat-navigation"
    case "reporting":
      return "cat-reporting"
    default:
      return "cat-other"
  }
}
