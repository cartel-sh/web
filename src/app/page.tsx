"use client";

import { Italianno, Stoke } from "next/font/google";
import { MemberBadge } from "@/components/ui/member-badge";
import { ProjectCard } from "@/components/ui/project-card";
import { TreasuryDisplay } from "@/components/treasury-display";
import { CornerCard } from "@/components/ui/corner-card";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { AlliesCard } from "@/components/ui/allies-card";
import { Button } from "@/components/ui/button";
import membersData from "@/data/members.json";
import projectsData from "@/data/projects.json";
import communitiesData from "@/data/communities.json";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaDiscord, FaTelegram } from "react-icons/fa";

const italianno = Italianno({ subsets: ["latin"], weight: "400" });
const stoke = Stoke({ subsets: ["latin"], weight: "400" });

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    document.title = "Cartel";
  }, []);


  return (
    <>

      <section id="projects" className="mt-16 mb-20">
        <h2 className={`${stoke.className} text-3xl md:text-4xl lg:text-5xl mb-10 text-left font-bold italic`} style={{ letterSpacing: '-0.1em' }}>Projects</h2>
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
      </section>

      <section id="members" className="mb-20">
        <h2 className={`${stoke.className} text-3xl md:text-4xl lg:text-5xl mb-10 text-left font-bold italic`} style={{ letterSpacing: '-0.1em' }}>Members</h2>
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

      <section id="community" className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="flex items-center justify-center md:justify-start">
            <h2 className="text-3xl md:text-4xl lg:text-5xl text-center md:text-left">
              <span className={`${stoke.className} font-bold italic`} style={{ letterSpacing: '-0.1em' }}>Join the Cartel Community</span><br />
              {/* <span className={`${stoke.className} text-md  text-muted-foreground/80`}>Your voice matters.</span> */}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-full min-h-[120px] hover:cursor-pointer md:min-h-[150px] flex items-center justify-center rounded-xl  transition-transform"
              onClick={() => window.open('https://discord.gg/FZzD7DZksj', '_blank')}
              aria-label="Join Discord"
            >
              <FaDiscord className="size-12 md:size-20" />
            </Button>
            <Button
              variant="outline"
              className="h-full min-h-[120px] hover:cursor-pointer md:min-h-[150px] flex items-center justify-center rounded-xl  transition-transform"
              onClick={() => window.open('https://t.me/cartel_sh', '_blank')}
              aria-label="Join Telegram"
            >
              <FaTelegram className="size-12 md:size-20" />
            </Button>
          </div>
        </div>
      </section>

      <section id="manifesto" className="mb-20 text-center">
        <div className="max-w-3xl mx-auto">
          <CornerCard variant="manifesto" contentClassName="p-10 px-16" cornerClassName="-top-0.5 -right-0.5" className="bg-card/50 rounded-xl">
            <div className={`${italianno.className} text-left text-foreground/90`}>
              <p className="decoration-foreground/40 decoration-2 text-3xl md:text-4xl leading-[1.8] mb-0">

                Because The web belongs to the people.
              </p>
            </div>
          </CornerCard>
        </div>
      </section>

      <section id="allies" className="mb-20">
        <h2 className={`${stoke.className} text-3xl md:text-4xl lg:text-5xl mb-10 text-left font-bold italic`} style={{ letterSpacing: '-0.1em' }}>Allies</h2>
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

      <section id="treasury" className="mb-20">
        <h2 className={`${stoke.className} text-3xl md:text-4xl lg:text-5xl mb-10 text-left font-bold italic`} style={{ letterSpacing: '-0.1em' }}>Treasury</h2>
        <CornerCard variant="treasury" contentClassName="p-6" cornerClassName="-top-0.5 -right-0.5" className="bg-card/50 rounded-xl rounded-tr-2xl w-fit">
          <TreasuryDisplay showHeading={false} showTransactions={false} />
        </CornerCard>
      </section>

      <section id="apply" className="my-20">
        <h2 className={`${stoke.className} text-3xl md:text-4xl lg:text-5xl text-center font-bold mb-8`} style={{ letterSpacing: '-0.1em' }}>
          Want to help us build <br /> the future of social?
        </h2>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="text-xl cursor-pointer px-6 py-3 h-auto rounded-xl" onClick={() => router.push('/apply')}>
            Apply
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-xl cursor-pointer px-6 py-2 h-auto rounded-xl"
            onClick={() => router.push('/community')}
          >
            Join Community
          </Button>
        </div>
      </section>

    </>
  );
}