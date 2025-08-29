import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cartel.sh';
const API_KEY = process.env.API_KEY;


export async function POST(request: NextRequest) {
  try {
    // Get the cookie from the request
    const cookie = request.headers.get('cookie') || '';
    
    // Make the logout request with the cookie
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Cookie': cookie,
        'X-API-Key': API_KEY || '',
      },
      credentials: 'include',
    });
    
    const data = await response.json();
    
    // Create response
    const res = NextResponse.json(data);
    
    // Forward the set-cookie header to clear the cookie
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      res.headers.set('set-cookie', setCookieHeader);
    }
    
    return res;
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}