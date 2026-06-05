import { useState } from "react"
import { Check, FileText } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { copyText } from "@/lib/clipboard"
import { buildMarkdownReport } from "@/lib/csp/report"
import type { Analysis } from "@/lib/csp/types"

/** Copies the full analysis as a Markdown report. */
export function CopyReportButton({ analysis }: { analysis: Analysis }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    const md = buildMarkdownReport(analysis)
    if (await copyText(md)) {
      setCopied(true)
      toast.success("Report copied as Markdown", {
        description: "Paste it into an issue, PR, or doc.",
      })
      window.setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error("Couldn’t copy the report")
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={copy} className="gap-1.5">
      <span className="relative grid size-4 place-items-center">
        <Check
          className={`absolute size-4 transition-all duration-200 ease-out ${
            copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        />
        <FileText
          className={`absolute size-4 transition-all duration-200 ease-out ${
            copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
          }`}
        />
      </span>
      {copied ? "Copied" : "Copy report"}
    </Button>
  )
}
