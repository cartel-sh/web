// Shared nonce store for SIWE authentication
// This ensures the same store is used across all API routes

interface NonceData {
  nonce: string;
  expires: number;
}

// Use global to persist across hot reloads in development
declare global {
  var __nonceStore: Map<string, NonceData> | undefined;
  var __nonceCleanupInterval: NodeJS.Timeout | undefined;
}

// Initialize or reuse existing store
if (!global.__nonceStore) {
  global.__nonceStore = new Map<string, NonceData>();
  console.log('Initialized global nonce store');
}

// Clean expired nonces periodically
if (typeof window === 'undefined' && !global.__nonceCleanupInterval) {
  // Only run on server and only set up once
  global.__nonceCleanupInterval = setInterval(() => {
    const now = Date.now();
    if (global.__nonceStore) {
      for (const [key, data] of global.__nonceStore.entries()) {
        if (data.expires < now) {
          global.__nonceStore.delete(key);
          console.log(`Cleaned expired nonce for ${key}`);
        }
      }
    }
  }, 60 * 1000); // Every minute
}

export const nonceStore = global.__nonceStore;