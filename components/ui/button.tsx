import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "cursor-pointer group/button inline-flex shrink-0 items-center justify-center border-2 font-display font-semibold whitespace-nowrap transition-colors outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "border-border bg-foreground text-background hover:bg-accent hover:text-accent-foreground",
        brand: "border-primary bg-primary text-foreground hover:border-accent hover:bg-accent hover:text-accent-foreground",
        outline: "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground",
        secondary: "border-border/15 bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
        ghost: "border-transparent text-foreground hover:bg-muted aria-expanded:bg-muted",
        destructive: "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground",
        link: "border-transparent font-medium text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 gap-2 px-4 text-sm",
        sm: "h-8 gap-1.5 px-3 text-xs",
        lg: "min-h-12 gap-2 px-6 text-base",
        icon: "size-11",
        "icon-sm": "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
