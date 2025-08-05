import { useState, useEffect } from 'react'
import { createPublicClient, http, formatEther } from 'viem'
import { mainnet, base } from 'viem/chains'
import { TREASURY_ADDRESS } from '@/lib/wagmi-config'

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

      // Create public clients for Mainnet and Base
      const mainnetClient = createPublicClient({
        chain: mainnet,
        transport: http(),
      })

      const baseClient = createPublicClient({
        chain: base,
        transport: http(),
      })

      // Fetch ETH balances from both chains
      const [mainnetBalance, baseBalance] = await Promise.all([
        mainnetClient.getBalance({ address: TREASURY_ADDRESS }),
        baseClient.getBalance({ address: TREASURY_ADDRESS }),
      ])

      // Format balances
      const balances: TreasuryBalance[] = [
        {
          chainId: mainnet.id,
          chainName: mainnet.name,
          eth: formatEther(mainnetBalance),
        },
        {
          chainId: base.id,
          chainName: base.name,
          eth: formatEther(baseBalance),
        },
      ]

      // Fetch recent transactions from Etherscan
      const latestTransactions = await fetchTransactionsFromEtherscan()

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

  const fetchTransactionsFromEtherscan = async (): Promise<IncomingTransaction[]> => {
    try {
      const transactions: IncomingTransaction[] = []

      // Fetch from Ethereum Mainnet
      const ethApiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
      if (ethApiKey) {
        const ethUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${TREASURY_ADDRESS}&startblock=0&endblock=99999999&page=1&offset=5&sort=desc&apikey=${ethApiKey}`
        
        try {
          const ethResponse = await fetch(ethUrl)
          const ethData = await ethResponse.json()
          
          if (ethData.status === '1' && ethData.result) {
            const ethTxs = ethData.result
              .filter((tx: any) => 
                tx.to.toLowerCase() === TREASURY_ADDRESS.toLowerCase() && 
                parseFloat(tx.value) > 0 &&
                tx.isError === '0'
              )
              .map((tx: any) => ({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: (parseFloat(tx.value) / 1e18).toString(),
                tokenSymbol: 'ETH',
                tokenDecimals: 18,
                timeStamp: tx.timeStamp,
                chainId: 1,
                chainName: 'Ethereum',
              }))
            
            transactions.push(...ethTxs)
          }
        } catch (error) {
          console.error('Failed to fetch Ethereum transactions:', error)
        }
      }

      // Fetch from Base
      const baseApiKey = process.env.NEXT_PUBLIC_BASESCAN_API_KEY
      if (baseApiKey) {
        const baseUrl = `https://api.basescan.org/api?module=account&action=txlist&address=${TREASURY_ADDRESS}&startblock=0&endblock=99999999&page=1&offset=5&sort=desc&apikey=${baseApiKey}`
        
        try {
          const baseResponse = await fetch(baseUrl)
          const baseData = await baseResponse.json()
          
          if (baseData.status === '1' && baseData.result) {
            const baseTxs = baseData.result
              .filter((tx: any) => 
                tx.to.toLowerCase() === TREASURY_ADDRESS.toLowerCase() && 
                parseFloat(tx.value) > 0 &&
                tx.isError === '0'
              )
              .map((tx: any) => ({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: (parseFloat(tx.value) / 1e18).toString(),
                tokenSymbol: 'ETH',
                tokenDecimals: 18,
                timeStamp: tx.timeStamp,
                chainId: 8453,
                chainName: 'Base',
              }))
            
            transactions.push(...baseTxs)
          }
        } catch (error) {
          console.error('Failed to fetch Base transactions:', error)
        }
      }

      // Sort by timestamp descending and take latest 5
      return transactions
        .sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp))
        .slice(0, 5)

    } catch (error) {
      console.error('Failed to fetch transactions from Etherscan:', error)
      return []
    }
  }

  return data
}