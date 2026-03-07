// Cookie + localStorage based watchlist system
// Works without auth — migrates to user accounts when auth is added
//
// Storage strategy:
// - localStorage: primary store (client-side)
// - cookie "sp_watchlist": synced for SSR access (comma-separated tickers)

const STORAGE_KEY = "sp_watchlist";
const COOKIE_NAME = "sp_watchlist";
const MAX_FREE = 15;

function isClient(): boolean {
  return typeof window !== "undefined";
}

function readFromStorage(): string[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeToStorage(tickers: string[]) {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickers));
  // Sync to cookie for SSR (30 day expiry)
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${tickers.join(",")};path=/;expires=${expires};SameSite=Lax`;
}

export function getWatchlist(): string[] {
  return readFromStorage();
}

export function addToWatchlist(ticker: string): { success: boolean; reason?: string } {
  const current = readFromStorage();
  const upper = ticker.toUpperCase();
  if (current.includes(upper)) {
    return { success: false, reason: "already_added" };
  }
  if (current.length >= MAX_FREE) {
    return { success: false, reason: "limit_reached" };
  }
  const updated = [upper, ...current];
  writeToStorage(updated);
  return { success: true };
}

export function removeFromWatchlist(ticker: string): boolean {
  const current = readFromStorage();
  const upper = ticker.toUpperCase();
  const updated = current.filter((t) => t !== upper);
  if (updated.length === current.length) return false;
  writeToStorage(updated);
  return true;
}

export function isInWatchlist(ticker: string): boolean {
  return readFromStorage().includes(ticker.toUpperCase());
}

export function getWatchlistCount(): number {
  return readFromStorage().length;
}

// Read watchlist from cookie (for server-side use)
export function getWatchlistFromCookie(cookieHeader: string): string[] {
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]*)`));
  if (!match || !match[1]) return [];
  return match[1].split(",").filter(Boolean);
}

export const WATCHLIST_MAX_FREE = MAX_FREE;
