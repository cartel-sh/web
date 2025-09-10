import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path.join('/');
  
  const headers: HeadersInit = {
    'X-GitHub-Api-Version': '2022-11-28'
  };
  
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const githubUrl = `https://api.github.com/${pathString}`;
    const githubResponse = await fetch(githubUrl, { headers });
    
    if (!githubResponse.ok) {
      return NextResponse.json(
        { error: `GitHub API error: ${githubResponse.statusText}` },
        { status: githubResponse.status }
      );
    }
    
    const data = await githubResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch from GitHub API' },
      { status: 500 }
    );
  }
}