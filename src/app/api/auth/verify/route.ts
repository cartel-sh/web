import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { nonceStore } from '@/lib/nonce-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cartel.sh';
const API_KEY = process.env.API_KEY;

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
    
    // Now send to API to get the authentication cookie (keep nonce until success)
    // We need to make the request directly since we're in a server environment
    const response = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY || '',
      },
      body: JSON.stringify({ message, signature }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API verification failed:', errorText);
      return NextResponse.json(
        { error: `API verification failed: ${errorText}` },
        { status: response.status }
      );
    }
    
    const authResponse = await response.json();
    
    // Only delete nonce after successful API verification
    nonceStore.delete(address);
    
    // Create response with auth data
    const res = NextResponse.json(authResponse);
    
    // Forward any set-cookie headers from the API
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      res.headers.set('set-cookie', setCookieHeader);
    }
    
    return res;
    
  } catch (error: any) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}