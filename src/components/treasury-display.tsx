'use client'

import { useTreasuryData } from '@/hooks/useTreasuryData'
import { useState, useEffect } from 'react'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export function TreasuryDisplay() {
  const { balances, latestTransactions, loading, error } = useTreasuryData()
  const [ensNames, setEnsNames] = useState<Record<string, string | null>>({})

  const mainnetClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  })

  useEffect(() => {
    const resolveEnsNames = async () => {
      const newEnsNames: Record<string, string | null> = {}
      
      for (const tx of latestTransactions) {
        if (!ensNames[tx.from]) {
          try {
            const ensName = await mainnetClient.getEnsName({
              address: tx.from as `0x${string}`,
            })
            newEnsNames[tx.from] = ensName
          } catch (error) {
            console.error(`Failed to resolve ENS for ${tx.from}:`, error)
            newEnsNames[tx.from] = null
          }
        }
      }
      
      if (Object.keys(newEnsNames).length > 0) {
        setEnsNames(prev => ({ ...prev, ...newEnsNames }))
      }
    }

    if (latestTransactions.length > 0) {
      resolveEnsNames()
    }
  }, [latestTransactions])

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Failed to load treasury data: {error}</p>
        </div>
      </div>
    )
  }

  const totalEth = balances.reduce((sum, balance) => sum + parseFloat(balance.eth), 0)

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Treasury</h2>
        <a
          href="https://etherscan.io/address/0x0c49bc3daaddf30b78718d5ae623ffbc076b6f8b#asset-multichain"
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:opacity-80 transition-opacity"
        >
          <div className="text-5xl sm:text-6xl md:text-8xl font-bold text-primary flex items-center justify-center gap-2 sm:gap-3">
            {totalEth.toFixed(4)} <span className="text-5xl sm:text-6xl md:text-8xl">Ξ</span>
          </div>
        </a>
      </div>

      {latestTransactions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4 text-center">Latest Transactions</h3>
          <div className="space-y-2">
            {latestTransactions.map((tx) => (
              <div key={tx.hash} className="bg-card/60 border rounded-2xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="font-bold text-primary text-sm sm:text-base">
                      +{parseFloat(tx.value).toFixed(4)} {tx.tokenSymbol}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      from {ensNames[tx.from] || `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(parseInt(tx.timeStamp) * 1000).toLocaleDateString()}
                    </span>
                    <a
                      href={`${tx.chainId === 1 
                        ? 'https://etherscan.io' 
                        : 'https://basescan.org'}/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs sm:text-sm"
                    >
                      →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}