import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-spacing-xs whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80 shadow-cyan-btn", // Mapped to Highlight Neon (Specter Cyan)
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-crimson-btn", // Judgment Crimson
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground", // General outline
        secondary: 
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-crimson-btn", // Mapped to Accent Glow (Judgment Crimson)
        ghost: "hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80", // Uses primary (Specter Cyan for links)
        
        // Alignment-specific variants using new theme colors
        law: "bg-law-primary-color text-law-text-color hover:bg-law-primary-color/80 shadow-gold-btn font-law", // Construct Gold
        chaos: "bg-chaos-primary-color text-chaos-text-color hover:bg-chaos-primary-color/80 shadow-crimson-btn font-chaos", // Judgment Crimson
        neutral: "bg-neutral-primary-color text-neutral-text-color hover:bg-neutral-primary-color/80 shadow-cyan-btn font-neutral", // Specter Cyan
      },
      size: {
        default: "h-10 px-spacing-sm py-spacing-xs", 
        sm: "h-9 rounded-md px-3", 
        lg: "h-11 rounded-md px-8", 
        icon: "h-10 w-10", 
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
