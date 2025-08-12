"use client";

import { Tangerine, Stoke } from "next/font/google";
import { MemberBadge } from "@/components/ui/member-badge";
import { ProjectCard } from "@/components/ui/project-card";
import { TreasuryDisplay } from "@/components/treasury-display";
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
          <div className="p-4 px-16 bg-card/30">
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
          </div>
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

      <section id="aligned-communities" className="mb-20">
        <h2 className={`${stoke.className} text-3xl md:text-4xl lg:text-5xl mb-10 text-left font-bold italic`} style={{ letterSpacing: '-0.1em' }}>Allies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
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


    </>
  );
}