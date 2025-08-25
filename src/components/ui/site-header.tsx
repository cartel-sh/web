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
            width: "clamp(320px, 80vw, 1000px)",
            aspectRatio: "1391 / 378",
            marginLeft: "calc(50% - clamp(320px, 80vw, 1000px)/2 - clamp(20px, 5vw, 50px))",
          }}
        >
          <div className="relative w-full h-full">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-current"
              style={{
                marginLeft: "clamp(24px, 6vw, 96px)",
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
                  className={`${stoke.className} font-normal relative`}
                  style={{
                    fontSize: "clamp(28px, calc(80vw * 0.085), 85px)",
                    lineHeight: 1,
                    transform: "translateX(clamp(38px, calc(80vw * 0.12), 120px))",
                  }}
                >
                  Indie Cartel,
                  <span
                    className={`${stoke.className} font-normal absolute underline decoration-foreground decoration-1.5 sm:decoration-2 md:decoration-2.5 underline-offset-2 sm:underline-offset-3 md:underline-offset-4`}
                    style={{
                      fontSize: "clamp(14px, 0.53em, 45px)",
                      bottom: "-1.2em",
                      right: "-2.1em",
                    }}
                  >
                    global.
                  </span>
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className={`${italianno.className} text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground/90 pl-6 sm:pl-12 md:pl-24 -mt-6 sm:-mt-8 md:-mt-10`}>
          The people of the world, accelerating public goods.
        </p>
      </div>
    </header>
  );
}
