"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface MemberBadgeProps {
  name: string;
  handle: string;
  avatar: string;
  link: string;
  badge: string;
  className?: string;
}

export function MemberBadge({ name, handle, avatar, link, badge, className }: MemberBadgeProps) {
  const handleClick = () => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-lg border border-foreground/20 bg-card/50 hover:bg-card/80 transition-all duration-200 cursor-pointer hover:scale-105",
        className
      )}
    >
      <div className="relative">
        <Image
          src={avatar}
          alt={name}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full"
          unoptimized
        />
        {badge === "ethereum" && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
        {badge === "nouns" && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-background"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
          {name}
        </h4>
        <p className="text-xs text-muted-foreground truncate">
          {handle}
        </p>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </div>
  );
}