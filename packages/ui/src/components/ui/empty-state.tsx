import * as React from "react"
import { cn } from "@repo/ui/lib/utils"
import { LoaderCircle, LucideIcon } from "lucide-react"
import { Button } from "./button"

interface EmptyStateProps {
  title: string
  description: string
  icons?: LucideIcon[]
  action?: {
    label: string
    onClick: () => void
    disabled?: boolean
    loading?: boolean
  }
  action2?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  icons = [],
  action,
  action2,
  className,
  children
}: EmptyStateProps) {
  return (
    <div className={cn(
      "bg-background border-border hover:border-border/80 text-center",
      "border-2 border-dashed rounded-xl p-14 w-full max-w-[620px]",
      "group hover:bg-muted/50 transition duration-500 hover:duration-200",
      className
    )}>
      <div className="flex justify-center isolate">
        {icons.length === 3 ? (
          <>
            <div className="bg-background size-12 grid place-items-center rounded-xl relative left-2.5 top-1.5 -rotate-6 shadow-lg ring-1 ring-border group-hover:-translate-x-5 group-hover:-rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
              {React.createElement(icons[0], {
                className: "w-6 h-6 text-muted-foreground"
              })}
            </div>
            <div className="bg-background size-12 grid place-items-center rounded-xl relative z-10 shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
              {React.createElement(icons[1], {
                className: "w-6 h-6 text-muted-foreground"
              })}
            </div>
            <div className="bg-background size-12 grid place-items-center rounded-xl relative right-2.5 top-1.5 rotate-6 shadow-lg ring-1 ring-border group-hover:translate-x-5 group-hover:rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
              {React.createElement(icons[2], {
                className: "w-6 h-6 text-muted-foreground"
              })}
            </div>
          </>
        ) : (
          <div className="bg-background size-12 grid place-items-center rounded-xl shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
            {icons[0] && React.createElement(icons[0], {
              className: "w-6 h-6 text-muted-foreground"
            })}
          </div>
        )}
      </div>
      <h2 className="text-foreground font-medium mt-6">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{description}</p>
      <div className="flex justify-center gap-2 items-center mt-4">
        {action && (
          <Button
            onClick={action.onClick}
            variant="default"
            className={cn(
              "shadow-sm active:shadow-none"
            )}
            disabled={action.disabled ? true : undefined}
          >
            {action.loading ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Processing...
              </>
            ) : action.label}
          </Button>
        )}
        {action2}
      </div>
      {children}
    </div>
  )
}