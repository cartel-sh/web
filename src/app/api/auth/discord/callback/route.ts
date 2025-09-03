import { NextRequest, NextResponse } from 'next/server';
import { cartel } from '@/lib/cartel-client';

const DISCORD_CLIENT_ID = '1412792170884235376';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'FHVkaG562BP_yJmR6N3ShktKdMTnnpyU';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (!code) {
      return NextResponse.redirect(new URL('/dash/account?error=missing_code', request.url));
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
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cartel.sh'}/api/auth/discord/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for token:', await tokenResponse.text());
      return NextResponse.redirect(new URL('/dash/account?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('Discord OAuth error:', tokenData.error);
      return NextResponse.redirect(new URL('/dash/account?error=oauth_error', request.url));
    }

    const accessToken = tokenData.access_token;

    // Fetch user profile
    const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch Discord user:', await userResponse.text());
      return NextResponse.redirect(new URL('/dash/account?error=user_fetch_failed', request.url));
    }

    const discordUser = await userResponse.json();

    // Fetch user connections for additional profile info
    let connections = [];
    try {
      const connectionsResponse = await fetch('https://discord.com/api/v10/users/@me/connections', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (connectionsResponse.ok) {
        connections = await connectionsResponse.json();
      }
    } catch (error) {
      // Connections are optional, don't fail if we can't get them
      console.log('Could not fetch Discord connections:', error);
    }

    // Build display name
    const displayName = discordUser.global_name || 
                       discordUser.display_name || 
                       discordUser.username;

    // Build avatar URL
    const avatarUrl = discordUser.avatar 
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${discordUser.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator) % 5}.png`;

    // Connect the Discord identity to the user's account
    try {
      const result = await cartel.users.connectMyIdentity({
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
        return NextResponse.redirect(new URL('/dash/account?reassigned=true&platform=discord', request.url));
      }

      return NextResponse.redirect(new URL('/dash/account?connected=discord', request.url));
    } catch (apiError: any) {
      console.error('Failed to connect Discord identity:', apiError);
      
      // Check if user is not authenticated
      if (apiError.status === 401) {
        // Store OAuth data in session for after login
        const response = NextResponse.redirect(new URL('/dash?oauth_pending=discord', request.url));
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

      return NextResponse.redirect(new URL('/dash/account?error=connection_failed', request.url));
    }
  } catch (error: any) {
    console.error('Discord OAuth callback error:', error);
    return NextResponse.redirect(new URL('/dash/account?error=unexpected', request.url));
  }
}