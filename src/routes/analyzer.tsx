import { useLoaderData } from "react-router-dom"
import type { LoaderFunctionArgs } from "react-router-dom"
import { FileWarning, Layers } from "lucide-react"
import { CopyReportButton } from "@/components/copy-report-button"
import { PolicyInput } from "@/components/policy-input"
import { ScoreCard } from "@/components/score-card"
import { ShareButton } from "@/components/share-button"
import { SummaryBar } from "@/components/summary-bar"
import { CategorySection } from "@/components/category-section"
import { analyze } from "@/lib/csp/parse"
import { CATEGORY_INFO, CATEGORY_ORDER } from "@/lib/csp/directives"
import { decompressPolicy } from "@/lib/url-codec"
import type { Analysis } from "@/lib/csp/types"

interface LoaderData {
  policy: string
  analysis: Analysis | null
}

export async function analyzerLoader({
  request,
}: LoaderFunctionArgs): Promise<LoaderData> {
  const url = new URL(request.url)
  let policy = ""
  // Compressed share link (?z=) takes precedence, then the plain ?policy=.
  const z = url.searchParams.get("z")
  if (z) {
    try {
      policy = await decompressPolicy(z)
    } catch {
      policy = ""
    }
  }
  if (!policy) policy = url.searchParams.get("policy") ?? ""
  return { policy, analysis: policy.trim() ? analyze(policy) : null }
}

export function AnalyzerPage() {
  const { policy, analysis } = useLoaderData() as LoaderData

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Content-Security-Policy, analysed
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Paste the <code className="font-mono text-foreground/80">Content-Security-Policy</code>{" "}
          value from your response headers. Every directive is parsed, categorised, and explained —
          including the ones you didn’t set and where they inherit their rules from.
        </p>
      </div>

      <PolicyInput defaultValue={policy} />

      {analysis ? (
        <Results analysis={analysis} />
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function Results({ analysis }: { analysis: Analysis }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Breakdown of{" "}
          <span className="tabular text-foreground">
            {analysis.counts.explicit + analysis.counts.inherited}
          </span>{" "}
          active directives
        </h2>
        <div className="flex items-center gap-2">
          <CopyReportButton analysis={analysis} />
          <ShareButton policy={analysis.input} />
        </div>
      </div>

      <ScoreCard analysis={analysis} />
      <SummaryBar analysis={analysis} />

      {analysis.unknown.length > 0 && (
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-destructive">
            <FileWarning className="size-4" /> Unrecognised directives
          </h2>
          <ul className="mt-2 space-y-1">
            {analysis.unknown.map((u) => (
              <li key={u.name} className="font-mono text-xs text-foreground/80">
                {u.name} {u.rawValues.join(" ")}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="space-y-9">
        {CATEGORY_ORDER.map((c) => (
          <CategorySection key={c} category={c} directives={analysis.byCategory[c]} />
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Layers className="size-4" /> The five families of CSP directives
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_ORDER.filter((c) => c !== "deprecated").map((c) => {
          const info = CATEGORY_INFO[c]
          return (
            <div key={c} className="rounded-xl border bg-card p-4">
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-2.5 rounded-full"
                  style={{ background: `var(--color-${info.token})` }}
                />
                <h3 className="text-sm font-semibold">{info.label}</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{info.blurb}</p>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Tip: hit one of the example buttons above, or paste your own policy. You can also share a
        breakdown — the policy lives in the URL.
      </p>
    </div>
  )
}
