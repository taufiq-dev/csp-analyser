export interface ExamplePolicy {
  label: string
  description: string
  value: string
}

export const EXAMPLE_POLICIES: ExamplePolicy[] = [
  {
    label: "Strict (nonce + strict-dynamic)",
    description: "A modern, hardened policy.",
    value:
      "default-src 'self'; script-src 'nonce-r4nd0m' 'strict-dynamic'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; require-trusted-types-for 'script'; report-to csp",
  },
  {
    label: "Nonce + unsafe-inline fallback",
    description: "Shows how a nonce makes browsers ignore 'unsafe-inline'.",
    value:
      "default-src 'self'; script-src 'nonce-r4nd0m' 'unsafe-inline' 'strict-dynamic' https://cdn.example.com; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'none'",
  },
  {
    label: "Typical app",
    description: "Common real-world setup with a CDN and APIs.",
    value:
      "default-src 'self'; script-src 'self' https://cdn.example.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.example.com; frame-ancestors 'self'; report-uri https://example.com/csp",
  },
  {
    label: "Weak (lots of unsafe-*)",
    description: "Demonstrates risky values and findings.",
    value:
      "default-src *; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; img-src *; style-src 'unsafe-inline'",
  },
]
