import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cartel.sh';
const API_KEY = process.env.API_KEY;

export async function GET(request: NextRequest) {
  try {
    // Get the cookie from the request
    const cookie = request.headers.get('cookie') || '';
    
    // Make the request with the cookie
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Cookie': cookie,
        'X-API-Key': API_KEY || '',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user info' },
      { status: 500 }
    );
  }
}