import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

const paddings = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({ children, className, hover = false, padding = "md" }: CardProps) {
  return (
    <div
      className={cn(
        "bg-warm-50 rounded-[var(--radius-card)] shadow-[var(--shadow-card)]",
        hover && "transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]",
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
