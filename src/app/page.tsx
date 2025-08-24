"use client";

import { Tangerine, Stoke } from "next/font/google";
import { MemberBadge } from "@/components/ui/member-badge";
import { ProjectCard } from "@/components/ui/project-card";
import { TreasuryDisplay } from "@/components/treasury-display";
import { CornerCard } from "@/components/ui/corner-card";
import membersData from "@/data/members.json";
import projectsData from "@/data/projects.json";
import communitiesData from "@/data/communities.json";
import { useEffect } from "react";

const tangerine = Tangerine({ subsets: ["latin"], weight: "400" });
const stoke = Stoke({ subsets: ["latin"], weight: "400" });

export default function Home() {
  useEffect(() => {
    document.title = "Cartel";
  }, []);

  return (
    <>

      <section id="manifesto" className="mt-16 mb-20 text-center">
        <div className="max-w-3xl mx-auto">
          <CornerCard variant="manifesto" contentClassName="p-10 px-16" cornerClassName="-top-0.5 -right-0.5" className="bg-card/50 rounded-xl">
            <div className={`${tangerine.className} text-left text-foreground/90`}>
              <p className="decoration-foreground/40 decoration-2 text-3xl md:text-4xl leading-[1.8] mb-0">
                We reject the hyper-individualism. Instead, we build infra grounded in togetherness,
                where cryptographic tools foster connection rather than alienation.
              </p>
              <p className="decoration-foreground/40 decoration-2 text-3xl md:text-4xl leading-[1.8] mb-0">
                Technology alone cannot heal broken trust, but technology built with right ethics and care can create the conditions for healing.
              </p>
              <p className="decoration-foreground/40 decoration-2 text-3xl md:text-4xl leading-[1.8] mb-0">
                We reimagine cryptographic tools as instruments of communion, not alienation.
              </p>
              <p className="decoration-foreground/40 decoration-2 text-3xl md:text-4xl leading-[1.8] mb-0">
                The future of social is built with care for all.
              </p>
            </div>
          </CornerCard>
        </div>
      </section>

      <section id="projects" className="mb-20">
        <h2 className={`${stoke.className} text-3xl md:text-4xl lg:text-5xl mb-10 text-left font-bold italic`} style={{ letterSpacing: '-0.1em' }}>Projects</h2>
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

      <section id="members" className="mb-20">
        <h2 className={`${stoke.className} text-3xl md:text-4xl lg:text-5xl mb-10 text-left font-bold italic`} style={{ letterSpacing: '-0.1em' }}>Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
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

      <section id="allies" className="mb-20">
        <h2 className={`${stoke.className} text-3xl md:text-4xl lg:text-5xl mb-10 text-left font-bold italic`} style={{ letterSpacing: '-0.1em' }}>Allies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {communitiesData.map((community) => (
            <CornerCard key={community.id} variant="ally" contentClassName="p-6" className="bg-card/50 rounded-xl rounded-tr-2xl" cornerClassName="-top-0.5 -right-0.5">
              <h3 className="text-xl font-semibold mb-2">{community.name}</h3>
              <p className="text-muted-foreground mb-4">
                {community.description}
              </p>
              <a href={community.link} className="text-primary hover:underline">Learn more →</a>
            </CornerCard>
          ))}
        </div>
      </section>

      <section id="treasury" className="mb-20">
        <h2 className={`${stoke.className} text-3xl md:text-4xl lg:text-5xl mb-10 text-left font-bold italic`} style={{ letterSpacing: '-0.1em' }}>Treasury</h2>
        <CornerCard variant="treasury" contentClassName="p-6" cornerClassName="-top-0.5 -right-0.5" className="bg-card/50 rounded-xl rounded-tr-2xl w-fit">
          <TreasuryDisplay showHeading={false} showTransactions={false} />
        </CornerCard>
      </section>


    </>
  );
}