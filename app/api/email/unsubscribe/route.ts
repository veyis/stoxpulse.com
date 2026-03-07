import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Subscriber } from "../subscribe/route";

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");

async function getSubscribers(): Promise<Subscriber[]> {
  try {
    const data = await fs.readFile(SUBSCRIBERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveSubscribers(subscribers: Subscriber[]): Promise<void> {
  await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  if (!email || !token) {
    return new NextResponse(
      buildHtmlPage(
        "Invalid Link",
        "This unsubscribe link is invalid or has expired.",
      ),
      {
        status: 400,
        headers: { "Content-Type": "text/html" },
      },
    );
  }

  const sanitized = email.trim().toLowerCase();
  const subscribers = await getSubscribers();
  const index = subscribers.findIndex(
    (s) => s.email === sanitized && s.token === token,
  );

  if (index === -1) {
    return new NextResponse(
      buildHtmlPage(
        "Not Found",
        "This email was not found in our subscriber list, or the link has expired.",
      ),
      {
        status: 404,
        headers: { "Content-Type": "text/html" },
      },
    );
  }

  subscribers.splice(index, 1);
  await saveSubscribers(subscribers);

  return new NextResponse(
    buildHtmlPage(
      "Unsubscribed",
      `You have been successfully unsubscribed. You will no longer receive emails from StoxPulse at <strong>${sanitized}</strong>.`,
    ),
    {
      status: 200,
      headers: { "Content-Type": "text/html" },
    },
  );
}

function buildHtmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — StoxPulse</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background-color: #0a0a0a;
      color: #fafafa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 16px;
    }
    .card {
      max-width: 480px;
      text-align: center;
      background: #141414;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      padding: 48px 32px;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #22c55e;
      margin-bottom: 24px;
      letter-spacing: -0.5px;
    }
    h1 {
      font-size: 22px;
      margin: 0 0 12px;
      color: #fafafa;
    }
    p {
      font-size: 15px;
      color: #a1a1aa;
      line-height: 1.6;
      margin: 0 0 24px;
    }
    a {
      color: #22c55e;
      text-decoration: none;
      font-weight: 500;
    }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">StoxPulse</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="https://stoxpulse.com">Back to StoxPulse</a>
  </div>
</body>
</html>`;
}
