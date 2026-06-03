import { CATEGORY_ORDER } from "./directives"
import type { AnalyzedDirective, Analysis, ParsedSource } from "./types"

export type Severity = "critical" | "high" | "medium" | "low"

export interface Issue {
  severity: Severity
  title: string
  /** Why it matters. */
  detail: string
  /** How to fix it (the learning bit). */
  fix: string
  directive?: string
}

export type Grade = "A" | "B" | "C" | "D" | "F"

export interface Score {
  grade: Grade
  /** 0–100 hardening score. */
  score: number
  posture: string
  blurb: string
  issues: Issue[]
  counts: Record<Severity, number>
  /** Positive things the policy gets right. */
  wins: string[]
}

export const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"]

export const SEVERITY_META: Record<
  Severity,
  { label: string; bar: string; chip: string; dot: string }
> = {
  critical: {
    label: "Critical",
    bar: "bg-red-500",
    chip: "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400",
    dot: "bg-red-500",
  },
  high: {
    label: "High",
    bar: "bg-orange-500",
    chip: "border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  medium: {
    label: "Medium",
    bar: "bg-amber-400",
    chip: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-400",
  },
  low: {
    label: "Low",
    bar: "bg-slate-400",
    chip: "border-slate-500/40 bg-slate-500/10 text-slate-600 dark:text-slate-400",
    dot: "bg-slate-400",
  },
}

const WEIGHT: Record<Severity, number> = { critical: 60, high: 20, medium: 8, low: 3 }

/** Each grade owns a contiguous slice of the 0–100 range. */
export const GRADE_BANDS: Record<Grade, [number, number]> = {
  A: [90, 100],
  B: [75, 89],
  C: [55, 74],
  D: [35, 54],
  F: [0, 34],
}

export const GRADE_META: Record<Grade, { label: string; className: string }> = {
  A: { label: "Strong", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-emerald-500/30" },
  B: { label: "Good", className: "bg-lime-500/15 text-lime-600 dark:text-lime-400 ring-lime-500/30" },
  C: { label: "Needs work", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/30" },
  D: { label: "Weak", className: "bg-orange-500/15 text-orange-600 dark:text-orange-400 ring-orange-500/30" },
  F: { label: "Critically exposed", className: "bg-red-500/15 text-red-600 dark:text-red-400 ring-red-500/30" },
}

function allDirectives(a: Analysis): AnalyzedDirective[] {
  return CATEGORY_ORDER.flatMap((c) => a.byCategory[c])
}
function getDir(a: Analysis, name: string) {
  return allDirectives(a).find((d) => d.meta.name === name)
}
const active = (s: ParsedSource) => !s.override?.ignored
const findActive = (d: AnalyzedDirective | undefined, raw: string) =>
  d?.sources.find((s) => s.raw.toLowerCase() === raw && active(s))
const activeOfKind = (d: AnalyzedDirective | undefined, ...kinds: ParsedSource["kind"][]) =>
  (d?.sources ?? []).filter((s) => active(s) && kinds.includes(s.kind))

export function scorePolicy(a: Analysis): Score {
  const issues: Issue[] = []
  const wins: string[] = []

  const def = getDir(a, "default-src")
  const script = getDir(a, "script-src")
  const style = getDir(a, "style-src")
  const obj = getDir(a, "object-src")
  const base = getDir(a, "base-uri")
  const frame = getDir(a, "frame-ancestors")

  const scriptUnsafeInline = findActive(script, "'unsafe-inline'")
  const scriptUnsafeEval = findActive(script, "'unsafe-eval'")
  const scriptStrictDynamic = !!script?.sources.some(
    (s) => s.raw.toLowerCase() === "'strict-dynamic'",
  )
  const scriptNonceHash = (script?.sources ?? []).some(
    (s) => active(s) && (s.kind === "nonce" || s.kind === "hash"),
  )
  const scriptHosts = activeOfKind(script, "host", "wildcard", "scheme")
  const scriptWildcardOrScheme = scriptHosts.filter((s) =>
    ["*", "https:", "http:", "data:"].includes(s.raw.toLowerCase()),
  )

  // ── Script execution ────────────────────────────────────────────
  if (scriptUnsafeInline) {
    issues.push({
      severity: "critical",
      title: "Inline scripts are allowed (script-src 'unsafe-inline')",
      detail:
        "Any injected <script> or inline handler executes. This is the single biggest XSS hole — CSP provides essentially no script protection here.",
      fix: "Remove 'unsafe-inline'. Adopt a per-request nonce ('nonce-…') plus 'strict-dynamic'; modern browsers then ignore inline injection that lacks the nonce.",
      directive: "script-src",
    })
  } else if (scriptNonceHash || scriptStrictDynamic) {
    wins.push("Scripts are gated by a nonce/hash" + (scriptStrictDynamic ? " with 'strict-dynamic'." : "."))
  }

  if (scriptUnsafeEval) {
    issues.push({
      severity: "high",
      title: "eval() is allowed (script-src 'unsafe-eval')",
      detail:
        "eval, new Function and string timers are enabled, widening the code-injection surface. Nonces and 'strict-dynamic' do NOT neutralise this.",
      fix: "Remove 'unsafe-eval'. Refactor eval/Function usage; if a library needs WASM, use 'wasm-unsafe-eval' instead.",
      directive: "script-src",
    })
  }

  if (scriptWildcardOrScheme.length) {
    const tokens = scriptWildcardOrScheme.map((s) => s.raw).join(", ")
    issues.push({
      severity: "high",
      title: `script-src allows a broad source (${tokens})`,
      detail:
        "A wildcard or scheme source lets scripts load from effectively anywhere, so the allowlist provides little protection.",
      fix: "Drop wildcard/scheme script sources. Pin exact hosts, or better, move to nonce + 'strict-dynamic' which ignores host allowlists entirely.",
      directive: "script-src",
    })
  } else if (scriptHosts.length >= 1 && !scriptStrictDynamic) {
    issues.push({
      severity: "medium",
      title: `Allowlist-based script-src (${scriptHosts.length} host${scriptHosts.length > 1 ? "s" : ""})`,
      detail:
        "Host allowlists are bypassable in practice — JSONP endpoints, open redirects and AngularJS/template gadgets on allowed origins can be abused to run attacker code.",
      fix: "Migrate to nonce + 'strict-dynamic'. The browser then trusts scripts by nonce and ignores the host list, removing the gadget risk.",
      directive: "script-src",
    })
  }

  // ── default-src / fallback posture ──────────────────────────────
  if (def?.status !== "explicit") {
    issues.push({
      severity: "high",
      title: "No default-src",
      detail:
        "Every fetch directive you didn't set falls open and allows any source. There is no safety net.",
      fix: "Add a restrictive default-src 'self' (or 'none') so unset directives inherit a safe default.",
      directive: "default-src",
    })
  } else {
    const defBroad = activeOfKind(def, "wildcard", "scheme").filter((s) =>
      ["*", "https:", "http:"].includes(s.raw.toLowerCase()),
    )
    if (defBroad.length) {
      issues.push({
        severity: "medium",
        title: `default-src is very broad (${defBroad.map((s) => s.raw).join(", ")})`,
        detail:
          "A wide default-src weakens every directive that falls back to it (connect, img, media, frame…).",
        fix: "Tighten default-src toward 'self' and grant specific origins only on the directives that need them.",
        directive: "default-src",
      })
    }
  }

  // ── Mixed content ───────────────────────────────────────────────
  const httpSomewhere = allDirectives(a).some((d) =>
    d.status === "explicit" && d.sources.some((s) => active(s) && s.raw.toLowerCase() === "http:"),
  )
  if (httpSomewhere) {
    issues.push({
      severity: "medium",
      title: "Insecure http: sources present",
      detail:
        "Plain-http: sources allow resources to load over an unencrypted channel, exposing them to network tampering (MITM).",
      fix: "Use https: origins only, and add 'upgrade-insecure-requests' to auto-upgrade legacy URLs.",
    })
  }

  // ── Hardening gaps ──────────────────────────────────────────────
  const objNone = findActive(obj, "'none'")
  if (!objNone && !(obj?.status === "inherited" && findActive(def, "'none'"))) {
    issues.push({
      severity: "medium",
      title: "object-src is not 'none'",
      detail:
        "Legacy plugins (<object>/<embed>) can execute active content and are a known CSP bypass vector.",
      fix: "Set object-src 'none' explicitly — almost no modern site needs plugins.",
      directive: "object-src",
    })
  }
  if (base?.status !== "explicit") {
    issues.push({
      severity: "medium",
      title: "base-uri is not set",
      detail:
        "base-uri does NOT fall back to default-src. Without it, an injected <base> tag can rewrite every relative URL on the page to an attacker origin.",
      fix: "Set base-uri 'none' (or 'self').",
      directive: "base-uri",
    })
  }
  if (frame?.status !== "explicit") {
    issues.push({
      severity: "medium",
      title: "frame-ancestors is not set",
      detail:
        "The page can be embedded by any origin, enabling clickjacking. frame-ancestors does not fall back to default-src.",
      fix: "Set frame-ancestors 'none' or list the origins permitted to frame you (replaces X-Frame-Options).",
      directive: "frame-ancestors",
    })
  }

  // ── Styles ──────────────────────────────────────────────────────
  if (findActive(style, "'unsafe-inline'")) {
    issues.push({
      severity: "low",
      title: "Inline styles are allowed (style-src 'unsafe-inline')",
      detail:
        "Lower risk than inline scripts, but inline CSS can enable data exfiltration and UI-redress tricks.",
      fix: "Prefer a nonce/hash for styles, or extract inline styles to stylesheets.",
      directive: "style-src",
    })
  }

  // ── Monitoring ──────────────────────────────────────────────────
  const reports = getDir(a, "report-to")?.status === "explicit" || getDir(a, "report-uri")?.status === "explicit"
  if (!reports) {
    issues.push({
      severity: "low",
      title: "No violation reporting",
      detail:
        "Without report-to/report-uri you can't see what the policy is blocking (or what an attacker is attempting).",
      fix: "Add report-to (with a Reporting-Endpoints header) to collect violation reports.",
    })
  } else {
    wins.push("Violation reporting is configured.")
  }

  // ── Score & grade ───────────────────────────────────────────────
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 }
  for (const i of issues) counts[i.severity]++

  // Severity-banded grade: the *worst* finding picks the band; the numeric score
  // only positions you within that band. This keeps grade and score consistent
  // and stops everything bad from collapsing to 0.
  //   • any Critical, or 2+ High            → F
  //   • exactly one High                    → D
  //   • Mediums only                        → C
  //   • Lows only                           → B
  //   • clean                               → A
  const grade: Grade =
    counts.critical >= 1 || counts.high >= 2
      ? "F"
      : counts.high === 1
        ? "D"
        : counts.medium >= 1
          ? "C"
          : counts.low >= 1
            ? "B"
            : "A"

  // Within the band, more weighted issues push you toward the band floor.
  const [lo, hi] = GRADE_BANDS[grade]
  const penalty = issues.reduce((sum, i) => sum + WEIGHT[i.severity], 0)
  const score = Math.round(Math.max(lo, hi - Math.min(hi - lo, penalty * 0.45)))

  const posture = GRADE_META[grade].label
  const blurb =
    grade === "F"
      ? "This policy does little to stop XSS. Treat it as urgent."
      : grade === "D"
        ? "Significant gaps an attacker can work around. Needs hardening."
        : grade === "C"
          ? "A reasonable start with notable gaps to close."
          : grade === "B"
            ? "Solid policy — a few refinements left."
            : "A strong, modern CSP. Nice."

  // Order issues by severity for display.
  issues.sort((x, y) => SEVERITY_ORDER.indexOf(x.severity) - SEVERITY_ORDER.indexOf(y.severity))

  return { grade, score, posture, blurb, issues, counts, wins }
}
