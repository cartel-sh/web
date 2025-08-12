"use client";

import { Stoke, Tangerine } from "next/font/google";

const stoke = Stoke({ subsets: ["latin"], weight: ["400"] });
const tangerine = Tangerine({ subsets: ["latin"], weight: "400" });

export function SiteHeader() {
  return (
    <header className="mb-6 pt-10">
      <div className="relative w-full mx-auto h-fit">
        <div
          className="relative mx-auto text-foreground"
          style={{
            width: "min(80vw, 1000px)",
            aspectRatio: "1391 / 378",
          }}
        >
          <div className="relative w-full h-full">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-current"
              style={{
                WebkitMaskImage: "url(/images/cartel_header.svg)",
                maskImage: "url(/images/cartel_header.svg)",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h1
                className={`${stoke.className} font-normal`}
                style={{
                  fontSize: "calc(min(80vw, 1000px) * 0.085)",
                  lineHeight: 1,
                  transform: "translateX(calc(min(80vw, 1000px) * 0.03))",
                }}
              >
                Indie Cartel
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className={`${tangerine.className} text-3xl md:text-4xl lg:text-5xl text-foreground/90`}>
          The people of the world, accelerating Ethereum social.
        </p>
      </div>
    </header>
  );
}
