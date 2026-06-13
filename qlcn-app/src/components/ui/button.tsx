"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "danger" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          
          // Variants
          {
            "bg-[#F9A825] text-[#3E2723] hover:bg-[#E6970F] focus-visible:ring-[#F9A825]": variant === "default",
            "bg-[#5D4037] text-white hover:bg-[#4E342E] focus-visible:ring-[#5D4037]": variant === "secondary",
            "bg-[#E53935] text-white hover:bg-[#C62828] focus-visible:ring-[#E53935]": variant === "danger",
            "border border-[#5D4037] bg-white text-[#5D4037] hover:bg-[#5D4037]/10": variant === "outline",
            "text-[#5D4037] hover:bg-[#5D4037]/10": variant === "ghost",
          },
          
          // Sizes
          {
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
