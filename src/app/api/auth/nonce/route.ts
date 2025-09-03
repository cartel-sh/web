import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { nonceStore } from '@/lib/nonce-store';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/i.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }
    
    // Generate cryptographically secure nonce
    const nonce = randomBytes(16).toString('hex');
    
    // Store nonce with 5 minute expiry
    const key = address.toLowerCase();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    
    nonceStore.set(key, {
      nonce,
      expires: expiresAt,
    });
    
    
    return NextResponse.json({ nonce });
  } catch (error) {
    console.error('Nonce generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
}