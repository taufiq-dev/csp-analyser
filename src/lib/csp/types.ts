export type Category =
  | "fetch"
  | "document"
  | "navigation"
  | "reporting"
  | "other"
  | "deprecated"

export interface DirectiveMeta {
  /** Canonical lowercase directive name, e.g. "script-src" */
  name: string
  category: Category
  /** Short human label */
  title: string
  /** One-line summary of what it governs */
  summary: string
  /** Longer explanation of the behaviour */
  description: string
  /**
   * Ordered fallback chain. When this directive is absent, the browser uses
   * the first ancestor in this list that *is* present. Empty = no fallback.
   */
  fallback: string[]
  /** Does it accept a source-list (host/scheme/keyword values)? */
  takesSources: boolean
  /** Behaviour when neither this directive nor any fallback is set. */
  whenAbsent: string
  deprecated?: boolean
  experimental?: boolean
  example?: string
  mdn: string
}

export type SourceKind =
  | "keyword"
  | "nonce"
  | "hash"
  | "scheme"
  | "host"
  | "wildcard"
  | "sandbox-token"
  | "tt-policy"
  | "unknown"

export interface ParsedSource {
  raw: string
  kind: SourceKind
  label: string
  description: string
  /** security note: "danger" | "warn" | "ok" | "info" */
  risk: "danger" | "warn" | "ok" | "info"
  /**
   * Set when a sibling token changes how this value is interpreted — e.g.
   * 'unsafe-inline' being ignored because a nonce is present, or a host source
   * being ignored under 'strict-dynamic'.
   */
  override?: {
    ignored: boolean
    reason: string
  }
}

export type DirectiveStatus =
  | "explicit" // directive present in the policy
  | "inherited" // not present, but a fallback ancestor is
  | "unset" // not present and no fallback applies

export interface AnalyzedDirective {
  meta: DirectiveMeta
  status: DirectiveStatus
  /** The directive name whose values are in effect (self or a fallback). */
  effectiveFrom: string | null
  /** Parsed source tokens that apply (explicit or inherited). */
  sources: ParsedSource[]
  /** Raw source strings exactly as supplied (only when explicit). */
  rawValues: string[]
  /** True when this directive appeared more than once (extras ignored). */
  duplicated: boolean
}

export interface UnknownDirective {
  name: string
  rawValues: string[]
}

export interface Analysis {
  /** Original policy string. */
  input: string
  /** Categorised, fully-exhausted directive analysis. */
  byCategory: Record<Category, AnalyzedDirective[]>
  /** Directives we don't recognise. */
  unknown: UnknownDirective[]
  /** Aggregate risk findings across the whole policy. */
  findings: Finding[]
  counts: {
    explicit: number
    inherited: number
    unset: number
    unknown: number
  }
}

export interface Finding {
  level: "danger" | "warn" | "info"
  title: string
  detail: string
  directive?: string
}
