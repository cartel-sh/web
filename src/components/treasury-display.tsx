'use client'

import { useTreasuryData } from '@/hooks/useTreasuryData'

export function TreasuryDisplay() {
  const { balances, totalEthUsd, totalUsdcUsd, latestTransactions, loading, error } = useTreasuryData()

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
  const totalUsdc = balances.reduce((sum, balance) => sum + parseFloat(balance.usdc), 0)

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-6">Treasury</h2>
        <a
          href="https://etherscan.io/address/0x0c49bc3daaddf30b78718d5ae623ffbc076b6f8b#asset-multichain"
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:opacity-80 transition-opacity"
        >
          <div className="text-8xl font-bold text-primary flex items-center justify-center gap-3">
            {totalEth.toFixed(4)} <span className="text-6xl">Ξ</span>
          </div>
          {totalUsdc > 0 && (
            <div className="text-3xl font-semibold text-muted-foreground mt-2">
              {totalUsdc.toLocaleString()} USDC
            </div>
          )}
        </a>
      </div>

      {latestTransactions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4 text-center">Latest Transactions</h3>
          <div className="space-y-2">
            {latestTransactions.map((tx) => (
              <div key={tx.hash} className="bg-card/60 border rounded-2xl p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">
                      {parseFloat(tx.value).toFixed(4)} {tx.tokenSymbol}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      from {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      on {tx.chainName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {new Date(parseInt(tx.timeStamp) * 1000).toLocaleDateString()}
                    </span>
                    <a
                      href={`${tx.chainId === 1 
                        ? 'https://etherscan.io' 
                        : 'https://basescan.org'}/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
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