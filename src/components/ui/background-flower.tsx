"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface BackgroundFlowerProps {
  flowerNumber: number;
  rotation?: number;
  className?: string;
  size?: number;
}

export function BackgroundFlower({
  flowerNumber,
  rotation = 0,
  className,
  size = 120,
}: BackgroundFlowerProps) {
  return (
    <div
      className={cn(
        "absolute pointer-events-none opacity-20 md:opacity-25 lg:opacity-30",
        className
      )}
      style={{
        transform: `rotate(${rotation}deg)`,
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <Image
        src={`/images/flower${flowerNumber}.png`}
        alt=""
        width={size}
        height={size}
        className="w-full h-full object-contain scale-80 md:scale-90 lg:scale-100"
      />
    </div>
  );
}