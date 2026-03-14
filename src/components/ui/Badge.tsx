import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
  size?: "default" | "sm" | "lg";
}

const badgeVariants = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  outline: "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
};

const sizeVariants = {
  default: "h-8 w-8 px-2.5 py-0.5",
  sm: "h-6 w-6 px-2 py-0.5",
  lg: "h-10 w-10 px-3 py-0.5"
};

export function Badge({ className, variant = "default", size = "default", ...props }: BadgeProps) {
  const variantClass = badgeVariants[variant as keyof typeof badgeVariants] || badgeVariants.default;
  const sizeClass = sizeVariants[size as keyof typeof sizeVariants] || sizeVariants.default;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        variantClass,
        sizeClass,
        className
      )}
      {...props}
    />
  );
}
