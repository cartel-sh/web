"use client";

import { Button } from "@/components/ui/button";
import { FaDiscord, FaTelegram } from "react-icons/fa";
import { Stoke } from "next/font/google";
import { useEffect } from "react";

const stoke = Stoke({ subsets: ["latin"], weight: "400" });

export default function Community() {
  useEffect(() => {
    document.title = "Community - Cartel";
  }, []);

  return (
    <div className="flex items-center justify-center px-4 py-32">
      <div className="max-w-2xl w-full text-center">
        <h1 className={`${stoke.className} text-4xl md:text-5xl lg:text-6xl mb-12 font-bold italic`} style={{ letterSpacing: '-0.1em' }}>
          Join the Community
        </h1>
        
        <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto">
          <Button
            variant="outline"
            className="h-24 md:h-28 flex items-center justify-center rounded-xl hover:cursor-pointer transition-transform"
            onClick={() => window.open('https://discord.gg/FZzD7DZksj', '_blank')}
            aria-label="Join Discord"
          >
            <FaDiscord className="size-12 md:size-16" />
          </Button>
          <Button
            variant="outline"
            className="h-24 md:h-28 flex items-center justify-center rounded-xl hover:cursor-pointer transition-transform"
            onClick={() => window.open('https://t.me/cartel_sh', '_blank')}
            aria-label="Join Telegram"
          >
            <FaTelegram className="size-12 md:size-16" />
          </Button>
        </div>
      </div>
    </div>
  );
}