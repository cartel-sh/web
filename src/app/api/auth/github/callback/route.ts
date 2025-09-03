import { NextRequest, NextResponse } from 'next/server';
import { CartelClient, InMemoryTokenStorage } from '@cartel-sh/api';

const GITHUB_CLIENT_ID = 'Ov23li1F1GdAUI3la94w';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
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
      return NextResponse.redirect(new URL('/dash/account?error=token_exchange_failed', APP_URL));
    }

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('GitHub OAuth error:', tokenData.error);
      return NextResponse.redirect(new URL('/dash/account?error=oauth_error', APP_URL));
    }

    const githubAccessToken = tokenData.access_token;

    // Fetch user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch GitHub user:', await userResponse.text());
      return NextResponse.redirect(new URL('/dash/account?error=user_fetch_failed', APP_URL));
    }

    const githubUser = await userResponse.json();

    // Fetch user email if not public
    let email = githubUser.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${githubAccessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((e: any) => e.primary);
        email = primaryEmail?.email;
      }
    }

    // Get the JWT token from cookies
    const accessToken = request.cookies.get('access_token')?.value;
    
    if (!accessToken) {
      // User is not authenticated, store OAuth data for after login
      const response = NextResponse.redirect(new URL('/dash?oauth_pending=github', APP_URL));
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

    // Connect the GitHub identity to the user's account
    try {
      const result = await serverCartel.users.connectMyIdentity({
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
        return NextResponse.redirect(new URL('/dash/account?reassigned=true&platform=github', APP_URL));
      }

      return NextResponse.redirect(new URL('/dash/account?connected=github', APP_URL));
    } catch (apiError: any) {
      console.error('Failed to connect GitHub identity:', apiError);
      
      // Check if user is not authenticated
      if (apiError.status === 401) {
        // Store OAuth data in session for after login
        const response = NextResponse.redirect(new URL('/dash?oauth_pending=github', APP_URL));
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

      return NextResponse.redirect(new URL('/dash/account?error=connection_failed', APP_URL));
    }
  } catch (error: any) {
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.redirect(new URL('/dash/account?error=unexpected', APP_URL));
  }
}