import { useState, useEffect } from 'react'

export interface TreasuryBalance {
  chainId: number
  chainName: string
  eth: string
}

export interface IncomingTransaction {
  hash: string
  from: string
  to: string
  value: string
  tokenSymbol: string
  tokenDecimals: number
  timeStamp: string
  chainId: number
  chainName: string
}

export interface TreasuryData {
  balances: TreasuryBalance[]
  latestTransactions: IncomingTransaction[]
  loading: boolean
  error: string | null
}

export function useTreasuryData(): TreasuryData {
  const [data, setData] = useState<TreasuryData>({
    balances: [],
    latestTransactions: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    fetchTreasuryData()
  }, [])

  const fetchTreasuryData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/treasury')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch treasury data: ${response.statusText}`)
      }

      const { balances, latestTransactions } = await response.json()

      setData({
        balances,
        latestTransactions,
        loading: false,
        error: null,
      })

    } catch (error) {
      console.error('Failed to fetch treasury data:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch treasury data',
      }))
    }
  }


  return data
}