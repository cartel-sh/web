import { NextRequest, NextResponse } from 'next/server';
import { CartelClient, InMemoryTokenStorage } from '@cartel-sh/api';

const DISCORD_CLIENT_ID = '1412792170884235376';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cartel.sh';
const API_KEY = process.env.API_KEY || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cartel.sh';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(new URL('/dash/account?error=missing_code', APP_URL));
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${APP_URL}/api/auth/discord/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for token:', await tokenResponse.text());
      return NextResponse.redirect(new URL('/dash/account?error=token_exchange_failed', APP_URL));
    }

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('Discord OAuth error:', tokenData.error);
      return NextResponse.redirect(new URL('/dash/account?error=oauth_error', APP_URL));
    }

    const discordAccessToken = tokenData.access_token;

    // Fetch user profile
    const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bearer ${discordAccessToken}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch Discord user:', await userResponse.text());
      return NextResponse.redirect(new URL('/dash/account?error=user_fetch_failed', APP_URL));
    }

    const discordUser = await userResponse.json();

    // Note: Discord connections could be fetched here if needed for additional profile info
    // but are not required for basic identity connection

    // Build display name
    const displayName = discordUser.global_name || 
                       discordUser.display_name || 
                       discordUser.username;

    // Build avatar URL
    const avatarUrl = discordUser.avatar 
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${discordUser.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator) % 5}.png`;

    console.log('All cookies received:', Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value])));
    const accessToken = request.cookies.get('access_token')?.value;
    console.log('Discord OAuth callback - Found access token:', accessToken ? 'YES' : 'NO');
    if (accessToken) {
      console.log('Access token length:', accessToken.length);
    }
    
    if (!accessToken) {
      // User is not authenticated, store OAuth data for after login
      const response = NextResponse.redirect(new URL('/dash?oauth_pending=discord', APP_URL));
      response.cookies.set('pending_discord_oauth', JSON.stringify({
        id: discordUser.id,
        username: discordUser.username,
        displayName: displayName,
        avatarUrl: avatarUrl,
        email: discordUser.email,
        profileUrl: `https://discord.com/users/${discordUser.id}`,
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 300, // 5 minutes
      });
      return response;
    }

    // Create server-side client with user's access token
    const tokenStorage = new InMemoryTokenStorage();
    tokenStorage.setTokens(accessToken, '', 0);
    const serverCartel = new CartelClient(API_URL, API_KEY, tokenStorage);

    // Connect the Discord identity to the user's account
    try {
      const result = await serverCartel.users.connectMyIdentity({
        platform: 'discord',
        identity: discordUser.id,
        metadata: {
          username: discordUser.username,
          displayName: displayName,
          avatarUrl: avatarUrl,
          email: discordUser.email,
          profileUrl: `https://discord.com/users/${discordUser.id}`,
        },
        verifiedAt: new Date().toISOString(),
      });

      // Check if identity was reassigned
      if (result.reassigned) {
        return NextResponse.redirect(new URL('/dash/account?reassigned=true&platform=discord', APP_URL));
      }

      return NextResponse.redirect(new URL('/dash/account?connected=discord', APP_URL));
    } catch (apiError: any) {
      console.error('Failed to connect Discord identity:', apiError);
      
      // Check if user is not authenticated
      if (apiError.status === 401) {
        // Store OAuth data in session for after login
        const response = NextResponse.redirect(new URL('/dash?oauth_pending=discord', APP_URL));
        response.cookies.set('pending_discord_oauth', JSON.stringify({
          id: discordUser.id,
          username: discordUser.username,
          displayName: displayName,
          avatarUrl: avatarUrl,
          email: discordUser.email,
          profileUrl: `https://discord.com/users/${discordUser.id}`,
        }), {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 300, // 5 minutes
        });
        return response;
      }

      return NextResponse.redirect(new URL('/dash/account?error=connection_failed', APP_URL));
    }
  } catch (error: any) {
    console.error('Discord OAuth callback error:', error);
    return NextResponse.redirect(new URL('/dash/account?error=unexpected', APP_URL));
  }
}