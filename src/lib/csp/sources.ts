import type { ParsedSource } from "./types"

/**
 * Classify and explain a single source-list token (e.g. 'self', https:,
 * *.example.com, 'nonce-abc', 'sha256-…').
 */
export function classifySource(raw: string): ParsedSource {
  const token = raw.trim()
  const lower = token.toLowerCase()

  // Quoted keywords ───────────────────────────────────────────────
  if (token.startsWith("'") && token.endsWith("'")) {
    const inner = token.slice(1, -1)
    const innerLower = inner.toLowerCase()

    if (innerLower.startsWith("nonce-")) {
      return {
        raw: token,
        kind: "nonce",
        label: "nonce",
        description:
          "A cryptographic nonce. Only inline scripts/styles carrying a matching nonce attribute are allowed. Must be unguessable and regenerated per response.",
        risk: "ok",
      }
    }
    if (
      innerLower.startsWith("sha256-") ||
      innerLower.startsWith("sha384-") ||
      innerLower.startsWith("sha512-")
    ) {
      return {
        raw: token,
        kind: "hash",
        label: "hash",
        description:
          "A cryptographic hash of an allowed inline script/style. Only content whose hash matches exactly is permitted.",
        risk: "ok",
      }
    }

    const KEYWORDS: Record<string, Omit<ParsedSource, "raw" | "kind">> = {
      none: {
        label: "'none'",
        description: "Blocks everything for this directive. No source is allowed.",
        risk: "ok",
      },
      self: {
        label: "'self'",
        description:
          "Allows resources from the same origin (same scheme, host and port) as the protected document.",
        risk: "ok",
      },
      "unsafe-inline": {
        label: "'unsafe-inline'",
        description:
          "Allows inline scripts/styles and event handlers. Largely defeats CSP's XSS protection — prefer nonces or hashes.",
        risk: "danger",
      },
      "unsafe-eval": {
        label: "'unsafe-eval'",
        description:
          "Allows eval() and similar string-to-code APIs. Dangerous — expands the attack surface for code injection.",
        risk: "danger",
      },
      "unsafe-hashes": {
        label: "'unsafe-hashes'",
        description:
          "Allows specific inline event handlers / style attributes to be hash-allowlisted. Narrower than 'unsafe-inline' but still risky.",
        risk: "warn",
      },
      "strict-dynamic": {
        label: "'strict-dynamic'",
        description:
          "Trust propagates: a script allowed via nonce/hash may load further scripts, while host-source allowlists are ignored. The basis of a strict CSP.",
        risk: "ok",
      },
      "report-sample": {
        label: "'report-sample'",
        description:
          "Asks the browser to include a sample of the violating code in violation reports.",
        risk: "info",
      },
      "wasm-unsafe-eval": {
        label: "'wasm-unsafe-eval'",
        description:
          "Allows WebAssembly compilation/instantiation without permitting general eval(). Much safer than 'unsafe-eval'.",
        risk: "warn",
      },
      "inline-speculation-rules": {
        label: "'inline-speculation-rules'",
        description:
          "Allows inline <script type=speculationrules> for prefetch/prerender hints.",
        risk: "info",
      },
    }

    if (KEYWORDS[innerLower]) {
      return { raw: token, kind: "keyword", ...KEYWORDS[innerLower] }
    }

    return {
      raw: token,
      kind: "keyword",
      label: token,
      description: "An unrecognised quoted keyword.",
      risk: "warn",
    }
  }

  // Bare wildcard ──────────────────────────────────────────────────
  if (token === "*") {
    return {
      raw: token,
      kind: "wildcard",
      label: "*",
      description:
        "Wildcard — allows any host over http/https/ws/wss (but not data:/blob:). Effectively unrestricted; avoid for scripts.",
      risk: "danger",
    }
  }

  // Scheme sources e.g. https:  data:  blob:  ws: ─────────────────
  if (/^[a-z][a-z0-9+.-]*:$/i.test(token)) {
    const SCHEME_NOTES: Record<string, { description: string; risk: ParsedSource["risk"] }> = {
      "https:": {
        description: "Allows any origin loaded over HTTPS. Broad — any HTTPS host qualifies.",
        risk: "warn",
      },
      "http:": {
        description: "Allows any origin over plain HTTP. Insecure — avoid.",
        risk: "danger",
      },
      "data:": {
        description:
          "Allows data: URIs. Risky for scripts and frames since attackers can inline payloads.",
        risk: "warn",
      },
      "blob:": {
        description: "Allows blob: URLs created via URL.createObjectURL().",
        risk: "warn",
      },
      "filesystem:": {
        description: "Allows filesystem: URLs (legacy).",
        risk: "warn",
      },
      "mediastream:": {
        description: "Allows mediastream: URIs for media capture.",
        risk: "info",
      },
      "ws:": { description: "Allows insecure WebSocket connections.", risk: "warn" },
      "wss:": { description: "Allows secure WebSocket connections.", risk: "ok" },
    }
    const note = SCHEME_NOTES[lower]
    return {
      raw: token,
      kind: "scheme",
      label: token,
      description: note?.description ?? `Allows all resources using the ${token} scheme.`,
      risk: note?.risk ?? "info",
    }
  }

  // Host sources (with optional scheme / wildcard / port / path) ────
  const wildcardHost = token.includes("*")
  return {
    raw: token,
    kind: wildcardHost ? "wildcard" : "host",
    label: token,
    description: wildcardHost
      ? "A host source with a wildcard. Matches any subdomain (or port) in that position — broader than a single host."
      : "A specific host source. Only resources served from this exact host (and matching scheme/port) are allowed.",
    risk: wildcardHost ? "warn" : "ok",
  }
}

/** Sandbox allow-* tokens are not source URLs; describe them separately. */
export function classifySandboxToken(raw: string): ParsedSource {
  const token = raw.trim()
  const NOTES: Record<string, string> = {
    "allow-forms": "Allows form submission.",
    "allow-modals": "Allows opening modal dialogs (alert, confirm, prompt).",
    "allow-orientation-lock": "Allows locking screen orientation.",
    "allow-pointer-lock": "Allows the Pointer Lock API.",
    "allow-popups": "Allows popups (window.open, target=_blank).",
    "allow-popups-to-escape-sandbox":
      "Lets popups open without inheriting the sandbox.",
    "allow-presentation": "Allows starting a presentation session.",
    "allow-same-origin":
      "Lets the content be treated as its real origin (otherwise it is a unique opaque origin).",
    "allow-scripts": "Allows running scripts.",
    "allow-top-navigation": "Allows navigating the top-level browsing context.",
    "allow-top-navigation-by-user-activation":
      "Allows top navigation only after a user gesture.",
    "allow-downloads": "Allows file downloads.",
  }
  return {
    raw: token,
    kind: "sandbox-token",
    label: token,
    description: NOTES[token.toLowerCase()] ?? "A sandbox allowance token.",
    risk:
      token.toLowerCase() === "allow-scripts" ||
      token.toLowerCase() === "allow-same-origin"
        ? "warn"
        : "info",
  }
}

/** Trusted-types / report-to tokens are policy names, not URLs. */
export function classifyPlainToken(raw: string): ParsedSource {
  const token = raw.trim()
  if (token === "'none'") {
    return {
      raw: token,
      kind: "keyword",
      label: "'none'",
      description: "Disallows the creation of any Trusted Types policy.",
      risk: "ok",
    }
  }
  if (token === "'allow-duplicates'") {
    return {
      raw: token,
      kind: "keyword",
      label: "'allow-duplicates'",
      description: "Permits creating more than one policy with the same name.",
      risk: "info",
    }
  }
  if (token === "*") {
    return {
      raw: token,
      kind: "wildcard",
      label: "*",
      description: "Allows any policy name to be created.",
      risk: "warn",
    }
  }
  return {
    raw: token,
    kind: "tt-policy",
    label: token,
    description: "A named value (e.g. a Trusted Types policy name or reporting group).",
    risk: "info",
  }
}
