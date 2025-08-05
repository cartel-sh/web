import { NextResponse } from 'next/server'
import { createPublicClient, http, formatEther } from 'viem'
import { mainnet, base } from 'viem/chains'

const TREASURY_ADDRESS = '0x0c49bC3DAadDf30b78718d5ae623ffBC076b6f8b' as const

export async function GET() {
  try {
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
    const balances = [
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

    return NextResponse.json({
      balances,
      latestTransactions,
    })

  } catch (error) {
    console.error('Failed to fetch treasury data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch treasury data' },
      { status: 500 }
    )
  }
}

async function fetchTransactionsFromEtherscan() {
  try {
    const transactions: any[] = []

    // Fetch from Ethereum Mainnet
    const ethApiKey = process.env.ETHERSCAN_API_KEY
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

    // Fetch from Base (using same API key)
    if (ethApiKey) {
      const baseUrl = `https://api.basescan.org/api?module=account&action=txlist&address=${TREASURY_ADDRESS}&startblock=0&endblock=99999999&page=1&offset=5&sort=desc&apikey=${ethApiKey}`
      
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