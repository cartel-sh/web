import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { nonceStore } from '@/lib/nonce-store';
import { CartelClient, InMemoryTokenStorage } from '@cartel-sh/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cartel.sh';
const API_KEY = process.env.API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json();
    
    // Parse SIWE message
    const siweMessage = new SiweMessage(message);
    const address = siweMessage.address.toLowerCase();
    
    // Verify nonce exists and is valid
    const storedNonce = nonceStore.get(address);
    
    if (!storedNonce) {
      console.error(`No nonce found for address: ${address}`);
      return NextResponse.json(
        { error: 'Invalid or expired nonce. Please try signing in again.' },
        { status: 400 }
      );
    }
    
    if (storedNonce.nonce !== siweMessage.nonce) {
      console.error(`Nonce mismatch: stored=${storedNonce.nonce}, received=${siweMessage.nonce}`);
      return NextResponse.json(
        { error: 'Nonce mismatch. Please try signing in again.' },
        { status: 400 }
      );
    }
    
    if (storedNonce.expires < Date.now()) {
      nonceStore.delete(address);
      console.error(`Nonce expired: expires=${storedNonce.expires}, now=${Date.now()}`);
      return NextResponse.json(
        { error: 'Nonce expired. Please try signing in again.' },
        { status: 400 }
      );
    }
    
    // Verify the SIWE message locally
    const result = await siweMessage.verify({ signature });
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Create a server-side client with in-memory storage (no persistence needed)
    const serverClient = new CartelClient(API_URL, API_KEY, new InMemoryTokenStorage());
    
    try {
      // Verify with the API to get JWT tokens
      const authResponse = await serverClient.verifySiwe(message, signature);
      
      // Only delete nonce after successful API verification
      nonceStore.delete(address);
      
      // Return the JWT tokens to the client
      return NextResponse.json(authResponse);
    } catch (apiError: any) {
      console.error('API verification failed:', apiError);
      return NextResponse.json(
        { error: apiError.message || 'API verification failed' },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}