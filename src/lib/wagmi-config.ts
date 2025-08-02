import { createConfig, http } from '@wagmi/core'
import { mainnet, base } from '@wagmi/core/chains'

export const config = createConfig({
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
})

// Treasury address for Indie Cartel MultiSig Safe (same on both chains)
export const TREASURY_ADDRESS = '0x0c49bC3DAadDf30b78718d5ae623ffBC076b6f8b' as const

// USDC token contracts
export const USDC_CONTRACTS = {
  [mainnet.id]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as const,
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const,
} as const

// ERC-20 ABI for balance queries
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const