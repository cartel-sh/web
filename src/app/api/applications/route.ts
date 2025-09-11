import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from 'viem';
import { cartel } from "@/lib/cartel-client";

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
  captchaToken: string;
}

async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    console.error("[CAPTCHA ERROR] Turnstile secret key not configured");
    return false;
  }
  
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    });
    
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("[CAPTCHA ERROR] Failed to verify Turnstile token");
    return false;
  }
}

async function createApplicationViaAPI(data: ApplicationData): Promise<{ success: boolean; applicationId?: string; applicationNumber?: number; error?: string }> {
  try {
    const result = await cartel.applications.create({
      messageId: "pending", // Will be updated after Discord posting
      walletAddress: data.walletAddress,
      ensName: data.ensName || null,
      github: data.github || null,
      farcaster: data.farcaster || null,
      lens: data.lens || null,
      twitter: data.twitter || null,
      excitement: data.excitement,
      motivation: data.motivation,
      signature: data.signature,
    });

    console.log(`[APPLICATION CREATED] Application #${result.applicationNumber} created with ID: ${result.id}`);

    return {
      success: true,
      applicationId: result.id,
      applicationNumber: result.applicationNumber
    };
  } catch (error: any) {
    console.error("[API ERROR] Failed to create application:", error);
    return {
      success: false,
      error: error?.message || "Failed to create application"
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: ApplicationData = await request.json();
    
    if (!data.walletAddress || !data.excitement?.trim() || 
        !data.motivation?.trim() || !data.signature || !data.message || !data.captchaToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const isCaptchaValid = await verifyTurnstileToken(data.captchaToken);
    if (!isCaptchaValid) {
      return NextResponse.json(
        { error: "Captcha verification failed. Please try again." },
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
    
    const result = await createApplicationViaAPI(data);
    
    if (!result.success) {
      console.error("[APPLICATION FAILED] Could not create application:", result.error);
      
      return NextResponse.json(
        { error: result.error || "Failed to submit application. Please try again or contact support." },
        { status: 500 }
      );
    }
    
    console.log(`[APPLICATION SUCCESS] Application #${result.applicationNumber} processed successfully`);
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Application submitted successfully!",
        applicationNumber: result.applicationNumber
      },
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