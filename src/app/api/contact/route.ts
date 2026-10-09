import { MAX_BODY_BYTES, readContact, validateContact, type ContactResponse, type ContactValues } from "@/components/sections/validate";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const OUTBOUND_TIMEOUT_MS = 8000;

// Naive by design: per server instance, forgotten on restart. It stops a stuck script or a bored
// visitor, not a distributed attack; put a real limiter at the edge if that ever matters.
const hits = new Map<string, number[]>();

const json = (body: ContactResponse, status: number, headers?: HeadersInit) => Response.json(body, { status, headers });

const UNKNOWN = "unknown";
const MAX_UNKNOWN_PER_WINDOW = 40;
const MAX_KEYS = 2000;

/**
 * Prefer headers a platform sets itself. The left-most X-Forwarded-For hop is whatever the caller
 * typed, so when that header is all we have, trust the right-most hop (the one our own proxy added).
 */
function clientKey(request: Request): string {
  const h = request.headers;
  const direct = h.get("x-vercel-forwarded-for") ?? h.get("cf-connecting-ip") ?? h.get("fly-client-ip") ?? h.get("x-real-ip");
  if (direct?.trim()) return direct.split(",")[0].trim();
  const hops = h.get("x-forwarded-for")?.split(",").map((v) => v.trim()).filter(Boolean);
  return hops?.length ? hops[hops.length - 1] : UNKNOWN;
}

/** Seconds until the caller may try again, or 0 when the request is allowed (and counted). */
function rateLimit(key: string, now: number): number {
  // Callers we cannot tell apart share one bucket, so it gets a site-wide ceiling, not a personal one.
  const limit = key === UNKNOWN ? MAX_UNKNOWN_PER_WINDOW : MAX_PER_WINDOW;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return Math.max(1, Math.ceil((recent[0] + WINDOW_MS - now) / 1000));
  }
  recent.push(now);
  // Re-insert so the map stays ordered by last use, then evict the oldest: O(1), bounded memory.
  hits.delete(key);
  hits.set(key, recent);
  if (hits.size > MAX_KEYS) {
    const oldest = hits.keys().next().value;
    if (oldest !== undefined) hits.delete(oldest);
  }
  return 0;
}

/** Read the body without ever buffering more than the cap. null = too large. */
async function readCapped(request: Request, cap: number): Promise<string | null> {
  const reader = request.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > cap) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

const oneLine = (s: string) => s.replace(/[\r\n\t]+/g, " ").trim();

async function sendWithResend(values: ContactValues, apiKey: string, to: string): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "One Spot <onboarding@resend.dev>",
      to: [to],
      reply_to: values.email,
      subject: `New enquiry: ${oneLine(values.name)}, ${oneLine(values.company)}`.slice(0, 160),
      text: [
        `Name: ${oneLine(values.name)}`,
        `Email: ${values.email}`,
        `Company, and what it does: ${oneLine(values.company)}`,
        "",
        "Where the day gets stuck:",
        values.stuck,
      ].join("\n"),
    }),
    signal: AbortSignal.timeout(OUTBOUND_TIMEOUT_MS),
  });
  if (!res.ok) console.error(`[contact] Resend responded ${res.status}`);
  return res.ok;
}

async function sendToWebhook(values: ContactValues, url: string): Promise<boolean> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: "one-spot-contact", receivedAt: new Date().toISOString(), ...values }),
    signal: AbortSignal.timeout(OUTBOUND_TIMEOUT_MS),
  });
  if (!res.ok) console.error(`[contact] Webhook responded ${res.status}`);
  return res.ok;
}

/** The One Spot HUD: every enquiry becomes (or updates) an account there, with a to-do to reply. */
async function sendToHud(values: ContactValues, url: string, secret: string): Promise<boolean> {
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      company: oneLine(values.company),
      contact: { name: oneLine(values.name), email: values.email },
      message: values.stuck,
      source: "Website enquiry form",
    }),
    signal: AbortSignal.timeout(OUTBOUND_TIMEOUT_MS),
  });
  if (!res.ok) console.error(`[contact] HUD responded ${res.status}`);
  return res.ok;
}

/** Error names only (timeout, network). Never the enquiry itself. */
async function attempt(send: () => Promise<boolean>): Promise<boolean> {
  try {
    return await send();
  } catch (error) {
    console.error(`[contact] Delivery attempt threw: ${error instanceof Error ? error.name : "unknown"}`);
    return false;
  }
}

/**
 * The email (or, failing that, the webhook) and the HUD, at the same time. The enquiry counts as
 * delivered if either reached us, so a HUD outage never costs an email and vice versa.
 */
async function deliver(values: ContactValues): Promise<"sent" | "failed" | "unconfigured"> {
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_WEBHOOK_URL, HUD_LEADS_URL, HUD_LEADS_SECRET } = process.env;
  const channels: (() => Promise<boolean>)[] = [];
  if (RESEND_API_KEY && CONTACT_TO_EMAIL) channels.push(() => sendWithResend(values, RESEND_API_KEY, CONTACT_TO_EMAIL));
  if (CONTACT_WEBHOOK_URL) channels.push(() => sendToWebhook(values, CONTACT_WEBHOOK_URL));
  const hud = HUD_LEADS_URL && HUD_LEADS_SECRET ? () => sendToHud(values, HUD_LEADS_URL, HUD_LEADS_SECRET) : null;
  if (channels.length === 0 && !hud) return "unconfigured";

  // Try each channel in order; the first that accepts the enquiry wins.
  const notify = async () => {
    for (const send of channels) if (await attempt(send)) return true;
    return false;
  };
  const [notified, saved] = await Promise.all([notify(), hud ? attempt(hud) : Promise.resolve(false)]);
  return notified || saved ? "sent" : "failed";
}

export async function POST(request: Request): Promise<Response> {
  // Compare the MIME essence exactly. A substring test would accept "text/plain; application/json",
  // which is CORS-safelisted and lets any third-party page post here without a preflight.
  const type = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (type !== "application/json") return json({ ok: false, error: "Send JSON." }, 415);

  // This form is only ever submitted by this site.
  if (request.headers.get("sec-fetch-site") === "cross-site") return json({ ok: false, error: "Not allowed." }, 403);
  const origin = request.headers.get("origin");
  if (origin) {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    let sameHost = false;
    try {
      sameHost = new URL(origin).host === host;
    } catch {
      sameHost = false;
    }
    if (!sameHost) return json({ ok: false, error: "Not allowed." }, 403);
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return json({ ok: false, error: "That message is too long." }, 413);
  }

  const retryAfter = rateLimit(clientKey(request), Date.now());
  if (retryAfter > 0) {
    return json({ ok: false, error: "Too many messages from this connection. Try again in a few minutes." }, 429, {
      "Retry-After": String(retryAfter),
    });
  }

  const raw = await readCapped(request, MAX_BODY_BYTES).catch(() => "");
  if (raw === null) return json({ ok: false, error: "That message is too long." }, 413);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "The request body is not valid JSON." }, 400);
  }

  const contact = readContact(parsed);
  if (!contact) return json({ ok: false, error: "The request body has the wrong shape." }, 400);

  // A filled honeypot gets a convincing success and no delivery, so the script learns nothing.
  if (contact.honeypot) return json({ ok: true }, 200);

  const fields = validateContact(contact.values);
  if (Object.keys(fields).length > 0) return json({ ok: false, error: "Some fields need attention.", fields }, 422);

  const outcome = await deliver(contact.values);
  if (outcome === "sent") return json({ ok: true }, 200);
  if (outcome === "failed") return json({ ok: false, error: "The message could not be delivered." }, 502);

  if (process.env.NODE_ENV !== "production") {
    console.info("[contact] No delivery channel configured. Development only, logging the enquiry:", contact.values);
    return json({ ok: true }, 200);
  }
  // Production without a channel must fail loudly: the form shows its error instead of dropping an enquiry.
  console.error("[contact] No delivery channel configured. Set RESEND_API_KEY + CONTACT_TO_EMAIL, CONTACT_WEBHOOK_URL, or HUD_LEADS_URL + HUD_LEADS_SECRET.");
  return json({ ok: false, error: "Contact delivery is not configured." }, 503);
}
