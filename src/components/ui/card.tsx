import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    "data-alignment"?: 'law' | 'chaos' | 'neutral',
    "data-hover"?: 'true' | 'false'
  }
>(({ className, "data-alignment": alignment, "data-hover": hover = 'true', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-gradient-to-br from-card to-background text-card-foreground shadow-cyan-sm transition-transform duration-300 ease-in-out",
      hover === 'true' && "hover:scale-[1.02] hover:shadow-cyan-md", // Apply hover effect conditionally
      alignment === "law" && "border-l-4 border-l-law-primary-color",
      alignment === "chaos" && "border-l-4 border-l-chaos-primary-color",
      alignment === "neutral" && "border-l-4 border-l-neutral-primary-color",
      className
    )}
    data-alignment={alignment}
    data-hover={hover}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-spacing-xs p-spacing-md", className)} 
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight font-display", 
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground pt-spacing-xs", className)} 
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-spacing-md", className)} {...props} /> 
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-spacing-md pt-0", className)}  
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
