"use client";

import { Stoke, Italianno } from "next/font/google";

const stoke = Stoke({ subsets: ["latin"], weight: ["400"] });
const italianno = Italianno({ subsets: ["latin"], weight: "400" });

export function SiteHeader() {
  return (
    <header className="mb-6">
      <div className="relative w-full mx-auto h-fit">
        <div
          className="relative text-foreground"
          style={{
            width: "min(80vw, 1000px)",
            aspectRatio: "1391 / 378",
            marginLeft: "calc(50% - min(80vw, 1000px)/2 - 50px)",
          }}
        >
          <div className="relative w-full h-full">
            <div
              aria-hidden="true"
              className="ml-24 absolute inset-0 bg-current"
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
              <div className="relative">
                <h1
                  className={`${stoke.className} font-normal`}
                  style={{
                    fontSize: "calc(min(80vw, 1000px) * 0.085)",
                    lineHeight: 1,
                    transform: "translateX(calc(min(80vw, 1000px) * 0.12))",
                  }}
                >
                  Indie Cartel,
                </h1>
                <span
                  className={`${stoke.className} font-normal absolute underline decoration-foreground decoration-2.5 underline-offset-4`}
                  style={{
                    fontSize: "calc(min(80vw, 1000px) * 0.045)",
                    bottom: "calc(-1 * min(80vw, 1000px) * 0.06)",
                    right: "calc(-1 * min(80vw, 1000px) * 0.209)",
                  }}
                >
                  global.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className={`${italianno.className} text-3xl md:text-4xl lg:text-5xl text-foreground/90 pl-24 -mt-10`}>
          The people of the world, accelerating public goods.
        </p>
      </div>
    </header>
  );
}
