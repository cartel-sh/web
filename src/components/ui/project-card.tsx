"use client";

import { useGitHubRepo } from "@/hooks/useGitHubRepo";
import { getTimeAgo } from "@/lib/timeUtils";
import { TiStarOutline } from "react-icons/ti";
import Image from "next/image";

interface ProjectCardProps {
  name: string;
  githubLink: string;
  deploymentUrl: string;
  className?: string;
}

export function ProjectCard({ name, githubLink, deploymentUrl, className }: ProjectCardProps) {
  const { repo, filteredContributors, isLoading, error } = useGitHubRepo(githubLink);

  const handleClick = () => {
    if (deploymentUrl && deploymentUrl !== "#") {
      window.open(deploymentUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(githubLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="border rounded-lg p-6 border-foreground/30 transition-all duration-200 bg-card/50 hover:bg-card/80 cursor-pointer hover:scale-105"
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
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-muted/50 rounded animate-pulse"></div>
          <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4"></div>
        </div>
      ) : error ? (
        <p className="text-muted-foreground mb-4 text-sm italic">
          Failed to load repository data
        </p>
      ) : (
        <p className="text-muted-foreground mb-4">
          {repo?.description || "No description available"}
        </p>
      )}

      <div className="mb-4">
        {isLoading ? (
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 bg-muted/50 rounded-full animate-pulse"></div>
            ))}
          </div>
        ) : filteredContributors.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {filteredContributors.slice(0, 5).map((contributor) => (
              <Image
                key={contributor.login}
                src={contributor.avatar_url}
                alt={contributor.login}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
                unoptimized
              />
            ))}
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
  );
}