import { Outlet } from "react-router-dom"
import { ShieldCheck } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

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
          <ModeToggle />
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
