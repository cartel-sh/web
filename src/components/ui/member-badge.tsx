"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { CornerCard } from "@/components/ui/corner-card";
import { useENSData } from "@/hooks/useENSData";
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
    <button onClick={handleClick} className={cn("text-left cursor-pointer min-w-[220px]", className)} aria-label={`Open ${ensName} profile`}>
      <CornerCard variant="member" interactive contentClassName="p-5 py-4" cornerClassName="-top-0.5 -right-2" className="bg-card/50 rounded-xl rounded-tr-2xl hover:bg-card/60 transition-colors">
        <div className="group relative flex items-center justify-end gap-3">
          <div className="flex-1 min-w-0 text-right">
            <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors text-right">
              {ensName}
            </h4>
          </div>
          <div className="relative">
            <Image
              src={avatar && !avatarError ? avatar : `https://api.dicebear.com/9.x/lorelei-neutral/svg?seed=${ensName}`}
              alt={name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full"
              unoptimized
              onError={() => setAvatarError(true)}
            />
          </div>
        </div>
      </CornerCard>
    </button>
  );
}