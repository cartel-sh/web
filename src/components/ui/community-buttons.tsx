"use client";

import { Button } from "@/components/ui/button";
import { FaDiscord, FaTelegram } from "react-icons/fa";

export function CommunityButtons() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <Button
        variant="outline"
        className="h-full min-h-[100px] sm:min-h-[120px] md:min-h-[130px] hover:bg-card hover:cursor-pointer flex items-center justify-center rounded-xl transition-transform duration-200 hover:scale-[1.02]"
        onClick={() => window.open('https://discord.gg/FZzD7DZksj', '_blank')}
        aria-label="Join Discord"
      >
        <FaDiscord className="size-10 sm:size-12 md:size-16" />
      </Button>
      <Button
        variant="outline"
        className="h-full min-h-[100px] sm:min-h-[120px] md:min-h-[130px] hover:bg-card hover:cursor-pointer flex items-center justify-center rounded-xl transition-transform duration-200 hover:scale-[1.02]"
        onClick={() => window.open('https://t.me/cartel_sh', '_blank')}
        aria-label="Join Telegram"
      >
        <FaTelegram className="size-10 sm:size-12 md:size-14" />
      </Button>
    </div>
  );
}