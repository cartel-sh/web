import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from 'viem';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface ApplicationData {
  walletAddress: string;
  ensName?: string;
  github?: string;
  farcaster?: string;
  lens?: string;
  twitter?: string;
  excitement: string;
  motivation: string;
  signature: string;
  message: string;
}

async function sendToApplicationServer(data: ApplicationData): Promise<boolean> {
  const serverUrl = process.env.APPLICATION_SERVER_URL;
  
  if (!serverUrl) {
    console.error("[DELIVERY FAILED] Application server URL not configured in environment variables");
    return false;
  }
  
  try {
    const response = await fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.APPLICATION_SERVER_TOKEN || ''}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      console.error(`[DELIVERY FAILED] Bot server returned ${response.status}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`[DELIVERY FAILED] Could not reach bot server`);
    return false;
  }
}

function checkRateLimit(ip: string): boolean {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  const now = Date.now();
  const limit = 1;
  const windowMs = 7 * 24 * 60 * 60 * 1000;
  
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 24 * 60 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many applications. Please try again later." },
        { status: 429 }
      );
    }
    
    const data: ApplicationData = await request.json();
    
    if (!data.walletAddress || !data.excitement?.trim() || 
        !data.motivation?.trim() || !data.signature || !data.message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    try {
      const isValid = await verifyMessage({
        address: data.walletAddress as `0x${string}`,
        message: data.message,
        signature: data.signature as `0x${string}`,
      });
      
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error(`[SIGNATURE ERROR] Failed to verify signature`);
      return NextResponse.json(
        { error: "Failed to verify signature" },
        { status: 400 }
      );
    }
    
    if (data.motivation.length > 500) {
      return NextResponse.json(
        { error: "Motivation must be under 500 characters" },
        { status: 400 }
      );
    }
    
    const sent = await sendToApplicationServer(data);
    
    if (!sent) {
      console.error("[APPLICATION FAILED] Could not deliver to bot server");
      
      return NextResponse.json(
        { error: "Failed to submit application. Please try again or contact support." },
        { status: 500 }
      );
    }
    
    console.log(`[APPLICATION SUCCESS] Application processed and delivered`);
    
    return NextResponse.json(
      { success: true, message: "Application submitted successfully!" },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("[API ERROR] Unexpected error in application endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}