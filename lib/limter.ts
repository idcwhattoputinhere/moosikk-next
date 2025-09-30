const WINDOW = 10_000; // 10s
const MAX_REQ = 20;
const buckets = new Map<string, number[]>();

export function rateLimit(ip: string) {
  const now = Date.now();
  const arr = buckets.get(ip) ?? [];
  while (arr.length && now - arr[0] > WINDOW) arr.shift();
  if (arr.length >= MAX_REQ) return false;
  arr.push(now);
  buckets.set(ip, arr);
  return true;
}
