import { useEffect, useRef, useState } from "react"
import { Form, useNavigation, useSubmit } from "react-router-dom"
import { Eraser, Sparkles, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { EXAMPLE_POLICIES } from "@/lib/csp/examples"

export function PolicyInput({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue)
  const submit = useSubmit()
  const navigation = useNavigation()
  const formRef = useRef<HTMLFormElement>(null)
  const busy = navigation.state !== "idle"

  // Keep the textarea in sync if the URL (loader value) changes externally.
  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  function runExample(policy: string) {
    setValue(policy)
    submit({ policy }, { method: "get", action: "/" })
  }

  function clear() {
    setValue("")
    submit({ policy: "" }, { method: "get", action: "/" })
  }

  return (
    <Form ref={formRef} method="get" action="/" className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="policy" className="text-sm font-medium">
          Content-Security-Policy header value
        </Label>
        <Textarea
          id="policy"
          name="policy"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            // Cmd/Ctrl+Enter submits (Emil: forms submit with keyboard).
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault()
              formRef.current?.requestSubmit()
            }
          }}
          placeholder="default-src 'self'; script-src 'self' 'nonce-…'; img-src * data:; …"
          spellCheck={false}
          className="min-h-28 resize-y font-mono text-[13px] leading-relaxed"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={busy || !value.trim()} className="gap-1.5">
          <Wand2 className="size-4" />
          {busy ? "Analysing…" : "Analyse"}
        </Button>
        <Button type="button" variant="ghost" onClick={clear} className="gap-1.5 text-muted-foreground">
          <Eraser className="size-4" /> Clear
        </Button>

        <span className="ml-auto flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" /> Try:
          </span>
          {EXAMPLE_POLICIES.map((ex) => (
            <Button
              key={ex.label}
              type="button"
              variant="outline"
              size="sm"
              title={ex.description}
              onClick={() => runExample(ex.value)}
              className="h-7 text-xs"
            >
              {ex.label}
            </Button>
          ))}
        </span>
      </div>
    </Form>
  )
}
