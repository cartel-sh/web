import { isAddress } from 'viem'

// Supported chains and their configuration
const CHAIN_CONFIG = {
  1: {
    id: 1,
    chainId: BigInt(1),
    name: 'Ethereum',
    rpcUrl: 'https://ethereum.publicnode.com',
    safeService: 'https://safe-transaction-mainnet.safe.global'
  },
  137: {
    id: 137,
    chainId: BigInt(137),
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    safeService: 'https://safe-transaction-polygon.safe.global'
  },
  42161: {
    id: 42161,
    chainId: BigInt(42161),
    name: 'Arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    safeService: 'https://safe-transaction-arbitrum.safe.global'
  },
  10: {
    id: 10,
    chainId: BigInt(10),
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    safeService: 'https://safe-transaction-optimism.safe.global'
  },
  8453: {
    id: 8453,
    chainId: BigInt(8453),
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    safeService: 'https://safe-transaction-base.safe.global'
  },
  56: {
    id: 56,
    chainId: BigInt(56),
    name: 'BNB Chain',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    safeService: 'https://safe-transaction-bsc.safe.global'
  },
  100: {
    id: 100,
    chainId: BigInt(100),
    name: 'Gnosis Chain',
    rpcUrl: 'https://rpc.gnosischain.com',
    safeService: 'https://safe-transaction-gnosis-chain.safe.global'
  },
  43114: {
    id: 43114,
    chainId: BigInt(43114),
    name: 'Avalanche',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    safeService: 'https://safe-transaction-avalanche.safe.global'
  },
  42220: {
    id: 42220,
    chainId: BigInt(42220),
    name: 'Celo',
    rpcUrl: 'https://forno.celo.org',
    safeService: 'https://safe-transaction-celo.safe.global'
  },
  11155111: {
    id: 11155111,
    chainId: BigInt(11155111),
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3',
    safeService: 'https://safe-transaction-sepolia.safe.global'
  }
} as const

export type SupportedChainId = keyof typeof CHAIN_CONFIG

export interface SafeInfo {
  address: string
  threshold: number
  owners: string[]
  nonce: number
  version: string
  modules: string[]
  guard?: string
  fallbackHandler?: string
  chainId: number
  chainIds?: number[]
  chainData?: {
    [chainId: number]: {
      nonce?: number;
      version?: string;
      masterCopy?: string;
    };
  }
}

export interface SafeBalance {
  total: bigint
  tokens: Array<{
    symbol: string
    balance: bigint
    decimals: number
    usdValue?: number
    tokenAddress?: string
  }>
}

export interface SafeValidationResult {
  isValid: boolean
  exists: boolean
  chainId?: number
  error?: string
}

/**
 * Validates if an address is a Safe on any supported chain
 */
export async function validateSafeAddress(address: string): Promise<SafeValidationResult> {
  if (!isAddress(address)) {
    return { isValid: false, exists: false, error: 'Invalid Ethereum address' }
  }

  try {
    const response = await fetch('/api/safe/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      return {
        isValid: true,
        exists: true,
        chainId: data.safeInfo.chainId
      }
    } else {
      return {
        isValid: true,
        exists: false,
        error: data.error || 'Safe not found on supported networks'
      }
    }
  } catch (error) {
    return {
      isValid: false,
      exists: false,
      error: error instanceof Error ? error.message : 'Failed to validate Safe address'
    }
  }
}

/**
 * Fetches comprehensive Safe information
 */
export async function fetchSafeInfo(address: string, chainId?: number): Promise<SafeInfo> {
  if (!isAddress(address)) {
    throw new Error('Invalid Ethereum address')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

  try {
    if (chainId) {
      // If chainId is specified, fetch from that specific chain
      const response = await fetch(`/api/safe/import?address=${address}&chainId=${chainId}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `Safe not found on chain ${chainId}`)
      }
      
      return data
    } else {
      // If no chainId specified, try to find it on any supported chain
      const response = await fetch('/api/safe/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Safe not found on any supported network')
      }

      return data.safeInfo
    }
  } catch (error) {
    clearTimeout(timeoutId)
    
    // Handle timeout errors specifically
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - Safe lookup is taking too long')
    }
    
    throw new Error(`Failed to fetch Safe info: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Gets Safe balance information
 */
export async function getSafeBalance(address: string, chainId: number): Promise<SafeBalance> {
  if (!isAddress(address)) {
    throw new Error('Invalid Ethereum address')
  }

  const chainConfig = CHAIN_CONFIG[chainId as SupportedChainId]
  if (!chainConfig) {
    throw new Error(`Unsupported chainId: ${chainId}`)
  }

  try {
    // For now, we'll return a placeholder structure since balance fetching 
    // from Safe API Kit requires more complex setup and different endpoints
    // This can be enhanced later with proper balance fetching logic using viem or other RPC methods
    const mockBalance: SafeBalance = {
      total: BigInt(0),
      tokens: []
    }

    return mockBalance
  } catch (error) {
    throw new Error(`Failed to fetch Safe balance: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generates a smart default name for a Safe based on its configuration
 */
export function generateSafeName(safeInfo: SafeInfo): string {
  const { threshold, owners } = safeInfo
  
  if (threshold === 1 && owners.length === 1) {
    return `Single Owner Safe`
  }
  
  if (threshold === owners.length) {
    return `${owners.length}/${owners.length} Unanimous Safe`
  }
  
  return `${threshold}/${owners.length} Multisig Safe`
}

/**
 * Gets the chain display name
 */
export function getChainDisplayName(chainId: number): string {
  const chainConfig = CHAIN_CONFIG[chainId as SupportedChainId]
  return chainConfig?.name || `Chain ${chainId}`
}

/**
 * Gets all supported chains
 */
export function getSupportedChains(): Array<{ chainId: number; name: string }> {
  return Object.entries(CHAIN_CONFIG).map(([chainIdStr, config]) => ({
    chainId: parseInt(chainIdStr),
    name: config.name
  }))
}