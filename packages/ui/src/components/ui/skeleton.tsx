import { cn } from "@repo/ui/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  if (props.children) {
    return (
      <div
        className={cn("animate-pulse rounded-md bg-primary/10", className)}
        {...props}
      >
        <div className="invisible">
          {props.children}
          </div>
      </div>
    )
  }


  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
