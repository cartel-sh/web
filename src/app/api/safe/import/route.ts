import { NextRequest, NextResponse } from 'next/server'
import { isAddress } from 'viem'

// Supported chains and their configuration
const CHAIN_CONFIG = {
  1: {
    id: 1,
    chainId: BigInt(1),
    name: 'Ethereum',
    txServiceUrl: 'https://safe-transaction-mainnet.safe.global'
  },
  137: {
    id: 137,
    chainId: BigInt(137),
    name: 'Polygon',
    txServiceUrl: 'https://safe-transaction-polygon.safe.global'
  },
  42161: {
    id: 42161,
    chainId: BigInt(42161),
    name: 'Arbitrum',
    txServiceUrl: 'https://safe-transaction-arbitrum.safe.global'
  },
  10: {
    id: 10,
    chainId: BigInt(10),
    name: 'Optimism',
    txServiceUrl: 'https://safe-transaction-optimism.safe.global'
  },
  8453: {
    id: 8453,
    chainId: BigInt(8453),
    name: 'Base',
    txServiceUrl: 'https://safe-transaction-base.safe.global'
  },
  56: {
    id: 56,
    chainId: BigInt(56),
    name: 'BNB Chain',
    txServiceUrl: 'https://safe-transaction-bsc.safe.global'
  },
  100: {
    id: 100,
    chainId: BigInt(100),
    name: 'Gnosis Chain',
    txServiceUrl: 'https://safe-transaction-gnosis-chain.safe.global'
  },
  43114: {
    id: 43114,
    chainId: BigInt(43114),
    name: 'Avalanche',
    txServiceUrl: 'https://safe-transaction-avalanche.safe.global'
  },
  42220: {
    id: 42220,
    chainId: BigInt(42220),
    name: 'Celo',
    txServiceUrl: 'https://safe-transaction-celo.safe.global'
  },
  11155111: {
    id: 11155111,
    chainId: BigInt(11155111),
    name: 'Sepolia',
    txServiceUrl: 'https://safe-transaction-sepolia.safe.global'
  }
} as const

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()
    
    if (!address || !isAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      )
    }

    const foundChains: Array<{
      chainId: number;
      name: string;
      safeInfo: any;
    }> = []

    // Use Promise.allSettled with timeout to prevent hanging
    const chainChecks = Object.entries(CHAIN_CONFIG).map(async ([chainIdKey, config]) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      try {
        console.log(`Checking Safe on chain ${chainIdKey} with URL:`, `${config.txServiceUrl}/api/v1/safes/${address}/`)

        const response = await fetch(`${config.txServiceUrl}/api/v1/safes/${address}/`, {
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const safeInfo = await response.json()
          console.log(`Safe found on chain ${chainIdKey}:`, safeInfo)
          
          return {
            chainId: config.id,
            name: config.name,
            safeInfo
          }
        } else {
          console.log(`Safe not found on chain ${chainIdKey}: HTTP ${response.status}`)
          return null
        }
      } catch (error) {
        clearTimeout(timeoutId)
        console.log(`Error checking Safe on chain ${chainIdKey}:`, error instanceof Error ? error.message : 'Unknown error')
        return null
      }
    })

    const results = await Promise.allSettled(chainChecks)
    
    // Collect successful results
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        foundChains.push(result.value)
      }
    })

    if (foundChains.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Safe not found on any supported networks' 
        },
        { status: 404 }
      )
    }

    const primaryChain = foundChains[0]
    const allChainIds = foundChains.map(c => c.chainId)
    
    // Create chain-specific metadata
    const chainData: { [key: number]: any } = {}
    foundChains.forEach(({ chainId, safeInfo }) => {
      chainData[chainId] = {
        nonce: Number(safeInfo.nonce),
        version: safeInfo.version,
        masterCopy: safeInfo.masterCopy
      }
    })

    return NextResponse.json({
      success: true,
      safeInfo: {
        address: primaryChain.safeInfo.address,
        threshold: primaryChain.safeInfo.threshold,
        owners: primaryChain.safeInfo.owners,
        nonce: Number(primaryChain.safeInfo.nonce),
        version: primaryChain.safeInfo.version,
        modules: primaryChain.safeInfo.modules || [],
        guard: primaryChain.safeInfo.guard === "0x0000000000000000000000000000000000000000" ? undefined : primaryChain.safeInfo.guard,
        fallbackHandler: primaryChain.safeInfo.fallbackHandler,
        chainId: primaryChain.chainId, // Primary chain ID
        chainIds: allChainIds, // All chain IDs where Safe exists
        chainData // Per-chain specific data
      }
    })
    
  } catch (error) {
    console.error('Error importing Safe:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to import Safe: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const chainId = searchParams.get('chainId')
  
  if (!address || !isAddress(address)) {
    return NextResponse.json(
      { error: 'Invalid Ethereum address' },
      { status: 400 }
    )
  }

  if (!chainId || !(chainId in CHAIN_CONFIG)) {
    return NextResponse.json(
      { error: 'Invalid or unsupported chainId' },
      { status: 400 }
    )
  }

  try {
    const config = CHAIN_CONFIG[parseInt(chainId) as keyof typeof CHAIN_CONFIG]
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout for single chain
    
    const response = await fetch(`${config.txServiceUrl}/api/v1/safes/${address}/`, {
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Safe not found' },
        { status: 404 }
      )
    }

    const safeInfo = await response.json()
    
    return NextResponse.json({
      address: safeInfo.address,
      threshold: safeInfo.threshold,
      owners: safeInfo.owners,
      nonce: Number(safeInfo.nonce),
      version: safeInfo.version,
      modules: safeInfo.modules || [],
      guard: safeInfo.guard === "0x0000000000000000000000000000000000000000" ? undefined : safeInfo.guard,
      fallbackHandler: safeInfo.fallbackHandler,
      chainId: config.id
    })
    
  } catch (error) {
    console.error(`Error fetching Safe info for chainId ${chainId}:`, error)
    
    // Handle timeout specifically
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          error: 'Request timeout - Safe API took too long to respond',
          details: 'The Safe Transaction Service is currently slow or unavailable'
        },
        { status: 408 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Safe not found on chain ' + chainId,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 404 }
    )
  }
}