"use client";

import { Italianno, Stoke } from "next/font/google";
import { CornerCard } from "@/components/ui/corner-card";
import { SectionLabel } from "@/components/ui/section-label";
import { useEffect } from "react";

const italianno = Italianno({ subsets: ["latin"], weight: "400" });
const stoke = Stoke({ subsets: ["latin"], weight: "400" });

export default function Constitution() {
  useEffect(() => {
    document.title = "Constitution - Cartel";
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className={`${stoke.className} text-4xl md:text-5xl lg:text-6xl mb-12 text-center font-bold italic`} style={{ letterSpacing: '-0.1em' }}>
        Constitution
      </h1>
      
      <div className="space-y-8">
        <CornerCard variant="manifesto" contentClassName="p-10 px-16" cornerClassName="-top-0.5 -right-0.5" className="bg-card/50 rounded-xl">
          <div className={`${italianno.className} text-left text-foreground/90`}>
            <p className="decoration-foreground/40 decoration-2 text-2xl md:text-3xl leading-[1.8] mb-8">
              We the people of the world, unite with the purpose of building a free and prosperous society, develop, support and promote public goods.
            </p>
            
            <div className="mb-8">
              <h2 className={`${stoke.className} text-lg md:text-xl font-bold mb-4`}>Article I - Public Goods</h2>
              <p className="text-2xl md:text-3xl leading-[1.8] mb-2">
                Public goods are essential to collective freedom and flourishing.
              </p>
              <p className="text-2xl md:text-3xl leading-[1.8] mb-2">
                They must be created, maintained, and defended for the benefit of all.
              </p>
              <p className="text-2xl md:text-3xl leading-[1.8]">
                No person or institution shall enclose or exploit them for exclusive gain.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className={`${stoke.className} text-lg md:text-xl font-bold mb-4`}>Article II - Decentralization</h2>
              <p className="text-2xl md:text-3xl leading-[1.8] mb-2">
                Power of the Cartel shall be distributed.
              </p>
              <p className="text-2xl md:text-3xl leading-[1.8] mb-2">
                Decisions shall be transparent, accountable, and participatory.
              </p>
              <p className="text-2xl md:text-3xl leading-[1.8]">
                Systems shall be designed to endure beyond the influence of any single actor.
              </p>
            </div>
            
            <div>
              <p className="text-2xl md:text-3xl leading-[1.8] font-semibold">
                Because the web belongs to the people.
              </p>
            </div>
          </div>
        </CornerCard>
      </div>
    </div>
  );
}