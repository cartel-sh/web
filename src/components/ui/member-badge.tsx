"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useENSData } from "@/hooks/useENSData";

interface MemberBadgeProps {
  name: string;
  ensName: string;
  badge: string;
  link: string;
  className?: string;
}

export function MemberBadge({ name, ensName, badge, link, className }: MemberBadgeProps) {
  const { description, avatar, isLoading } = useENSData(ensName);

  const handleClick = () => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "group relative flex flex-col gap-4 p-4 rounded-3xl border border-foreground/20 bg-card/50 hover:bg-card/80 transition-all duration-200 cursor-pointer hover:scale-105",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Image
            src={avatar}
            alt={name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
            {ensName}
          </h4>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
    </div>
  );
}