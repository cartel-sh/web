"use client";

import Image from "next/image";
import { Stoke, Italianno } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { BackgroundFlower } from "@/components/ui/background-flower";
import { MemberBadge } from "@/components/ui/member-badge";
import { ProjectCard } from "@/components/ui/project-card";
import { TreasuryDisplay } from "@/components/treasury-display";
import membersData from "@/data/members.json";
import projectsData from "@/data/projects.json";
import communitiesData from "@/data/communities.json";
import { useEffect } from "react";

const stoke = Stoke({ subsets: ["latin"], weight: ["400"] });
const italianno = Italianno({ subsets: ["latin"], weight: "400" });

export default function Home() {
  useEffect(() => {
    document.title = "Cartel";
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Paper texture layer: above base color, below flowers */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-35"
        style={{
          backgroundImage: 'url(/images/paper_texture.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '1024px 1024px',
        }}
      />

      {/* Background flowers sorted by vertical position (top to bottom) */}

      {/* Top section (top-10 to top-20) */}
      <BackgroundFlower flowerNumber={1} rotation={15} className="top-20 left-10" size={180} />
      <BackgroundFlower flowerNumber={11} rotation={20} className="top-10 left-1/2" size={150} />
      <BackgroundFlower flowerNumber={6} rotation={75} className="top-[12%] left-[16%]" size={140} />
      <BackgroundFlower flowerNumber={4} rotation={25} className="top-[15%] left-[80%]" size={190} />
      <BackgroundFlower flowerNumber={2} rotation={-30} className="top-20 right-20" size={160} />

      {/* Upper-middle section (top-1/4 to top-1/3) */}
      <BackgroundFlower flowerNumber={1} rotation={-40} className="top-1/4 right-10" size={160} />
      <BackgroundFlower flowerNumber={7} rotation={-35} className="top-[25%] left-[40%]" size={195} />
      <BackgroundFlower flowerNumber={7} rotation={30} className="top-1/3 left-1/4" size={110} />
      <BackgroundFlower flowerNumber={3} rotation={-10} className="top-1/3 right-1/3" size={165} />
      <BackgroundFlower flowerNumber={12} rotation={65} className="top-[35%] right-[15%]" size={198} />

      {/* Middle section (top-40 to top-1/2) */}
      <BackgroundFlower flowerNumber={9} rotation={-70} className="top-[45%] right-[60%]" size={115} />
      <BackgroundFlower flowerNumber={5} rotation={60} className="top-1/2 left-10" size={120} />
      <BackgroundFlower flowerNumber={6} rotation={-45} className="top-1/2 right-10" size={130} />

      {/* Lower-middle section (top-[60%] to top-2/3) */}
      <BackgroundFlower flowerNumber={5} rotation={-55} className="top-[60%] left-[20%]" size={100} />
      <BackgroundFlower flowerNumber={8} rotation={-60} className="top-2/3 right-1/4" size={125} />
      <BackgroundFlower flowerNumber={11} rotation={-25} className="top-[70%] left-[65%]" size={92} />

      {/* Bottom section (top-[80%] to bottom) */}
      <BackgroundFlower flowerNumber={6} rotation={80} className="top-[80%] right-[40%]" size={185} />
      <BackgroundFlower flowerNumber={3} rotation={45} className="bottom-10 left-20" size={170} />
      <BackgroundFlower flowerNumber={12} rotation={-20} className="bottom-10 left-1/2" size={180} />
      <BackgroundFlower flowerNumber={10} rotation={10} className="bottom-[15%] left-[35%]" size={188} />
      <BackgroundFlower flowerNumber={4} rotation={-15} className="bottom-20 right-10" size={190} />
      <BackgroundFlower flowerNumber={2} rotation={50} className="bottom-1/4 left-10" size={175} />
      <BackgroundFlower flowerNumber={8} rotation={40} className="bottom-[30%] right-[25%]" size={115} />
      <BackgroundFlower flowerNumber={10} rotation={-75} className="bottom-40 right-1/3" size={145} />

      <Navigation />

      <div className="max-w-6xl mx-auto px-6 pt-16 relative z-10">
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
            <p className={`${italianno.className} text-3xl md:text-4xl lg:text-5xl text-foreground/90`}>
              The people of the world, accelerating Ethereum social.
            </p>
          </div>
        </header>

        <section id="manifesto" className="mt-16 mb-20 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="p-4 px-16 bg-card/30">
              <div className={`${italianno.className} text-left text-foreground/90`}>
                <p className="underline decoration-foreground/40 decoration-2 underline-offset-4 text-3xl md:text-4xl leading-[1.8] mb-0">
                  We reject the hyper-individualism. Instead, we build infra grounded in togetherness,
                  where cryptographic tools foster connection rather than alienation.
                </p>
                <p className="underline decoration-foreground/40 decoration-2 underline-offset-4 text-3xl md:text-4xl leading-[1.8] mb-0">
                  Technology alone cannot heal broken trust, but technology built with right ethics and care can create the conditions for healing.
                </p>
                <p className="underline decoration-foreground/40 decoration-2 underline-offset-4 text-3xl md:text-4xl leading-[1.8] mb-0">
                  We reimagine cryptographic tools as instruments of communion, not alienation.
                </p>
                <p className="underline decoration-foreground/40 decoration-2 underline-offset-4 text-3xl md:text-4xl leading-[1.8] mb-0">
                  The future of social is built with care for all.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="mb-20 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-10">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {projectsData.map((project) => (
              <ProjectCard
                key={project.id}
                name={project.name}
                githubLink={project.githubLink}
                deploymentUrl={project.deploymentUrl}
              />
            ))}
          </div>
        </section>

        <section id="members" className="mb-20 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-10">Public Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {membersData.map((member) => (
              <MemberBadge
                key={member.id}
                name={member.name}
                ensName={member.ensName}
                badge={member.badge}
                link={member.link}
              />
            ))}
          </div>
        </section>

        <section id="aligned-communities" className="mb-20 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-10">Aligned Communities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left mx-auto max-w-4xl">
            {communitiesData.map((community) => (
              <div key={community.id} className="border rounded-lg p-6 border-foreground/30 transition-colors bg-card/50">
                <h3 className="text-xl font-semibold mb-2">{community.name}</h3>
                <p className="text-muted-foreground mb-4">
                  {community.description}
                </p>
                <a href={community.link} className="text-primary hover:underline">Learn more →</a>
              </div>
            ))}
          </div>
        </section>

        <section id="treasury" className="mb-20">
          <TreasuryDisplay />
        </section>


        <footer className="py-6 border-t text-center">
          <p className="text-sm text-foreground/60">
            <span className="font-bold">© Cartel {new Date().getFullYear()}</span>
            <span className="italic ml-2">
              Think of yourself as dead. You have lived your life. Now, take what's left and live it properly.
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
}