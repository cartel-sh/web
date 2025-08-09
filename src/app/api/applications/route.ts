import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from 'viem';

// Simple in-memory rate limiting (consider Redis for production)
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
    console.error("Application server URL not configured");
    return false;
  }
  
  try {
    const response = await fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.APPLICATION_SERVER_TOKEN || ''}`, // Optional auth token
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error("Application server error:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to send to application server:", error);
    return false;
  }
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = 1; // 1 application per week
  const windowMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  
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

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 24 * 60 * 60 * 1000); // Clean up once per day

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many applications. Please try again later." },
        { status: 429 }
      );
    }
    
    // Parse request body
    const data: ApplicationData = await request.json();
    
    // Validate required fields
    if (!data.walletAddress || !data.excitement?.trim() || 
        !data.motivation?.trim() || !data.signature || !data.message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Verify signature
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
      console.error("Signature verification error:", error);
      return NextResponse.json(
        { error: "Failed to verify signature" },
        { status: 400 }
      );
    }
    
    // Additional validation
    if (data.motivation.length > 500) {
      return NextResponse.json(
        { error: "Motivation must be under 500 characters" },
        { status: 400 }
      );
    }
    
    // Send to application server (which handles Discord and Telegram)
    const sent = await sendToApplicationServer(data);
    
    if (!sent) {
      // Log the application even if server is down
      console.error("Failed to send application to server:", data);
      
      return NextResponse.json(
        { error: "Failed to submit application. Please try again or contact support." },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: "Application submitted successfully!" },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Application API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}