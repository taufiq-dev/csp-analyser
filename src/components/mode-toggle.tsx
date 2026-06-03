import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun className="size-[1.2rem] scale-0 -rotate-90 transition-transform duration-300 ease-out dark:scale-100 dark:rotate-0" />
      <Moon className="absolute size-[1.2rem] scale-100 rotate-0 transition-transform duration-300 ease-out dark:scale-0 dark:rotate-90" />
    </Button>
  )
}
