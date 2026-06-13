import { cn } from "@/lib/utils"

interface BadgeProps {
  className?: string
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline"
  children: React.ReactNode
}

export function Badge({ className, variant = "default", children }: BadgeProps) {
  const variants = {
    default: "bg-[#5D4037] text-white",
    secondary: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    outline: "border border-[#D7CCC8] text-[#5D4037] bg-transparent",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
