import { CATEGORY_ORDER, DIRECTIVE_MAP, DIRECTIVES } from "./directives"
import { classifyPlainToken, classifySandboxToken, classifySource } from "./sources"
import type {
  AnalyzedDirective,
  Analysis,
  Category,
  Finding,
  ParsedSource,
  UnknownDirective,
} from "./types"

interface RawDirective {
  name: string
  values: string[]
  duplicated: boolean
}

/**
 * Tokenise a raw Content-Security-Policy header value into directives.
 * Directive names are ASCII case-insensitive; the first occurrence wins
 * (browsers ignore later duplicates of the same directive).
 */
export function tokenize(input: string): RawDirective[] {
  const seen = new Set<string>()
  const out: RawDirective[] = []

  for (const segment of input.split(";")) {
    const parts = segment.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) continue
    const name = parts[0].toLowerCase()
    const values = parts.slice(1)
    if (seen.has(name)) {
      const existing = out.find((d) => d.name === name)
      if (existing) existing.duplicated = true
      continue
    }
    seen.add(name)
    out.push({ name, values, duplicated: false })
  }
  return out
}

function classifyValues(directive: string, values: string[]): ParsedSource[] {
  if (directive === "sandbox") return values.map(classifySandboxToken)
  if (directive === "trusted-types" || directive === "report-to" || directive === "report-uri")
    return values.map(classifyPlainToken)
  return applySourceListContext(directive, values.map(classifySource))
}

/**
 * Adjust individual source tokens based on their siblings, modelling the parts
 * of the CSP spec where one keyword changes how others are interpreted:
 *
 *  • A nonce or hash makes CSP Level 2+ browsers IGNORE 'unsafe-inline'
 *    (script-src and style-src). This is the recommended backwards-compatible
 *    pattern, not a vulnerability.
 *  • 'strict-dynamic' (script-src only) makes the browser IGNORE host-source
 *    allowlists, scheme sources and 'self'. Trust flows only through
 *    nonce/hash-allowed scripts and the scripts they create.
 *  • 'unsafe-eval' / 'wasm-unsafe-eval' are NEVER neutralised by the above.
 */
function applySourceListContext(directive: string, sources: ParsedSource[]): ParsedSource[] {
  const isScript = directive.startsWith("script-src")
  const isStyle = directive.startsWith("style-src")
  if (!isScript && !isStyle) return sources

  const hasNonceOrHash = sources.some((s) => s.kind === "nonce" || s.kind === "hash")
  const hasStrictDynamic =
    isScript && sources.some((s) => s.raw.toLowerCase() === "'strict-dynamic'")

  return sources.map((s) => {
    const lower = s.raw.toLowerCase()

    if (lower === "'unsafe-inline'" && (hasNonceOrHash || hasStrictDynamic)) {
      return {
        ...s,
        risk: "info",
        override: {
          ignored: true,
          reason: hasStrictDynamic
            ? "Ignored: with 'strict-dynamic' (and a nonce/hash) present, CSP Level 2+ browsers disregard 'unsafe-inline'. It only matters to legacy browsers that don't understand nonces."
            : "Ignored by CSP Level 2+ browsers because a nonce or hash is present. It is kept purely as a fallback for older browsers — the recommended backwards-compatibility pattern, not a risk.",
        },
      }
    }

    if (
      hasStrictDynamic &&
      (s.kind === "host" || s.kind === "wildcard" || s.kind === "scheme" || lower === "'self'")
    ) {
      return {
        ...s,
        risk: "info",
        override: {
          ignored: true,
          reason:
            "Ignored because 'strict-dynamic' is present. Host/scheme allowlists and 'self' do not apply to scripts under strict-dynamic — trust propagates only through nonce/hash-allowed scripts and the scripts they create.",
        },
      }
    }

    return s
  })
}

export function analyze(input: string): Analysis {
  const raw = tokenize(input)
  const rawMap = new Map(raw.map((d) => [d.name, d]))

  const byCategory = Object.fromEntries(
    CATEGORY_ORDER.map((c) => [c, [] as AnalyzedDirective[]]),
  ) as Record<Category, AnalyzedDirective[]>

  for (const meta of DIRECTIVES) {
    const present = rawMap.get(meta.name)

    if (present) {
      byCategory[meta.category].push({
        meta,
        status: "explicit",
        effectiveFrom: meta.name,
        sources: classifyValues(meta.name, present.values),
        rawValues: present.values,
        duplicated: present.duplicated,
      })
      continue
    }

    // Walk the fallback chain for an inherited value.
    let inheritedFrom: string | null = null
    for (const ancestor of meta.fallback) {
      if (rawMap.has(ancestor)) {
        inheritedFrom = ancestor
        break
      }
    }

    if (inheritedFrom) {
      const src = rawMap.get(inheritedFrom)!
      byCategory[meta.category].push({
        meta,
        status: "inherited",
        effectiveFrom: inheritedFrom,
        sources: classifyValues(inheritedFrom, src.values),
        rawValues: [],
        duplicated: false,
      })
    } else {
      byCategory[meta.category].push({
        meta,
        status: "unset",
        effectiveFrom: null,
        sources: [],
        rawValues: [],
        duplicated: false,
      })
    }
  }

  const unknown: UnknownDirective[] = raw
    .filter((d) => !DIRECTIVE_MAP[d.name])
    .map((d) => ({ name: d.name, rawValues: d.values }))

  const counts = { explicit: 0, inherited: 0, unset: 0, unknown: unknown.length }
  for (const c of CATEGORY_ORDER) {
    for (const d of byCategory[c]) {
      if (d.status === "explicit") counts.explicit++
      else if (d.status === "inherited") counts.inherited++
      else counts.unset++
    }
  }

  return {
    input,
    byCategory,
    unknown,
    findings: deriveFindings(byCategory, rawMap, unknown),
    counts,
  }
}

/** Surface notable policy-wide risks for the summary panel. */
function deriveFindings(
  byCategory: Record<Category, AnalyzedDirective[]>,
  rawMap: Map<string, RawDirective>,
  unknown: UnknownDirective[],
): Finding[] {
  const findings: Finding[] = []
  const all = CATEGORY_ORDER.flatMap((c) => byCategory[c])
  const get = (name: string) => all.find((d) => d.meta.name === name)

  const hasDefault = rawMap.has("default-src")
  const scriptSrc = get("script-src")
  const objectSrc = get("object-src")
  const baseUri = get("base-uri")
  const frameAncestors = get("frame-ancestors")

  if (!hasDefault) {
    findings.push({
      level: "warn",
      title: "No default-src set",
      detail:
        "Without default-src, every unset fetch directive falls open and allows any source. Consider adding a restrictive default-src.",
      directive: "default-src",
    })
  }

  const findSource = (d: AnalyzedDirective | undefined, raw: string) =>
    d?.sources.find((s) => s.raw.toLowerCase() === raw)
  const hasKind = (d: AnalyzedDirective | undefined, ...kinds: ParsedSource["kind"][]) =>
    d?.sources.some((s) => kinds.includes(s.kind)) ?? false

  const scriptUnsafeInline = findSource(scriptSrc, "'unsafe-inline'")
  const scriptUnsafeEval = findSource(scriptSrc, "'unsafe-eval'")
  const scriptStrictDynamic = !!findSource(scriptSrc, "'strict-dynamic'")
  const scriptHasNonceOrHash = hasKind(scriptSrc, "nonce", "hash")

  // 'unsafe-inline' on script-src — danger only when it actually takes effect.
  if (scriptUnsafeInline && !scriptUnsafeInline.override?.ignored) {
    findings.push({
      level: "danger",
      title: "script-src allows 'unsafe-inline'",
      detail:
        "Inline scripts are permitted, which largely negates CSP's XSS protection. Add a nonce or hash (and ideally 'strict-dynamic'); the browser will then ignore 'unsafe-inline' automatically.",
      directive: "script-src",
    })
  } else if (scriptUnsafeInline?.override?.ignored) {
    findings.push({
      level: "info",
      title: "'unsafe-inline' is neutralised on script-src",
      detail:
        "A nonce/hash (or 'strict-dynamic') is present, so modern browsers ignore 'unsafe-inline'. It only serves as a fallback for legacy browsers — a recommended pattern.",
      directive: "script-src",
    })
  }

  // 'unsafe-eval' is NOT affected by nonces/strict-dynamic — always a real risk.
  if (scriptUnsafeEval) {
    findings.push({
      level: "danger",
      title: "script-src allows 'unsafe-eval'",
      detail:
        "eval()-style APIs are enabled, expanding the code-injection attack surface. Nonces and 'strict-dynamic' do NOT neutralise this — remove it if you can.",
      directive: "script-src",
    })
  }

  // 'strict-dynamic' interactions.
  if (scriptStrictDynamic && !scriptHasNonceOrHash) {
    findings.push({
      level: "warn",
      title: "'strict-dynamic' without a nonce or hash",
      detail:
        "Host/scheme allowlists and 'self' are ignored under 'strict-dynamic', and there is no nonce/hash to bootstrap execution — so effectively no scripts can run. Add a 'nonce-…' or hash source.",
      directive: "script-src",
    })
  } else if (scriptStrictDynamic && scriptHasNonceOrHash) {
    findings.push({
      level: "info",
      title: "Strict CSP detected on script-src",
      detail:
        "Uses a nonce/hash with 'strict-dynamic' — the recommended, allowlist-free approach. Any host or scheme sources listed alongside it are ignored for scripts.",
      directive: "script-src",
    })
  }

  // Inline styles: same neutralisation rule via nonce/hash.
  const styleSrc = get("style-src")
  const styleUnsafeInline = findSource(styleSrc, "'unsafe-inline'")
  if (styleUnsafeInline && !styleUnsafeInline.override?.ignored) {
    findings.push({
      level: "warn",
      title: "style-src allows 'unsafe-inline'",
      detail:
        "Inline styles are permitted. Lower risk than inline scripts, but can enable CSS-based data exfiltration. A nonce/hash would let browsers ignore it.",
      directive: "style-src",
    })
  }
  if (!objectSrc || (objectSrc.status === "inherited" && !hasDefault)) {
    findings.push({
      level: "info",
      title: "Consider object-src 'none'",
      detail: "Explicitly disabling legacy plugins (object-src 'none') is a recommended hardening step.",
      directive: "object-src",
    })
  }
  if (!baseUri || baseUri.status === "unset") {
    findings.push({
      level: "warn",
      title: "base-uri not set",
      detail:
        "base-uri does not fall back to default-src. Without it, injected <base> tags can hijack relative URLs.",
      directive: "base-uri",
    })
  }
  if (!frameAncestors || frameAncestors.status === "unset") {
    findings.push({
      level: "info",
      title: "frame-ancestors not set",
      detail:
        "The page can be embedded by any site. Set frame-ancestors to prevent clickjacking (replaces X-Frame-Options).",
      directive: "frame-ancestors",
    })
  }
  if (unknown.length) {
    findings.push({
      level: "info",
      title: `${unknown.length} unrecognised directive${unknown.length > 1 ? "s" : ""}`,
      detail: `Not part of the known CSP set: ${unknown.map((u) => u.name).join(", ")}. Possibly a typo or a very new/experimental feature.`,
    })
  }

  return findings
}
