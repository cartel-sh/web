"use client";

import { useState, useEffect } from 'react';

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  labels: {
    id: number;
    name: string;
    color: string;
  }[];
  assignees: {
    login: string;
    avatar_url: string;
  }[];
}

interface GitHubIssuesData {
  issues: GitHubIssue[];
  isLoading: boolean;
  error: string | null;
  repoInfo?: {
    name: string;
    owner: string;
    full_name: string;
  };
}

export function useGitHubIssues(githubUrl: string): GitHubIssuesData {
  const [data, setData] = useState<GitHubIssuesData>({
    issues: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!githubUrl) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchGitHubIssues = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));

        // Extract owner and repo from GitHub URL
        const urlParts = githubUrl.replace('https://github.com/', '').split('/');
        if (urlParts.length < 2) {
          throw new Error('Invalid GitHub URL');
        }

        const [owner, repoName] = urlParts;
        const baseUrl = 'https://api.github.com';

        // Fetch open issues only
        const issuesResponse = await fetch(
          `${baseUrl}/repos/${owner}/${repoName}/issues?state=open&per_page=50&sort=updated&direction=desc`
        );
        
        if (!issuesResponse.ok) {
          if (issuesResponse.status === 404) {
            throw new Error('Repository not found or issues are disabled');
          }
          throw new Error(`Failed to fetch issues: ${issuesResponse.statusText}`);
        }
        
        const issues: GitHubIssue[] = await issuesResponse.json();

        // Filter out pull requests (GitHub API includes PRs in issues endpoint)
        const filteredIssues = issues.filter(issue => !issue.html_url.includes('/pull/'));

        setData({
          issues: filteredIssues,
          isLoading: false,
          error: null,
          repoInfo: {
            name: repoName,
            owner,
            full_name: `${owner}/${repoName}`,
          },
        });
      } catch (error) {
        console.error('Error fetching GitHub issues:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch GitHub issues',
        }));
      }
    };

    fetchGitHubIssues();
  }, [githubUrl]);

  return data;
}