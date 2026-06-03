import { Outlet } from "react-router-dom"
import { ShieldCheck } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

const REPO_URL = "https://github.com/taufiq-dev/csp-analyser"

// lucide-react v1 dropped brand icons, so inline the GitHub mark.
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3.5">
          <a href="/" className="flex items-center gap-2.5 font-mono text-sm font-medium">
            <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
              <ShieldCheck className="size-[18px]" />
            </span>
            <span className="tracking-tight">
              csp<span className="text-muted-foreground">·analyser</span>
            </span>
          </a>
          <div className="flex items-center gap-0.5">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="View source on GitHub"
              className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground"
            >
              <GithubIcon className="size-[18px]" />
            </a>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto w-full max-w-5xl px-5 py-5 text-xs text-muted-foreground">
          Paste a <code className="font-mono">Content-Security-Policy</code> header value to
          break it down. Everything runs locally in your browser — nothing is sent anywhere.
        </div>
      </footer>
    </div>
  )
}
