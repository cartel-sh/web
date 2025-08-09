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

function formatTelegramMessage(data: ApplicationData, ip: string): string {
  const timestamp = new Date().toISOString();
  
  let message = `🚀 <b>New Cartel Application</b>\n\n`;
  message += `👛 <b>Wallet:</b> <code>${escapeHtml(data.walletAddress)}</code>\n`;
  
  if (data.ensName) {
    message += `📛 <b>ENS:</b> ${escapeHtml(data.ensName)}\n`;
  }
  
  if (data.github && data.github.trim()) {
    const githubUsername = cleanGitHubUsername(data.github);
    message += `🔗 <b>GitHub:</b> <a href="https://github.com/${githubUsername}">@${githubUsername}</a>\n`;
  }
  
  message += `\n<b>Social Profiles:</b>\n`;
  if (data.farcaster && data.farcaster.trim()) {
    message += `🟣 <b>Farcaster:</b> ${escapeHtml(data.farcaster)}\n`;
  }
  if (data.lens && data.lens.trim()) {
    message += `🌿 <b>Lens:</b> ${escapeHtml(data.lens)}\n`;
  }
  if (data.twitter && data.twitter.trim()) {
    message += `🐦 <b>Twitter:</b> ${escapeHtml(data.twitter)}\n`;
  }
  
  message += `\n🎯 <b>What excites them:</b>\n${escapeHtml(data.excitement)}\n`;
  message += `\n💭 <b>Why they're a good fit:</b>\n${escapeHtml(data.motivation)}\n`;
  message += `\n✅ <b>Signature Verified:</b> Yes\n`;
  message += `⏰ <b>Submitted:</b> ${timestamp}\n`;
  message += `📍 <b>IP:</b> ${ip}`;
  
  return message;
}

function cleanGitHubUsername(github: string): string {
  // Extract username from GitHub URL or return as-is if already a username
  if (github.startsWith("https://github.com/")) {
    return github.replace("https://github.com/", "").split("/")[0];
  }
  return github;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

async function sendToTelegram(message: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  
  if (!botToken || !channelId) {
    console.error("Telegram configuration missing");
    return false;
  }
  
  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  try {
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: channelId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error("Telegram API error:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to send to Telegram:", error);
    return false;
  }
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = parseInt(process.env.APPLICATION_RATE_LIMIT || "3");
  const windowMs = 60 * 60 * 1000; // 1 hour
  
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
}, 60 * 60 * 1000); // Clean up every hour

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
    
    // Format message for Telegram
    const telegramMessage = formatTelegramMessage(data, ip);
    
    // Send to Telegram
    const sent = await sendToTelegram(telegramMessage);
    
    if (!sent) {
      // Log the application even if Telegram fails
      console.error("Failed to send application to Telegram:", data);
      
      // You might want to store in a database or send email as fallback
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