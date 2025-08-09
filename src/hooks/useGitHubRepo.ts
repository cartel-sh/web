"use client";

import { useState, useEffect } from 'react';

export interface GitHubContributor {
  login: string;
  contributions: number;
  avatar_url: string;
  html_url: string;
  type: string;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
}

interface GitHubRepoData {
  repo: GitHubRepo | null;
  contributors: GitHubContributor[];
  filteredContributors: GitHubContributor[];
  isLoading: boolean;
  error: string | null;
}

// List of known bot usernames to filter out
const BOT_USERNAMES = [
  'claude',
  'cursoragent',
  'dependabot',
  'renovate',
  'greenkeeper',
  'codecov-io',
  'stale',
  'semantic-release-bot',
  'github-actions',
  'vercel',
  'netlify'
];

export function useGitHubRepo(githubUrl: string): GitHubRepoData {
  const [data, setData] = useState<GitHubRepoData>({
    repo: null,
    contributors: [],
    filteredContributors: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!githubUrl) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchGitHubData = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));

        // Extract owner and repo from GitHub URL
        const urlParts = githubUrl.replace('https://github.com/', '').split('/');
        if (urlParts.length < 2) {
          throw new Error('Invalid GitHub URL');
        }

        const [owner, repoName] = urlParts;
        const baseUrl = 'https://api.github.com';

        // Fetch repository info
        const repoResponse = await fetch(`${baseUrl}/repos/${owner}/${repoName}`);
        if (!repoResponse.ok) {
          throw new Error(`Failed to fetch repository: ${repoResponse.statusText}`);
        }
        const repo: GitHubRepo = await repoResponse.json();

        // Fetch contributors
        const contributorsResponse = await fetch(`${baseUrl}/repos/${owner}/${repoName}/contributors`);
        if (!contributorsResponse.ok) {
          throw new Error(`Failed to fetch contributors: ${contributorsResponse.statusText}`);
        }
        const contributors: GitHubContributor[] = await contributorsResponse.json();

        // Filter out bots and sort by contributions
        const filteredContributors = contributors
          .filter(contributor => {
            const login = contributor.login.toLowerCase();
            return contributor.type === 'User' && 
              !BOT_USERNAMES.some(bot => login.includes(bot.toLowerCase())) &&
              !login.includes('bot') &&
              !login.includes('agent');
          })
          .sort((a, b) => b.contributions - a.contributions);

        setData({
          repo,
          contributors,
          filteredContributors,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching GitHub data:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch GitHub data',
        }));
      }
    };

    fetchGitHubData();
  }, [githubUrl]);

  return data;
}