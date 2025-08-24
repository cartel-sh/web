"use client";

import { cn } from "@/lib/utils";
import { CornerCard } from "@/components/ui/corner-card";

interface AlliesCardProps {
  name: string;
  description: string;
  link: string;
  className?: string;
}

export function AlliesCard({ name, description, link, className }: AlliesCardProps) {
  return (
    <a 
      href={link} 
      className={cn(
        "block transition-transform hover:scale-[1.02] cursor-pointer",
        className
      )}
    >
      <CornerCard 
        variant="ally" 
        contentClassName="p-6" 
        className="bg-card/50 rounded-xl rounded-tr-2xl hover:bg-card/60 transition-colors" 
        cornerClassName="-top-0.5 -right-0.5"
      >
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-muted-foreground">
          {description}
        </p>
      </CornerCard>
    </a>
  );
}