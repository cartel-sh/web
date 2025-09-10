import { Inter, Stoke } from "next/font/google";
import { MemberBadge } from "@/components/ui/member-badge";
import { ProjectCard } from "@/components/ui/project-card";
import { TreasuryDisplay } from "@/components/treasury-display";
import { CornerCard } from "@/components/ui/corner-card";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { AlliesCard } from "@/components/ui/allies-card";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import membersData from "@/data/members.json";
import communitiesData from "@/data/communities.json";
import type { ProjectWithUser } from "@cartel-sh/api";
import { CommunityButtons } from "@/components/ui/community-buttons";
import Link from "next/link";
import { cartel } from "@/lib/cartel-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cartel",
};

const inter = Inter({ subsets: ["latin"], weight: "500",  });
const stoke = Stoke({ subsets: ["latin"], weight: "400" });

async function getPublicProjects(): Promise<ProjectWithUser[]> {
  try {
    const projects = await cartel.projects.list({
      public: "true",
      limit: 10,
    });
    return projects;
  } catch (error) {
    console.error('Failed to fetch public projects:', error);
    return [];
  }
}

export default async function Home() {
  const projects = await getPublicProjects();


  return (
    <div className="flex flex-col gap-16 sm:gap-20 md:gap-28 lg:gap-32 py-12 sm:py-16 md:py-20">

      <section id="projects" className="relative">
        <div className="relative z-10">
          <SectionLabel>WHAT WE DO</SectionLabel>
          <h2 className={`${stoke.className} text-left font-bold italic`} style={{ 
            fontSize: 'clamp(1.75rem, 5vw, 3rem)',
            letterSpacing: '-0.1em' 
          }}>Projects</h2>
          <p className={`${inter.className}  mb-4 sm:mb-6 text-primary/40`} style={{
            letterSpacing: '-0.015em',
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)'
          }}>
            Mass production of public goods, dao tooling and unicorns
          </p>
          <InfiniteScroll
            direction="left"
            speed={40}
            pauseOnHover={true}
            className="py-4"
          >
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                name={project.title}
                githubLink={project.githubUrl || '#'}
                deploymentUrl={project.deploymentUrl || '#'}
              />
            ))}
          </InfiniteScroll>
        </div>
      </section>

      <section id="members">
        <SectionLabel>WHO WE ARE</SectionLabel>
        <h2 className={`${stoke.className} text-left font-bold italic`} style={{ 
            fontSize: 'clamp(1.75rem, 5vw, 3rem)',
            letterSpacing: '-0.1em' 
          }}>Members</h2>
        <p className={`${inter.className} mb-4 sm:mb-6 text-primary/40`} style={{
            letterSpacing: '-0.015em',
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
            <h2 className="text-center md:text-left">
              <span className={`${stoke.className} font-bold italic`} style={{ 
                fontSize: 'clamp(1.75rem, 5vw, 3rem)',
                letterSpacing: '-0.1em' 
              }}>Join the Community</span><br />
            </h2>
              <p className={`${inter.className} text-primary/40`} style={{
                letterSpacing: '-0.015em',
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)'
              }}>
                Global means for everyone
              </p>
          </div>
          <CommunityButtons />
        </div>
      </section>

      <section id="allies">
        <SectionLabel>WHO WE WORK WITH</SectionLabel>
        <h2 className={`${stoke.className} mb-4 sm:mb-6 text-left font-bold italic`} style={{ 
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
          <h2 className={`${stoke.className} mb-4 sm:mb-6 text-left font-bold italic`} style={{ 
            fontSize: 'clamp(1.75rem, 5vw, 3rem)',
            letterSpacing: '-0.1em' 
          }}>Treasury</h2>
          <CornerCard variant="treasury" contentClassName="p-6" cornerClassName="-top-0.5 -right-0.5" className="bg-card/80 rounded-xl rounded-tr-2xl w-fit relative">
            <TreasuryDisplay showHeading={false} showTransactions={false} />
          </CornerCard>
        </div>
      </section>

      <section id="apply">
        <h2 className={`${stoke.className} text-center font-bold mb-4 sm:mb-6`} style={{ 
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