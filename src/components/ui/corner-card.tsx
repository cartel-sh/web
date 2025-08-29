"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

type CornerVariant = "manifesto" | "project" | "ally" | "member" | "treasury";

interface CornerCardProps extends PropsWithChildren {
  className?: string;
  contentClassName?: string;
  variant?: CornerVariant;
  cornerSrc?: string; // override image path if provided
  interactive?: boolean;
  ariaLabel?: string;
  cornerClassName?: string;
}

const variantToCorner: Record<CornerVariant, string> = {
  manifesto: "/images/corner1.png",
  project: "/images/corner4.png",
  ally: "/images/corner3.png",
  member: "/images/corner5.png",
  treasury: "/images/corner1.png",
};

export const CornerCard = ({
  className,
  contentClassName,
  children,
  variant = "project",
  cornerSrc,
  interactive = false,
  ariaLabel,
  cornerClassName,
}: CornerCardProps) => {
  const imageSrc = cornerSrc || variantToCorner[variant];

  return (
    <div
      className={cn(
        "relative border rounded-lg border-border bg-card/50",
        interactive && "transition-transform duration-200 hover:bg-card/80 hover:scale-105",
        className
      )}
      aria-label={ariaLabel}
    >
      <div className={cn("p-4 sm:p-5 md:p-6", contentClassName)}>{children}</div>

      {/* Decorative corner image */}
      <div
        className={cn(
          "pointer-events-none select-none text-border opacity-80 absolute top-0 right-0",
          cornerClassName,
          variant === "member" && "right-[0.25px]" // Override for member cards - must come after cornerClassName
        )}
      >
        <Image
          src={imageSrc}
          alt=""
          width={180}
          height={80}
          priority={false}
          className={variant === "manifesto" ? "max-w-[140px] sm:max-w-[160px] md:max-w-full" : ""}
        />
      </div>
    </div>
  );
};


