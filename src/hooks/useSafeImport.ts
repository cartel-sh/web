import { useState, useCallback } from 'react'
import { validateSafeAddress, fetchSafeInfo, getSafeBalance, generateSafeName, type SafeInfo, type SafeBalance, type SafeValidationResult } from '@/lib/safe-service'

export interface SafeImportState {
  isValidating: boolean
  isLoading: boolean
  validation: SafeValidationResult | null
  safeInfo: SafeInfo | null
  balance: SafeBalance | null
  error: string | null
}

export interface SafeImportActions {
  validateAddress: (address: string) => Promise<SafeValidationResult>
  importSafe: (address: string, chainId?: number) => Promise<SafeInfo>
  loadBalance: (address: string, chainId: number) => Promise<SafeBalance>
  reset: () => void
  generateName: (safeInfo: SafeInfo) => string
}

const initialState: SafeImportState = {
  isValidating: false,
  isLoading: false,
  validation: null,
  safeInfo: null,
  balance: null,
  error: null
}

export function useSafeImport(): SafeImportState & SafeImportActions {
  const [state, setState] = useState<SafeImportState>(initialState)

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, isValidating: false, isLoading: false }))
  }, [])

  const validateAddress = useCallback(async (address: string): Promise<SafeValidationResult> => {
    setState(prev => ({ 
      ...prev, 
      isValidating: true, 
      error: null, 
      validation: null 
    }))

    try {
      const validation = await validateSafeAddress(address)
      
      setState(prev => ({ 
        ...prev, 
        isValidating: false, 
        validation,
        error: validation.error || null 
      }))

      return validation
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Validation failed'
      setError(message)
      return { isValid: false, exists: false, error: message }
    }
  }, [setError])

  const importSafe = useCallback(async (address: string, chainId?: number): Promise<SafeInfo> => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      safeInfo: null,
      balance: null
    }))

    try {
      const safeInfo = await fetchSafeInfo(address, chainId)
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        safeInfo 
      }))

      return safeInfo
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import Safe'
      setError(message)
      throw error
    }
  }, [setError])

  const loadBalance = useCallback(async (address: string, chainId: number): Promise<SafeBalance> => {
    try {
      const balance = await getSafeBalance(address, chainId)
      
      setState(prev => ({ 
        ...prev, 
        balance 
      }))

      return balance
    } catch (error) {
      // Don't set error state for balance loading failures - it's not critical
      console.warn('Failed to load Safe balance:', error)
      const mockBalance: SafeBalance = { total: BigInt(0), tokens: [] }
      setState(prev => ({ ...prev, balance: mockBalance }))
      return mockBalance
    }
  }, [])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  const generateName = useCallback((safeInfo: SafeInfo): string => {
    return generateSafeName(safeInfo)
  }, [])

  return {
    ...state,
    validateAddress,
    importSafe,
    loadBalance,
    reset,
    generateName
  }
}

/**
 * Hook for quick Safe address validation without full import
 */
export function useSafeValidation() {
  const [isValidating, setIsValidating] = useState(false)
  const [lastValidation, setLastValidation] = useState<SafeValidationResult | null>(null)

  const validate = useCallback(async (address: string): Promise<SafeValidationResult> => {
    if (!address.trim()) {
      const result: SafeValidationResult = { isValid: false, exists: false }
      setLastValidation(result)
      return result
    }

    setIsValidating(true)
    
    try {
      const result = await validateSafeAddress(address)
      setLastValidation(result)
      return result
    } catch (error) {
      const result: SafeValidationResult = { 
        isValid: false, 
        exists: false, 
        error: error instanceof Error ? error.message : 'Validation failed' 
      }
      setLastValidation(result)
      return result
    } finally {
      setIsValidating(false)
    }
  }, [])

  const reset = useCallback(() => {
    setLastValidation(null)
    setIsValidating(false)
  }, [])

  return {
    isValidating,
    lastValidation,
    validate,
    reset
  }
}