"use client";

import { Italianno, Stoke } from "next/font/google";
import { MemberBadge } from "@/components/ui/member-badge";
import { ProjectCard } from "@/components/ui/project-card";
import { TreasuryDisplay } from "@/components/treasury-display";
import { CornerCard } from "@/components/ui/corner-card";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { AlliesCard } from "@/components/ui/allies-card";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import membersData from "@/data/members.json";
import projectsData from "@/data/projects.json";
import communitiesData from "@/data/communities.json";
import { useEffect } from "react";
import { FaDiscord, FaTelegram } from "react-icons/fa";
import Link from "next/link";

const italianno = Italianno({ subsets: ["latin"], weight: "400" });
const stoke = Stoke({ subsets: ["latin"], weight: "400" });

export default function Home() {
  useEffect(() => {
    document.title = "Cartel";
  }, []);


  return (
    <div className="flex flex-col gap-16 sm:gap-20 md:gap-28 lg:gap-32 py-12 sm:py-16 md:py-20">
      <section id="about" className="text-center">
        <div className="max-w-3xl mx-auto">
          <CornerCard variant="manifesto" contentClassName="p-6 sm:p-8 md:px-12 lg:px-16" cornerClassName="-top-0.5 -right-0.5" className="bg-card/80 rounded-xl rounded-b-none border-b-none">
            <div className={`${italianno.className} text-left text-foreground/90`} style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              lineHeight: 'clamp(2.25rem, 6vw, 3.6rem)'
            }}>
              <p className="decoration-foreground/40 decoration-2 mb-0">
                We the People of the world, unite with the purpose of building a free and prosperous society, develop, support and promote public goods.
              </p>
            </div>
          </CornerCard>

          <Button variant="outline"
            className="text-lg sm:text-xl cursor-pointer px-5 sm:px-6 py-2.5 sm:py-2 h-auto rounded-xl w-full border-t-none rounded-t-none hover:scale-100 active:scale-100 min-h-[44px]">
            <Link href="/constitution" className="hover:text-primary text-foreground/50 transition-colors flex items-center gap-2">
              Read the constitution
              {/* <ChevronRight className="size-4 -mb-1" strokeWidth={3} /> */}
            </Link>
          </Button>

        </div>
      </section>


      <section id="projects" className="relative">
        <div className="relative z-10">
          <SectionLabel>WHAT WE DO</SectionLabel>
          <h2 className={`${stoke.className} mb-2 text-left font-bold italic`} style={{ 
            fontSize: 'clamp(1.75rem, 5vw, 3rem)',
            letterSpacing: '-0.1em' 
          }}>Projects</h2>
          <p className={`${stoke.className} mb-6 sm:mb-8 text-primary/40`} style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)'
          }}>
            Mass production of public goods, dao tooling, unicorn startups
          </p>
          <InfiniteScroll
            direction="left"
            speed={40}
            pauseOnHover={true}
            className="py-4"
          >
            {projectsData.map((project) => (
              <ProjectCard
                key={project.id}
                name={project.name}
                githubLink={project.githubLink}
                deploymentUrl={project.deploymentUrl}
              />
            ))}
          </InfiniteScroll>
        </div>
      </section>

      <section id="members">
        <SectionLabel>WHO WE ARE</SectionLabel>
        <h2 className={`${stoke.className} mb-2 text-left font-bold italic`} style={{ 
            fontSize: 'clamp(1.75rem, 5vw, 3rem)',
            letterSpacing: '-0.1em' 
          }}>Members</h2>
        <p className={`${stoke.className} mb-6 sm:mb-8 text-primary/40`} style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)'
          }}>
          Builders, designers, thinkers, assasins of proprietary software
        </p>
        <InfiniteScroll
          direction="right"
          speed={35}
          pauseOnHover={true}
          className="py-4"
        >
          {membersData.map((member) => (
            <MemberBadge
              key={member.id}
              name={member.name}
              ensName={member.ensName}
              badge={member.badge}
              link={member.link}
            />
          ))}
        </InfiniteScroll>
      </section>

      <section id="community">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="flex flex-col items-center md:items-start justify-center ">
            <h2 className="text-center md:text-left mb-2 md:mb-4">
              <span className={`${stoke.className} font-bold italic`} style={{ 
                fontSize: 'clamp(1.75rem, 5vw, 3rem)',
                letterSpacing: '-0.1em' 
              }}>Join the Community</span><br />
            </h2>
              <p className={`${stoke.className} text-primary/40`} style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)'
              }}>
                Global means for everyone
              </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Button
              variant="outline"
              className="h-full min-h-[100px] sm:min-h-[120px] md:min-h-[150px] hover:cursor-pointer flex items-center justify-center rounded-xl transition-transform"
              onClick={() => window.open('https://discord.gg/FZzD7DZksj', '_blank')}
              aria-label="Join Discord"
            >
              <FaDiscord className="size-10 sm:size-12 md:size-16" />
            </Button>
            <Button
              variant="outline"
              className="h-full min-h-[100px] sm:min-h-[120px] md:min-h-[150px] hover:cursor-pointer flex items-center justify-center rounded-xl transition-transform"
              onClick={() => window.open('https://t.me/cartel_sh', '_blank')}
              aria-label="Join Telegram"
            >
              <FaTelegram className="size-10 sm:size-12 md:size-14" />
            </Button>
          </div>
        </div>
      </section>

      <section id="allies">
        <SectionLabel>WHO WE WORK WITH</SectionLabel>
        <h2 className={`${stoke.className} mb-6 sm:mb-8 md:mb-10 text-left font-bold italic`} style={{ 
            fontSize: 'clamp(1.75rem, 5vw, 3rem)',
            letterSpacing: '-0.1em' 
          }}>Allies & Partners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {communitiesData.map((community) => (
            <AlliesCard
              key={community.id}
              name={community.name}
              description={community.description}
              link={community.link}
            />
          ))}
        </div>
      </section>

      <section id="treasury" className="relative">
        <div className="relative z-10">
          <SectionLabel>OUR RESOURCES</SectionLabel>
          <h2 className={`${stoke.className} mb-6 sm:mb-8 md:mb-10 text-left font-bold italic`} style={{ 
            fontSize: 'clamp(1.75rem, 5vw, 3rem)',
            letterSpacing: '-0.1em' 
          }}>Treasury</h2>
          <CornerCard variant="treasury" contentClassName="p-6" cornerClassName="-top-0.5 -right-0.5" className="bg-card/80 rounded-xl rounded-tr-2xl w-fit relative">
            <TreasuryDisplay showHeading={false} showTransactions={false} />
          </CornerCard>
        </div>
      </section>

      <section id="apply">
        <h2 className={`${stoke.className} text-center font-bold mb-6 sm:mb-8`} style={{ 
          fontSize: 'clamp(1.75rem, 5vw, 3rem)',
          letterSpacing: '-0.1em' 
        }}>
          Want to help us build <br className="sm:hidden" /> the future of social?
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
          <Button size="lg" className="text-lg sm:text-xl cursor-pointer px-5 sm:px-6 py-3 h-auto rounded-xl min-h-[44px]">
            <Link href="/apply">Apply</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg sm:text-xl cursor-pointer px-5 sm:px-6 py-2.5 sm:py-2 h-auto rounded-xl min-h-[44px]"
          >
            <Link href="/community">Join Community</Link>
          </Button>
        </div>
      </section>

    </div>
  );
}