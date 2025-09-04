import { NextRequest, NextResponse } from 'next/server';
import { CartelClient, InMemoryTokenStorage } from '@cartel-sh/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cartel.sh';
const API_KEY = process.env.API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Missing owner or repo parameter' },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Cartel-App/1.0'
    };

    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    const githubResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=50&sort=updated&direction=desc`,
      { headers }
    );

    if (!githubResponse.ok) {
      if (githubResponse.status === 404) {
        return NextResponse.json(
          { error: 'Repository not found or issues are disabled' },
          { status: 404 }
        );
      }

      if (githubResponse.status === 403) {
        const errorData = await githubResponse.json().catch(() => ({}));
        if (errorData.message?.includes('rate limit')) {
          return NextResponse.json(
            { error: 'GitHub API rate limit exceeded. Server needs a GitHub token for higher limits.' },
            { status: 403 }
          );
        }
        return NextResponse.json(
          { error: 'Access forbidden. Repository may be private or require authentication.' },
          { status: 403 }
        );
      }

      if (githubResponse.status === 401) {
        return NextResponse.json(
          { error: 'GitHub authentication failed. Check server token configuration.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: `Failed to fetch issues: ${githubResponse.statusText}` },
        { status: githubResponse.status }
      );
    }

    const issues = await githubResponse.json();

    const filteredIssues = issues.filter((issue: any) => !issue.html_url.includes('/pull/'));

    return NextResponse.json({
      issues: filteredIssues,
      repoInfo: {
        name: repo,
        owner: owner,
        full_name: `${owner}/${repo}`
      }
    });

  } catch (error) {
    console.error('Error in GitHub API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the JWT token from cookies to authenticate the user
    const accessToken = request.cookies.get('access_token')?.value;
    
    console.log('GitHub issue creation - cookie check:', {
      hasAccessToken: !!accessToken,
      cookieCount: request.cookies.getAll().length,
      allCookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value ? 'present' : 'empty']))
    });
    
    if (!accessToken) {
      return NextResponse.json(
        { 
          error: 'Authentication required. No access token found in cookies. Please sign in to create issues.',
          debug: {
            cookiesFound: request.cookies.getAll().map(c => c.name),
            expectedCookie: 'access_token'
          }
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { owner, repo, title, body: issueBody, labels } = body;

    console.log('GitHub issue creation request:', {
      owner,
      repo, 
      title,
      bodyLength: issueBody?.length || 0,
      hasLabels: !!labels
    });

    if (!owner || !repo || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: owner, repo, and title are required' },
        { status: 400 }
      );
    }

    // Create server-side client with user's access token to get their GitHub connection
    const tokenStorage = new InMemoryTokenStorage();
    tokenStorage.setTokens(accessToken, '', 3600);
    const serverCartel = new CartelClient(API_URL, API_KEY, tokenStorage);

    // Get user's GitHub identity to find their GitHub OAuth token
    let githubIdentity;
    try {
      console.log('Fetching user identities...');
      const identities = await serverCartel.users.getMyIdentities();
      console.log('User identities:', identities.map(i => ({ platform: i.platform, hasMetadata: !!i.metadata, hasOAuthToken: !!(i.metadata?.oauthAccessToken) })));
      
      githubIdentity = identities.find(identity => identity.platform === 'github');
      
      if (!githubIdentity) {
        return NextResponse.json(
          { 
            error: 'GitHub account not connected. Please connect your GitHub account first.',
            debug: {
              connectedPlatforms: identities.map(i => i.platform),
              totalIdentities: identities.length
            }
          },
          { status: 403 }
        );
      }
      
      if (!githubIdentity.metadata?.oauthAccessToken) {
        return NextResponse.json(
          { 
            error: 'GitHub OAuth token not available. Please reconnect your GitHub account to enable issue creation.',
            debug: {
              hasGithubIdentity: true,
              hasMetadata: !!githubIdentity.metadata,
              metadataKeys: githubIdentity.metadata ? Object.keys(githubIdentity.metadata) : []
            }
          },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error('Failed to get user identities:', error);
      return NextResponse.json(
        { 
          error: 'Failed to verify GitHub connection. Please ensure your GitHub account is connected.',
          debug: {
            apiError: error instanceof Error ? error.message : String(error)
          }
        },
        { status: 403 }
      );
    }

    // Use the user's GitHub OAuth token to create the issue
    const githubToken = githubIdentity.metadata.oauthAccessToken;
    
    const issueData: any = {
      title: title.trim(),
      body: issueBody?.trim() || '',
    };

    // Add labels if provided
    if (labels && Array.isArray(labels) && labels.length > 0) {
      issueData.labels = labels;
    }

    const githubResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Cartel-App/1.0'
        },
        body: JSON.stringify(issueData)
      }
    );

    if (!githubResponse.ok) {
      const errorData = await githubResponse.json().catch(() => ({}));
      
      if (githubResponse.status === 404) {
        return NextResponse.json(
          { error: 'Repository not found or you do not have permission to create issues in this repository.' },
          { status: 404 }
        );
      }

      if (githubResponse.status === 403) {
        if (errorData.message?.includes('rate limit')) {
          return NextResponse.json(
            { error: 'GitHub API rate limit exceeded. Please try again later.' },
            { status: 403 }
          );
        }
        return NextResponse.json(
          { error: 'Access forbidden. You may not have permission to create issues in this repository.' },
          { status: 403 }
        );
      }

      if (githubResponse.status === 401) {
        return NextResponse.json(
          { error: 'GitHub authentication failed. Please reconnect your GitHub account.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: `Failed to create issue: ${errorData.message || githubResponse.statusText}` },
        { status: githubResponse.status }
      );
    }

    const createdIssue = await githubResponse.json();

    return NextResponse.json({
      issue: createdIssue,
      success: true
    });

  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
