"use client";

import { useState, useEffect } from 'react';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { useWalletClient } from 'wagmi';

interface ENSData {
  description: string | null;
  avatar: string;
  isLoading: boolean;
  error: string | null;
}

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export function useENSData(ensName: string): ENSData {
  const [data, setData] = useState<ENSData>({
    description: null,
    avatar: `https://euc.li/${ensName}`,
    isLoading: true,
    error: null,
  });
  useWalletClient

  useEffect(() => {
    if (!ensName) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchENSData = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));

        // Fetch ENS description
        const description = await publicClient.getEnsText({
          name: ensName,
          key: 'description',
        });

        setData({
          description: description || null,
          avatar: `https://euc.li/${ensName}`,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching ENS data:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch ENS data',
        }));
      }
    };

    fetchENSData();
  }, [ensName]);

  return data;
}