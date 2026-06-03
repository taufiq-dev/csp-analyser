import { motion, useReducedMotion } from "motion/react"
import { DirectiveCard } from "@/components/directive-card"
import { CATEGORY_INFO } from "@/lib/csp/directives"
import type { AnalyzedDirective, Category } from "@/lib/csp/types"

export function CategorySection({
  category,
  directives,
}: {
  category: Category
  directives: AnalyzedDirective[]
}) {
  const reduce = useReducedMotion()
  const info = CATEGORY_INFO[category]
  if (directives.length === 0) return null

  const setCount = directives.filter((d) => d.status !== "unset").length

  return (
    <section className="scroll-mt-20" id={category}>
      <div className="mb-3 flex items-start gap-3">
        <span
          aria-hidden
          className="mt-1 h-5 w-1 shrink-0 rounded-full"
          style={{ background: `var(--color-${info.token})` }}
        />
        <div className="flex-1">
          <h2 className="flex items-baseline gap-2 text-base font-semibold tracking-tight">
            {info.label}
            <span className="tabular text-xs font-normal text-muted-foreground">
              {setCount}/{directives.length} active
            </span>
          </h2>
          <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">{info.blurb}</p>
        </div>
      </div>

      <motion.div
        className="grid gap-2.5"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={{
          show: { transition: { staggerChildren: 0.04 } },
        }}
      >
        {directives.map((d) => (
          <motion.div
            key={d.meta.name}
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.28, ease: [0.165, 0.84, 0.44, 1] },
              },
            }}
          >
            <DirectiveCard directive={d} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
