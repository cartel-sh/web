"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { CornerCard } from "@/components/ui/corner-card";
import { useENSData } from "@/hooks/useENSData";
import { ExternalLink, GemIcon, HatGlassesIcon } from "lucide-react";
import { useState } from "react";

interface MemberBadgeProps {
  name: string;
  ensName: string;
  badge: string;
  link: string;
  className?: string;
}

export function MemberBadge({ name, ensName, badge, link, className }: MemberBadgeProps) {
  const { description, avatar, isLoading } = useENSData(ensName);
  const [avatarError, setAvatarError] = useState(false);

  const handleClick = () => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <button onClick={handleClick} className={cn("text-left", className)} aria-label={`Open ${ensName} profile`}>
      <CornerCard variant="member" interactive contentClassName="p-5 py-4" cornerClassName="-top-0.5 -right-0.5 w-[185px]" className="bg-card/50 rounded-xl rounded-tr-2xl">
        <div className="group relative flex items-center justify-end gap-3">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors text-right">
              {ensName}
            </h4>
          </div>
          <div className="relative">
            {avatar && !avatarError ? (
              <Image
                src={avatar}
                alt={name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full"
                unoptimized
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground">
                <GemIcon className="w-6 h-6" />
              </div>
            )}
          </div>
        </div>
      </CornerCard>
    </button>
  );
}