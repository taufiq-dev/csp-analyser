import { useState } from "react"
import { Check, Link2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

/**
 * Copies the current URL (which carries the policy in ?policy=) to the
 * clipboard so a breakdown can be shared. Falls back to a legacy execCommand
 * copy if the async Clipboard API is unavailable.
 */
export function ShareButton() {
  const [copied, setCopied] = useState(false)

  async function copy() {
    const url = window.location.href
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const ta = document.createElement("textarea")
        ta.value = url
        ta.style.position = "fixed"
        ta.style.opacity = "0"
        document.body.appendChild(ta)
        ta.select()
        document.execCommand("copy")
        document.body.removeChild(ta)
      }
      setCopied(true)
      toast.success("Shareable link copied", {
        description: "The link includes this exact policy.",
      })
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Couldn’t copy the link", {
        description: "Your browser blocked clipboard access — copy the URL manually.",
      })
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={copy} className="gap-1.5">
      {/* fixed-size icon slot: no layout shift on swap (Emil) */}
      <span className="relative grid size-4 place-items-center">
        <Check
          className={`absolute size-4 transition-all duration-200 ease-out ${
            copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        />
        <Link2
          className={`absolute size-4 transition-all duration-200 ease-out ${
            copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
          }`}
        />
      </span>
      {copied ? "Copied" : "Copy link"}
    </Button>
  )
}
