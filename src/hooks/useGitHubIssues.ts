"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { getIssuesAtom, setIssuesAtom, clearIssuesAtom, loadingStatesAtom } from '@/atoms/issues';

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
  assignee: {
    login: string;
    avatar_url: string;
  };
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
  refresh: () => void;
}

export function useGitHubIssues(githubUrl: string): GitHubIssuesData {
  const getCachedIssues = useAtomValue(getIssuesAtom);
  const setIssues = useSetAtom(setIssuesAtom);
  const clearIssues = useSetAtom(clearIssuesAtom);
  const [loadingStates, setLoadingStates] = useAtom(loadingStatesAtom);
  const hasFetchedRef = useRef(false);

  const [localData, setLocalData] = useState<Omit<GitHubIssuesData, 'refresh'>>(() => {
    const cached = getCachedIssues(githubUrl);
    if (cached) {
      return {
        issues: cached.issues,
        isLoading: false,
        error: cached.error,
        repoInfo: cached.repoInfo,
      };
    }
    return {
      issues: [],
      isLoading: true,
      error: null,
    };
  });

  const fetchGitHubIssues = useCallback(async (forceRefresh = false) => {
    if (!githubUrl) {
      setLocalData({ issues: [], isLoading: false, error: null });
      return;
    }

    // Check if already loading this URL
    if (!forceRefresh && loadingStates.get(githubUrl)) {
      return;
    }

    // Check cache first (unless forcing refresh)
    if (!forceRefresh && !hasFetchedRef.current) {
      const cached = getCachedIssues(githubUrl);
      if (cached) {
        setLocalData({
          issues: cached.issues,
          isLoading: false,
          error: cached.error,
          repoInfo: cached.repoInfo,
        });
        hasFetchedRef.current = true;
        return;
      }
    }

    try {
      // Mark as loading
      setLoadingStates(prev => {
        const newStates = new Map(prev);
        newStates.set(githubUrl, true);
        return newStates;
      });

      setLocalData(prev => ({ ...prev, isLoading: true, error: null }));

      // Extract owner and repo from GitHub URL
      const urlParts = githubUrl.replace('https://github.com/', '').split('/');
      if (urlParts.length < 2) {
        throw new Error('Invalid GitHub URL');
      }

      const [owner, repoName] = urlParts;

      // Call our API route instead of GitHub directly
      const apiResponse = await fetch(
        `/api/github/issues?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repoName)}`
      );

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({ error: 'Failed to fetch issues' }));
        throw new Error(errorData.error || `Failed to fetch issues: ${apiResponse.statusText}`);
      }

      const data = await apiResponse.json();
      const filteredIssues = data.issues;

      const newData = {
        issues: filteredIssues,
        isLoading: false,
        error: null,
        repoInfo: data.repoInfo || {
          name: repoName,
          owner,
          full_name: `${owner}/${repoName}`,
        },
      };

      // Cache the result
      setIssues({ url: githubUrl, data: newData });
      setLocalData(newData);
      hasFetchedRef.current = true;
    } catch (error) {
      console.error('Error fetching GitHub issues:', error);
      const errorData = {
        issues: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch GitHub issues',
      };
      setLocalData(errorData);
      hasFetchedRef.current = true;
    } finally {
      // Mark as not loading
      setLoadingStates(prev => {
        const newStates = new Map(prev);
        newStates.delete(githubUrl);
        return newStates;
      });
    }
  }, [githubUrl, getCachedIssues, setIssues, setLoadingStates]);

  const refresh = useCallback(() => {
    hasFetchedRef.current = false;
    clearIssues(githubUrl);
    fetchGitHubIssues(true);
  }, [githubUrl, clearIssues, fetchGitHubIssues]);

  useEffect(() => {
    // Only fetch if we haven't fetched yet
    if (!hasFetchedRef.current) {
      fetchGitHubIssues();
    }
  }, [githubUrl]); // Only depend on githubUrl, not fetchGitHubIssues

  return { ...localData, refresh };
}