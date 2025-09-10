  import { cn } from "@/lib/utils";
  import { Lato } from "next/font/google";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}
const lato = Lato({ subsets: ["latin"], weight: "400" });

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span 
      className={cn(
        lato.className,
        "inline-block px-3 py-1 text-xs mb-4 font-medium",
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