import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeading({ title, subtitle, centered = true, className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-10 sm:mb-12 md:mb-16", centered && "text-center", className)}>
      <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-medium tracking-tight text-primary-dark leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 sm:mt-4 text-[15px] sm:text-lg md:text-xl text-warm-500 max-w-2xl leading-relaxed mx-auto">
          {subtitle}
        </p>
      )}
      <div className="mt-6 flex justify-center">
        <div className="h-px w-16 bg-primary/30" />
      </div>
    </div>
  );
}
