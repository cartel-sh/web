import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span 
      className={cn(
        "inline-block px-3 py-1 mb-4 text-xs font-medium",
        "bg-primary/20 text-primary rounded-full",
        "border border-border",
        className
      )} 
      style={{ letterSpacing: '0.2em' }}
    >
      {children}
    </span>
  );
}