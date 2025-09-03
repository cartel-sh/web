import { atom } from 'jotai';
import type { GitHubIssue } from '@/hooks/useGitHubIssues';

export interface GitHubIssuesData {
  issues: GitHubIssue[];
  isLoading: boolean;
  error: string | null;
  repoInfo?: {
    name: string;
    owner: string;
    full_name: string;
  };
  lastFetched?: number;
}

// Cache atom to store fetched issues by URL
export const issuesCacheAtom = atom<Map<string, GitHubIssuesData>>(new Map());

// Loading states for individual repos
export const loadingStatesAtom = atom<Map<string, boolean>>(new Map());

// Helper atom to get issues for a specific repo
export const getIssuesAtom = atom(
  (get) => (githubUrl: string) => {
    const cache = get(issuesCacheAtom);
    return cache.get(githubUrl);
  }
);

// Helper atom to set issues for a specific repo
export const setIssuesAtom = atom(
  null,
  (get, set, { url, data }: { url: string; data: GitHubIssuesData }) => {
    const cache = new Map(get(issuesCacheAtom));
    cache.set(url, { ...data, lastFetched: Date.now() });
    set(issuesCacheAtom, cache);
  }
);

// Helper atom to clear cache for a specific repo (for refresh)
export const clearIssuesAtom = atom(
  null,
  (get, set, url: string) => {
    const cache = new Map(get(issuesCacheAtom));
    cache.delete(url);
    set(issuesCacheAtom, cache);
  }
);