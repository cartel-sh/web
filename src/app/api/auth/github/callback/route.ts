import { NextRequest, NextResponse } from 'next/server';
import { cartel } from '@/lib/cartel-client';

const GITHUB_CLIENT_ID = 'Ov23li1F1GdAUI3la94w';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (!code) {
      return NextResponse.redirect(new URL('/dash/account?error=missing_code', request.url));
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cartel.sh'}/api/auth/github/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for token:', await tokenResponse.text());
      return NextResponse.redirect(new URL('/dash/account?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('GitHub OAuth error:', tokenData.error);
      return NextResponse.redirect(new URL('/dash/account?error=oauth_error', request.url));
    }

    const accessToken = tokenData.access_token;

    // Fetch user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch GitHub user:', await userResponse.text());
      return NextResponse.redirect(new URL('/dash/account?error=user_fetch_failed', request.url));
    }

    const githubUser = await userResponse.json();

    // Fetch user email if not public
    let email = githubUser.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((e: any) => e.primary);
        email = primaryEmail?.email;
      }
    }

    // Connect the GitHub identity to the user's account
    try {
      const result = await cartel.users.connectMyIdentity({
        platform: 'github',
        identity: githubUser.id.toString(),
        metadata: {
          username: githubUser.login,
          displayName: githubUser.name || githubUser.login,
          avatarUrl: githubUser.avatar_url,
          email: email,
          bio: githubUser.bio,
          profileUrl: githubUser.html_url,
        },
        verifiedAt: new Date().toISOString(),
      });

      // Check if identity was reassigned
      if (result.reassigned) {
        return NextResponse.redirect(new URL('/dash/account?reassigned=true&platform=github', request.url));
      }

      return NextResponse.redirect(new URL('/dash/account?connected=github', request.url));
    } catch (apiError: any) {
      console.error('Failed to connect GitHub identity:', apiError);
      
      // Check if user is not authenticated
      if (apiError.status === 401) {
        // Store OAuth data in session for after login
        const response = NextResponse.redirect(new URL('/dash?oauth_pending=github', request.url));
        response.cookies.set('pending_github_oauth', JSON.stringify({
          id: githubUser.id.toString(),
          username: githubUser.login,
          displayName: githubUser.name || githubUser.login,
          avatarUrl: githubUser.avatar_url,
          email: email,
          bio: githubUser.bio,
          profileUrl: githubUser.html_url,
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
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.redirect(new URL('/dash/account?error=unexpected', request.url));
  }
}