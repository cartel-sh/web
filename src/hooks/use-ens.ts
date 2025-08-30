"use client";

import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';

export function useEnsName(address: string | undefined) {
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!address || !publicClient) {
      setEnsName(null);
      return;
    }

    setIsLoading(true);

    // Get ENS name for address
    publicClient
      .getEnsName({
        address: address as `0x${string}`,
      })
      .then((name) => {
        setEnsName(name);
      })
      .catch((error) => {
        console.error('Error resolving ENS name:', error);
        setEnsName(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [address, publicClient]);

  return { ensName, isLoading };
}