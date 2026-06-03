import type { Category, DirectiveMeta } from "./types"

const MDN = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy"

/**
 * Exhaustive Content-Security-Policy directive registry.
 * Covers CSP Level 3 plus widely-used experimental and deprecated directives.
 */
export const DIRECTIVES: DirectiveMeta[] = [
  // ──────────────────────────────── Fetch ────────────────────────────────
  {
    name: "default-src",
    category: "fetch",
    title: "Default Source",
    summary: "Fallback for every other fetch directive.",
    description:
      "Serves as the catch-all source list for fetch directives that are not explicitly set. If a fetch directive like img-src or script-src is missing, the browser uses default-src instead.",
    fallback: [],
    takesSources: true,
    whenAbsent:
      "No fallback exists. Fetch directives left unset will then allow any source (wide open).",
    example: "default-src 'self'",
    mdn: `${MDN}/default-src`,
  },
  {
    name: "script-src",
    category: "fetch",
    title: "Script Source",
    summary: "Valid sources for JavaScript and WebAssembly.",
    description:
      "Controls where scripts may be loaded from and whether inline scripts, eval(), nonces and hashes are permitted. The single most important directive for XSS defence.",
    fallback: ["default-src"],
    takesSources: true,
    whenAbsent: "Falls back to default-src; if that is also unset, all scripts are allowed.",
    example: "script-src 'self' 'nonce-abc123'",
    mdn: `${MDN}/script-src`,
  },
  {
    name: "script-src-elem",
    category: "fetch",
    title: "Script Element Source",
    summary: "Sources for <script> elements specifically.",
    description:
      "Applies to script elements (external and inline <script> blocks) but not to inline event handlers. Overrides script-src for element-based scripts when present.",
    fallback: ["script-src", "default-src"],
    takesSources: true,
    whenAbsent: "Falls back to script-src, then default-src.",
    example: "script-src-elem 'self' https://cdn.example.com",
    mdn: `${MDN}/script-src-elem`,
  },
  {
    name: "script-src-attr",
    category: "fetch",
    title: "Script Attribute Source",
    summary: "Controls inline event handler attributes.",
    description:
      "Governs inline JavaScript event handlers such as onclick=\"…\". Typically set to 'none' to block all inline handlers while still allowing element scripts.",
    fallback: ["script-src", "default-src"],
    takesSources: true,
    whenAbsent: "Falls back to script-src, then default-src.",
    example: "script-src-attr 'none'",
    mdn: `${MDN}/script-src-attr`,
  },
  {
    name: "style-src",
    category: "fetch",
    title: "Style Source",
    summary: "Valid sources for stylesheets.",
    description:
      "Controls where CSS may be loaded from and whether inline styles, <style> blocks, nonces and hashes are allowed.",
    fallback: ["default-src"],
    takesSources: true,
    whenAbsent: "Falls back to default-src; if unset, all styles are allowed.",
    example: "style-src 'self' 'unsafe-inline'",
    mdn: `${MDN}/style-src`,
  },
  {
    name: "style-src-elem",
    category: "fetch",
    title: "Style Element Source",
    summary: "Sources for <style> and <link rel=stylesheet>.",
    description:
      "Applies to stylesheet elements and <style> blocks, but not to inline style attributes.",
    fallback: ["style-src", "default-src"],
    takesSources: true,
    whenAbsent: "Falls back to style-src, then default-src.",
    example: "style-src-elem 'self'",
    mdn: `${MDN}/style-src-elem`,
  },
  {
    name: "style-src-attr",
    category: "fetch",
    title: "Style Attribute Source",
    summary: "Controls inline style=\"…\" attributes.",
    description:
      "Governs inline style attributes on elements. Often set to 'none' or restricted with hashes.",
    fallback: ["style-src", "default-src"],
    takesSources: true,
    whenAbsent: "Falls back to style-src, then default-src.",
    example: "style-src-attr 'none'",
    mdn: `${MDN}/style-src-attr`,
  },
  {
    name: "img-src",
    category: "fetch",
    title: "Image Source",
    summary: "Valid sources for images and favicons.",
    description: "Controls where images, <img>, and favicons may be loaded from.",
    fallback: ["default-src"],
    takesSources: true,
    whenAbsent: "Falls back to default-src; if unset, all images are allowed.",
    example: "img-src 'self' data: https:",
    mdn: `${MDN}/img-src`,
  },
  {
    name: "font-src",
    category: "fetch",
    title: "Font Source",
    summary: "Valid sources for fonts loaded via @font-face.",
    description: "Controls where web fonts may be loaded from.",
    fallback: ["default-src"],
    takesSources: true,
    whenAbsent: "Falls back to default-src; if unset, all fonts are allowed.",
    example: "font-src 'self' https://fonts.gstatic.com",
    mdn: `${MDN}/font-src`,
  },
  {
    name: "connect-src",
    category: "fetch",
    title: "Connect Source",
    summary: "Restricts fetch/XHR/WebSocket/EventSource endpoints.",
    description:
      "Controls the URLs that can be loaded using script interfaces: fetch(), XMLHttpRequest, WebSocket, EventSource, and navigator.sendBeacon().",
    fallback: ["default-src"],
    takesSources: true,
    whenAbsent: "Falls back to default-src; if unset, all connections are allowed.",
    example: "connect-src 'self' https://api.example.com wss://live.example.com",
    mdn: `${MDN}/connect-src`,
  },
  {
    name: "media-src",
    category: "fetch",
    title: "Media Source",
    summary: "Valid sources for <audio>, <video>, <track>.",
    description: "Controls where audio and video media may be loaded from.",
    fallback: ["default-src"],
    takesSources: true,
    whenAbsent: "Falls back to default-src; if unset, all media is allowed.",
    example: "media-src 'self' https://media.example.com",
    mdn: `${MDN}/media-src`,
  },
  {
    name: "object-src",
    category: "fetch",
    title: "Object Source",
    summary: "Sources for <object>, <embed>, <applet>.",
    description:
      "Controls plugins loaded via <object> and <embed>. Best practice is object-src 'none' to disable legacy plugins entirely.",
    fallback: ["default-src"],
    takesSources: true,
    whenAbsent: "Falls back to default-src; if unset, all plugin objects are allowed.",
    example: "object-src 'none'",
    mdn: `${MDN}/object-src`,
  },
  {
    name: "frame-src",
    category: "fetch",
    title: "Frame Source",
    summary: "Valid sources for nested <iframe> content.",
    description: "Controls the URLs that can be embedded as frames in the document.",
    fallback: ["child-src", "default-src"],
    takesSources: true,
    whenAbsent: "Falls back to child-src, then default-src.",
    example: "frame-src 'self' https://www.youtube.com",
    mdn: `${MDN}/frame-src`,
  },
  {
    name: "child-src",
    category: "fetch",
    title: "Child Source",
    summary: "Sources for web workers and nested frames (legacy).",
    description:
      "Originally controlled both frames and workers. Superseded by frame-src and worker-src, but still acts as their fallback.",
    fallback: ["default-src"],
    takesSources: true,
    whenAbsent: "Falls back to default-src.",
    example: "child-src 'self'",
    mdn: `${MDN}/child-src`,
  },
  {
    name: "worker-src",
    category: "fetch",
    title: "Worker Source",
    summary: "Sources for Worker, SharedWorker, ServiceWorker.",
    description: "Controls the URLs that may be loaded as Web Workers or Service Workers.",
    fallback: ["child-src", "script-src", "default-src"],
    takesSources: true,
    whenAbsent: "Falls back to child-src, then script-src, then default-src.",
    example: "worker-src 'self'",
    mdn: `${MDN}/worker-src`,
  },
  {
    name: "manifest-src",
    category: "fetch",
    title: "Manifest Source",
    summary: "Valid sources for the web app manifest.",
    description: "Controls where the application manifest file may be loaded from.",
    fallback: ["default-src"],
    takesSources: true,
    whenAbsent: "Falls back to default-src.",
    example: "manifest-src 'self'",
    mdn: `${MDN}/manifest-src`,
  },
  {
    name: "prefetch-src",
    category: "fetch",
    title: "Prefetch Source",
    summary: "Sources for prefetch and prerender requests.",
    description:
      "Controlled where resources fetched via <link rel=prefetch/prerender> could come from. Removed from the spec and unsupported in current browsers.",
    fallback: ["default-src"],
    takesSources: true,
    whenAbsent: "Falls back to default-src.",
    experimental: true,
    deprecated: true,
    example: "prefetch-src 'self'",
    mdn: `${MDN}/prefetch-src`,
  },
  {
    name: "fenced-frame-src",
    category: "fetch",
    title: "Fenced Frame Source",
    summary: "Sources for <fencedframe> content (Privacy Sandbox).",
    description:
      "Controls valid sources for nested browsing contexts loaded into <fencedframe> elements. Part of the experimental Privacy Sandbox.",
    fallback: ["frame-src", "child-src", "default-src"],
    takesSources: true,
    whenAbsent: "Falls back to frame-src, then child-src, then default-src.",
    experimental: true,
    example: "fenced-frame-src https://example.com",
    mdn: `${MDN}/fenced-frame-src`,
  },

  // ───────────────────────────── Document ─────────────────────────────
  {
    name: "base-uri",
    category: "document",
    title: "Base URI",
    summary: "Restricts the URLs usable in <base>.",
    description:
      "Limits the URLs that can be used in a document's <base> element. Setting base-uri 'self' or 'none' prevents attackers from hijacking relative URLs via an injected <base> tag.",
    fallback: [],
    takesSources: true,
    whenAbsent: "Any <base> URL is allowed, enabling base-tag injection attacks.",
    example: "base-uri 'self'",
    mdn: `${MDN}/base-uri`,
  },
  {
    name: "sandbox",
    category: "document",
    title: "Sandbox",
    summary: "Applies an iframe-style sandbox to the document.",
    description:
      "Enables a sandbox for the resource, similar to the <iframe> sandbox attribute. It uses allow-* tokens rather than source lists. With no tokens, all restrictions apply.",
    fallback: [],
    takesSources: false,
    whenAbsent: "No sandbox restrictions are applied to the document.",
    example: "sandbox allow-scripts allow-forms",
    mdn: `${MDN}/sandbox`,
  },

  // ──────────────────────────── Navigation ────────────────────────────
  {
    name: "form-action",
    category: "navigation",
    title: "Form Action",
    summary: "Restricts where <form> submissions may go.",
    description:
      "Controls the URLs that can be used as the target of form submissions. Notably it does NOT fall back to default-src.",
    fallback: [],
    takesSources: true,
    whenAbsent: "Forms may be submitted to any URL.",
    example: "form-action 'self'",
    mdn: `${MDN}/form-action`,
  },
  {
    name: "frame-ancestors",
    category: "navigation",
    title: "Frame Ancestors",
    summary: "Controls who may embed this page (anti-clickjacking).",
    description:
      "Specifies valid parents that may embed the page using <iframe>, <object>, etc. The modern replacement for X-Frame-Options. Does not fall back to default-src.",
    fallback: [],
    takesSources: true,
    whenAbsent: "The page can be framed by any origin (clickjacking risk).",
    example: "frame-ancestors 'none'",
    mdn: `${MDN}/frame-ancestors`,
  },
  {
    name: "navigate-to",
    category: "navigation",
    title: "Navigate To",
    summary: "Restricts which URLs the document may navigate to.",
    description:
      "Was intended to restrict the destinations a document could navigate to by any means. Removed from the spec; not implemented in browsers.",
    fallback: [],
    takesSources: true,
    whenAbsent: "No navigation restrictions are applied.",
    experimental: true,
    deprecated: true,
    example: "navigate-to 'self'",
    mdn: `${MDN}`,
  },

  // ───────────────────────────── Reporting ─────────────────────────────
  {
    name: "report-to",
    category: "reporting",
    title: "Report To",
    summary: "Names a Reporting-API group for violation reports.",
    description:
      "References a reporting endpoint group declared via the Reporting-Endpoints (or Report-To) response header. The modern replacement for report-uri.",
    fallback: [],
    takesSources: false,
    whenAbsent: "Violations are not reported (unless report-uri is present).",
    example: "report-to csp-endpoint",
    mdn: `${MDN}/report-to`,
  },
  {
    name: "report-uri",
    category: "reporting",
    title: "Report URI",
    summary: "Legacy endpoint for violation reports.",
    description:
      "Instructs the browser to POST CSP violation reports to the given URI(s). Deprecated in favour of report-to, but still widely supported for backwards compatibility.",
    fallback: [],
    takesSources: false,
    whenAbsent: "Violations are not reported (unless report-to is present).",
    deprecated: true,
    example: "report-uri https://example.com/csp-reports",
    mdn: `${MDN}/report-uri`,
  },

  // ─────────────────────────────── Other ───────────────────────────────
  {
    name: "upgrade-insecure-requests",
    category: "other",
    title: "Upgrade Insecure Requests",
    summary: "Rewrites http:// requests to https://.",
    description:
      "Instructs the browser to treat all of a site's insecure URLs as though they had been replaced with secure ones. A value-less flag directive.",
    fallback: [],
    takesSources: false,
    whenAbsent: "Insecure requests are sent as-is (may be blocked as mixed content).",
    example: "upgrade-insecure-requests",
    mdn: `${MDN}/upgrade-insecure-requests`,
  },
  {
    name: "require-trusted-types-for",
    category: "other",
    title: "Require Trusted Types For",
    summary: "Enforces Trusted Types at DOM sink injection points.",
    description:
      "Requires Trusted Types at dangerous DOM injection sinks (e.g. innerHTML). The only valid value is 'script'. A strong defence against DOM-based XSS.",
    fallback: [],
    takesSources: false,
    whenAbsent: "Trusted Types are not enforced at DOM sinks.",
    example: "require-trusted-types-for 'script'",
    mdn: `${MDN}/require-trusted-types-for`,
  },
  {
    name: "trusted-types",
    category: "other",
    title: "Trusted Types",
    summary: "Allow-list of Trusted Types policy names.",
    description:
      "Declares an allow-list of Trusted Types policy names and controls whether duplicate names are permitted (via 'allow-duplicates').",
    fallback: [],
    takesSources: false,
    whenAbsent: "Any Trusted Types policy name may be created.",
    example: "trusted-types default dompurify",
    mdn: `${MDN}/trusted-types`,
  },

  // ───────────────────────────── Deprecated ─────────────────────────────
  {
    name: "block-all-mixed-content",
    category: "deprecated",
    title: "Block All Mixed Content",
    summary: "Blocked all mixed content (now obsolete).",
    description:
      "Prevented loading any assets over HTTP when the page is HTTPS. Deprecated — modern browsers block or auto-upgrade mixed content by default.",
    fallback: [],
    takesSources: false,
    whenAbsent: "Modern browsers already block/upgrade mixed content by default.",
    deprecated: true,
    example: "block-all-mixed-content",
    mdn: `${MDN}/block-all-mixed-content`,
  },
  {
    name: "plugin-types",
    category: "deprecated",
    title: "Plugin Types",
    summary: "Restricted plugin MIME types (removed).",
    description:
      "Limited the set of plugins that could be embedded by restricting their MIME types. Removed from the spec and no longer supported.",
    fallback: [],
    takesSources: false,
    whenAbsent: "No effect — directive is obsolete.",
    deprecated: true,
    example: "plugin-types application/pdf",
    mdn: `${MDN}/plugin-types`,
  },
  {
    name: "referrer",
    category: "deprecated",
    title: "Referrer",
    summary: "Set the Referer policy (non-standard, removed).",
    description:
      "An early, non-standard way to control the Referer header. Replaced entirely by the Referrer-Policy header.",
    fallback: [],
    takesSources: false,
    whenAbsent: "Use the Referrer-Policy header instead.",
    deprecated: true,
    example: "referrer no-referrer",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy",
  },
]

export const DIRECTIVE_MAP: Record<string, DirectiveMeta> = Object.fromEntries(
  DIRECTIVES.map((d) => [d.name, d]),
)

export const CATEGORY_ORDER: Category[] = [
  "fetch",
  "document",
  "navigation",
  "reporting",
  "other",
  "deprecated",
]

export const CATEGORY_INFO: Record<
  Category,
  { label: string; blurb: string; token: string }
> = {
  fetch: {
    label: "Fetch Directives",
    blurb:
      "Control where each type of resource (scripts, styles, images, connections…) may be loaded from. These fall back to default-src.",
    token: "cat-fetch",
  },
  document: {
    label: "Document Directives",
    blurb: "Govern properties of the document itself, such as its base URL and sandboxing.",
    token: "cat-document",
  },
  navigation: {
    label: "Navigation Directives",
    blurb:
      "Govern where the user may navigate or submit forms, and who may embed the page.",
    token: "cat-navigation",
  },
  reporting: {
    label: "Reporting Directives",
    blurb: "Decide where the browser sends Content-Security-Policy violation reports.",
    token: "cat-reporting",
  },
  other: {
    label: "Other Directives",
    blurb: "Behavioural directives like Trusted Types and HTTPS upgrades.",
    token: "cat-other",
  },
  deprecated: {
    label: "Deprecated / Removed",
    blurb: "Directives kept here for reference. Avoid using them in new policies.",
    token: "cat-other",
  },
}
