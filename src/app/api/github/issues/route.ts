import { NextRequest, NextResponse } from 'next/server';

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
