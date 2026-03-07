import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");

export interface Subscriber {
  email: string;
  preferences: {
    daily: boolean;
    earnings: boolean;
    filings: boolean;
  };
  subscribedAt: string;
  token: string;
}

async function getSubscribers(): Promise<Subscriber[]> {
  try {
    const data = await fs.readFile(SUBSCRIBERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveSubscribers(subscribers: Subscriber[]): Promise<void> {
  const dir = path.dirname(SUBSCRIBERS_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
}

function generateToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email;
    const preferences = body?.preferences;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    const sanitized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    const validPreferences = {
      daily: preferences?.daily !== false,
      earnings: preferences?.earnings !== false,
      filings: preferences?.filings !== false,
    };

    const subscribers = await getSubscribers();
    const existingIndex = subscribers.findIndex((s) => s.email === sanitized);

    if (existingIndex >= 0) {
      // Update preferences for existing subscriber
      subscribers[existingIndex].preferences = validPreferences;
      await saveSubscribers(subscribers);
      return NextResponse.json({
        message: "Preferences updated",
        email: sanitized,
      });
    }

    const token = generateToken();
    subscribers.push({
      email: sanitized,
      preferences: validPreferences,
      subscribedAt: new Date().toISOString(),
      token,
    });

    await saveSubscribers(subscribers);

    return NextResponse.json(
      { message: "Subscribed successfully", email: sanitized },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
