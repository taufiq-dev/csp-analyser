import { motion, useReducedMotion } from "motion/react"
import { CheckCircle2, ShieldCheck, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  GRADE_META,
  SEVERITY_META,
  SEVERITY_ORDER,
  scorePolicy,
  type Issue,
} from "@/lib/csp/score"
import type { Analysis } from "@/lib/csp/types"

export function ScoreCard({ analysis }: { analysis: Analysis }) {
  const reduce = useReducedMotion()
  const score = scorePolicy(analysis)
  const total = SEVERITY_ORDER.reduce((n, s) => n + score.counts[s], 0)

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      {/* Grade header */}
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5">
        <div
          className={cn(
            "grid size-20 shrink-0 place-items-center rounded-xl ring-1",
            GRADE_META[score.grade].className,
          )}
        >
          <span className="text-4xl font-bold tracking-tight tabular">{score.grade}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h2 className="text-lg font-semibold tracking-tight">{score.posture}</h2>
            <span className="tabular text-sm text-muted-foreground">
              {score.score}/100 hardening score
            </span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{score.blurb}</p>

          {/* Snyk-style severity bar */}
          <div className="mt-3">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
              {total === 0 ? (
                <div className="h-full w-full bg-emerald-500" />
              ) : (
                SEVERITY_ORDER.map((sev) =>
                  score.counts[sev] > 0 ? (
                    <motion.div
                      key={sev}
                      className={cn("h-full", SEVERITY_META[sev].bar)}
                      initial={reduce ? false : { width: 0 }}
                      animate={{ width: `${(score.counts[sev] / total) * 100}%` }}
                      transition={{ duration: 0.4, ease: [0.165, 0.84, 0.44, 1] }}
                    />
                  ) : null,
                )
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {SEVERITY_ORDER.map((sev) => (
                <span key={sev} className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <span className={cn("size-2 rounded-full", SEVERITY_META[sev].dot)} />
                  <span className="tabular font-medium text-foreground">{score.counts[sev]}</span>
                  {SEVERITY_META[sev].label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Issues */}
      {score.issues.length > 0 ? (
        <ul className="divide-y divide-border/60 border-t border-border/60">
          {score.issues.map((issue, i) => (
            <IssueRow key={i} issue={issue} index={i} reduce={!!reduce} />
          ))}
        </ul>
      ) : (
        <p className="flex items-center gap-2 border-t border-border/60 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="size-4" /> No weaknesses detected against the hardening checks.
        </p>
      )}

      {/* Wins */}
      {score.wins.length > 0 && (
        <ul className="space-y-1 border-t border-border/60 bg-muted/30 px-4 py-3">
          {score.wins.map((w, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
              {w}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function IssueRow({ issue, index, reduce }: { issue: Issue; index: number; reduce: boolean }) {
  const meta = SEVERITY_META[issue.severity]
  return (
    <motion.li
      className="px-4 py-3"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.165, 0.84, 0.44, 1], delay: Math.min(index * 0.03, 0.3) }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
            meta.chip,
          )}
        >
          {meta.label}
        </span>
        <span className="text-sm font-medium">{issue.title}</span>
        {issue.directive && (
          <code className="font-mono text-[11px] text-muted-foreground">{issue.directive}</code>
        )}
      </div>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{issue.detail}</p>
      <p className="mt-1.5 flex items-start gap-1.5 text-sm leading-relaxed">
        <Wrench className="mt-0.5 size-3.5 shrink-0 text-primary" />
        <span>
          <span className="font-medium text-foreground">Fix: </span>
          <span className="text-muted-foreground">{issue.fix}</span>
        </span>
      </p>
    </motion.li>
  )
}
