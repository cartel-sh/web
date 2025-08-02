import { useState, useEffect } from 'react'
import { formatUnits } from 'viem'

export interface TreasuryBalance {
  chainId: number
  chainName: string
  eth: string
  usdc: string
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
  totalEthUsd: string
  totalUsdcUsd: string
  latestTransactions: IncomingTransaction[]
  loading: boolean
  error: string | null
}

// Removed caching - always fetch fresh data client-side
const ETHERSCAN_API_KEY = '5J1DXFVVFRPQBBZRVDPHAXBY8KQYUX6324'
const TREASURY_ADDRESS = '0x0c49bC3DAadDf30b78718d5ae623ffBC076b6f8b'

// USDC contract addresses
const USDC_CONTRACTS = {
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum mainnet
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base
}


interface EtherscanBalanceResponse {
  status: string
  message: string
  result: string
}

interface EtherscanPriceResponse {
  status: string
  message: string
  result: {
    ethusd: string
  }
}

interface EtherscanTransaction {
  hash: string
  from: string
  to: string
  value: string
  timeStamp: string
  tokenSymbol?: string
  tokenDecimal?: string
}

interface EtherscanTxResponse {
  status: string
  message: string
  result: EtherscanTransaction[]
}

export function useTreasuryData(): TreasuryData {
  const [data, setData] = useState<TreasuryData>({
    balances: [],
    totalEthUsd: '0',
    totalUsdcUsd: '0',
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

      // Fetch ETH price, balances, and latest transactions in parallel
      const [ethPrice, mainnetData, baseData, latestTransactions] = await Promise.all([
        fetchEthPrice(),
        fetchChainData(1, 'Ethereum'),
        fetchChainData(8453, 'Base'),
        fetchLatestIncomingTransactions(),
      ])

      const balances = [mainnetData, baseData]
      
      // Calculate totals using real ETH price and $1 for USDC
      const totalEth = balances.reduce((sum, balance) => sum + parseFloat(balance.eth), 0)
      const totalUsdc = balances.reduce((sum, balance) => sum + parseFloat(balance.usdc), 0)

      const treasuryData = {
        balances,
        totalEthUsd: (totalEth * ethPrice).toFixed(2),
        totalUsdcUsd: totalUsdc.toFixed(2), // USDC is always $1
        latestTransactions,
      }

      setData({
        ...treasuryData,
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

  const fetchEthPrice = async (): Promise<number> => {
    const response = await fetch(
      `https://api.etherscan.io/v2/api?chainid=1&module=stats&action=ethprice&apikey=${ETHERSCAN_API_KEY}`
    )

    if (!response.ok) {
      throw new Error(`Etherscan API error: ${response.status}`)
    }

    const data: EtherscanPriceResponse = await response.json()
    console.log('Etherscan ETH Price API Response:', data)
    
    if (data.status !== '1') {
      throw new Error(`Etherscan API error: ${data.message}`)
    }

    return parseFloat(data.result.ethusd)
  }

  const fetchChainData = async (chainId: number, chainName: string): Promise<TreasuryBalance> => {
    // Fetch ETH balance using Etherscan API
    const ethBalanceResponse = await fetch(
      `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=balance&address=${TREASURY_ADDRESS}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
    )

    if (!ethBalanceResponse.ok) {
      throw new Error(`Etherscan API error: ${ethBalanceResponse.status}`)
    }

    const ethBalanceData: EtherscanBalanceResponse = await ethBalanceResponse.json()
    console.log(`Etherscan ETH Balance API Response (${chainName}):`, ethBalanceData)
    
    if (ethBalanceData.status !== '1') {
      throw new Error(`Etherscan API error: ${ethBalanceData.message}`)
    }

    // Fetch USDC balance using Etherscan API
    const usdcBalanceResponse = await fetch(
      `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=tokenbalance&contractaddress=${USDC_CONTRACTS[chainId as keyof typeof USDC_CONTRACTS]}&address=${TREASURY_ADDRESS}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
    )

    if (!usdcBalanceResponse.ok) {
      throw new Error(`Etherscan API error for USDC: ${usdcBalanceResponse.status}`)
    }

    const usdcBalanceData: EtherscanBalanceResponse = await usdcBalanceResponse.json()
    console.log(`Etherscan USDC Balance API Response (${chainName}):`, usdcBalanceData)
    
    // Handle case where USDC balance might not exist or return error - default to 0
    let usdcBalance = '0'
    if (usdcBalanceData.status === '1' && usdcBalanceData.result) {
      usdcBalance = usdcBalanceData.result
    } else {
      console.warn(`USDC balance API returned status: ${usdcBalanceData.status}, message: ${usdcBalanceData.message}`)
    }

    return {
      chainId,
      chainName,
      eth: formatUnits(BigInt(ethBalanceData.result), 18), // ETH has 18 decimals
      usdc: formatUnits(BigInt(usdcBalance), 6), // USDC has 6 decimals
    }
  }

  const fetchLatestIncomingTransactions = async (): Promise<IncomingTransaction[]> => {
    const chains = [
      { chainId: 1, chainName: 'Ethereum', baseUrl: 'https://api.etherscan.io' },
      { chainId: 8453, chainName: 'Base', baseUrl: 'https://api.etherscan.io/v2' }
    ]

    const allTransactions: IncomingTransaction[] = []

    for (const chain of chains) {
      try {
        // Fetch ETH transactions
        const ethTxUrl = `${chain.baseUrl}/api?${chain.chainId === 8453 ? `chainid=${chain.chainId}&` : ''}module=account&action=txlist&address=${TREASURY_ADDRESS}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}&page=1&offset=10`
        
        const ethResponse = await fetch(ethTxUrl)
        const ethData: EtherscanTxResponse = await ethResponse.json()
        console.log(`ETH Transactions (${chain.chainName}):`, ethData)

        if (ethData.status === '1' && ethData.result.length > 0) {
          // Find incoming ETH transactions (to = treasury address, value > 0)
          const incomingEthTx = ethData.result.find(tx => 
            tx.to.toLowerCase() === TREASURY_ADDRESS.toLowerCase() && 
            BigInt(tx.value) > 0
          )

          if (incomingEthTx) {
            allTransactions.push({
              hash: incomingEthTx.hash,
              from: incomingEthTx.from,
              to: incomingEthTx.to,
              value: formatUnits(BigInt(incomingEthTx.value), 18),
              tokenSymbol: 'ETH',
              tokenDecimals: 18,
              timeStamp: incomingEthTx.timeStamp,
              chainId: chain.chainId,
              chainName: chain.chainName,
            })
          }
        }

        // Fetch USDC transactions
        const usdcContractAddress = USDC_CONTRACTS[chain.chainId as keyof typeof USDC_CONTRACTS]
        const usdcTxUrl = `${chain.baseUrl}/api?${chain.chainId === 8453 ? `chainid=${chain.chainId}&` : ''}module=account&action=tokentx&address=${TREASURY_ADDRESS}&contractaddress=${usdcContractAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}&page=1&offset=10`
        
        const usdcResponse = await fetch(usdcTxUrl)
        const usdcData: EtherscanTxResponse = await usdcResponse.json()
        console.log(`USDC Transactions (${chain.chainName}):`, usdcData)

        if (usdcData.status === '1' && usdcData.result.length > 0) {
          // Find incoming USDC transactions (to = treasury address, value > 0)
          const incomingUsdcTx = usdcData.result.find(tx => 
            tx.to.toLowerCase() === TREASURY_ADDRESS.toLowerCase() && 
            BigInt(tx.value) > 0
          )

          if (incomingUsdcTx) {
            allTransactions.push({
              hash: incomingUsdcTx.hash,
              from: incomingUsdcTx.from,
              to: incomingUsdcTx.to,
              value: formatUnits(BigInt(incomingUsdcTx.value), 6),
              tokenSymbol: incomingUsdcTx.tokenSymbol || 'USDC',
              tokenDecimals: parseInt(incomingUsdcTx.tokenDecimal || '6'),
              timeStamp: incomingUsdcTx.timeStamp,
              chainId: chain.chainId,
              chainName: chain.chainName,
            })
          }
        }
      } catch (error) {
        console.error(`Error fetching transactions for ${chain.chainName}:`, error)
      }
    }

    // Sort all transactions by timestamp (most recent first) and return top 3
    const sortedTransactions = allTransactions.sort((a, b) => 
      parseInt(b.timeStamp) - parseInt(a.timeStamp)
    ).slice(0, 3)

    console.log('Latest incoming transactions:', sortedTransactions)
    return sortedTransactions
  }


  return data
}