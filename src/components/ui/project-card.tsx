"use client";

import { useGitHubRepo, type GitHubContributor } from "@/hooks/useGitHubRepo";
import { getTimeAgo } from "@/lib/timeUtils";
import { TiStarOutline } from "react-icons/ti";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CornerCard } from "@/components/ui/corner-card";

interface ProjectCardProps {
  name: string;
  githubLink: string;
  deploymentUrl: string;
  className?: string;
}

export function ProjectCard({ name, githubLink, deploymentUrl, className }: ProjectCardProps) {
  const { repo, filteredContributors, isLoading, error } = useGitHubRepo(githubLink);
  const [hoveredContributor, setHoveredContributor] = useState<string | null>(null);

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger if not clicking on contributor avatars
    if ((e.target as HTMLElement).closest('.contributor-avatar')) {
      return;
    }

    if (deploymentUrl && deploymentUrl !== "#") {
      window.open(deploymentUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(githubLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleContributorClick = (e: React.MouseEvent, contributorUrl: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(contributorUrl, '_blank', 'noopener,noreferrer');
  };

  const handleContributorKeyDown = (e: React.KeyboardEvent, contributorUrl: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      window.open(contributorUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (!(e.target as HTMLElement).closest('.contributor-avatar')) {
        e.preventDefault();
        if (deploymentUrl && deploymentUrl !== "#") {
          window.open(deploymentUrl, '_blank', 'noopener,noreferrer');
        } else {
          window.open(githubLink, '_blank', 'noopener,noreferrer');
        }
      }
    }
  };

  return (
    <CornerCard
      variant="project"
      interactive
      className={cn("cursor-pointer bg-card/50 rounded-xl rounded-tr-2xl h-full", className)}
      contentClassName="p-6 h-full flex flex-col"
      cornerClassName="-top-0.5 -right-1"
      ariaLabel={`Open ${name} project`}
    >
      <div
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        role="button"
        tabIndex={0}
        className="outline-none flex flex-col h-full"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold">{name}</h3>
          {repo && (
            <div className="flex items-center gap-2 text-base text-muted-foreground">
              <span className="font-semibold">{repo.stargazers_count}</span>
              <TiStarOutline className="w-5 h-5" />
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2 mb-4 flex-grow">
            <div className="h-4 bg-muted/50 rounded animate-pulse"></div>
            <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4"></div>
          </div>
        ) : error ? (
          <p className="text-muted-foreground mb-4 text-sm italic flex-grow">
            Failed to load repository data
          </p>
        ) : (
          <p className="text-muted-foreground mb-4 flex-grow">
            {repo?.description || "No description available"}
          </p>
        )}

        <div className="mb-4 mt-auto">
          {isLoading ? (
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 bg-muted/50 rounded-full animate-pulse"></div>
              ))}
            </div>
          ) : filteredContributors.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filteredContributors.slice(0, 5).map((contributor) => (
                <div key={contributor.login} className="relative group">
                  <button
                    onClick={(e) => handleContributorClick(e, contributor.html_url)}
                    onKeyDown={(e) => handleContributorKeyDown(e, contributor.html_url)}
                    onMouseEnter={() => setHoveredContributor(contributor.login)}
                    onMouseLeave={() => setHoveredContributor(null)}
                    onFocus={() => setHoveredContributor(contributor.login)}
                    onBlur={() => setHoveredContributor(null)}
                    className={cn(
                      "contributor-avatar relative block rounded-full transition-all duration-200",
                      "hover:scale-125 hover:z-20",
                      "focus-visible:scale-125 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    )}
                    aria-label={`View ${contributor.login}'s GitHub profile. ${contributor.contributions} contributions.`}
                    tabIndex={0}
                  >
                    <Image
                      src={contributor.avatar_url}
                      alt={contributor.login}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full shadow-sm"
                      unoptimized
                    />
                  </button>
                  {/* Tooltip */}
                  {hoveredContributor === contributor.login && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border border-border whitespace-nowrap z-50">
                      <div className="font-semibold">{contributor.login}</div>
                      <div className="text-muted-foreground">
                        {contributor.contributions} contribution{contributor.contributions !== 1 ? 's' : ''}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover" />
                    </div>
                  )}
                </div>
              ))}
              {filteredContributors.length > 5 && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-xs font-semibold text-muted-foreground">
                  +{filteredContributors.length - 5}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/50 italic">
              No contributors found
            </p>
          )}
        </div>

        {repo?.updated_at && (
          <div className="text-xs text-muted-foreground/70 mt-2">
            Last updated {getTimeAgo(repo.updated_at)}
          </div>
        )}
      </div>
    </CornerCard>
  );
}