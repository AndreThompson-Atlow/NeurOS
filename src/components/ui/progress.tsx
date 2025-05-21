
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    variant?: 'default' | 'law' | 'chaos' | 'neutralProgress'; 
    style?: React.CSSProperties & { '--progress-fill'?: string }; 
  }
>(({ className, value, variant = 'default', style, ...props }, ref) => {
  
  let indicatorClassName = "bg-primary"; // Default: theme primary (Specter Cyan if primary is not overridden)
  
  if (!style?.['--progress-fill']) { // Only apply class-based color if not overridden by style
    switch(variant) {
      case 'law':
        indicatorClassName = "bg-law-primary-color"; // Construct Gold
        break;
      case 'chaos':
        indicatorClassName = "bg-chaos-primary-color"; // Judgment Crimson
        break;
      case 'neutralProgress':
        indicatorClassName = "bg-[hsl(var(--neutral-progress-fill))]"; // Specific neutral fill
        break;
      case 'default':
      default:
        // Default uses primary color, which is defined in globals.css for --primary
        // and then this component maps that to bg-primary.
        break;
    }
  }
  
  const finalIndicatorStyle: React.CSSProperties = {
    transform: `translateX(-${100 - (value || 0)}%)`,
    ...(style?.['--progress-fill'] && { backgroundColor: style['--progress-fill'] }),
  };


  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted", 
        className
      )}
      style={style} 
      {...props} 
    >
      <ProgressPrimitive.Indicator
        className={cn(
            "h-full w-full flex-1 transition-all", 
            !style?.['--progress-fill'] ? indicatorClassName : '' 
        )}
        style={finalIndicatorStyle} 
        data-variant={variant} 
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
