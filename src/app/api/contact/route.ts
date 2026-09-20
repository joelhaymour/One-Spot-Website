import { MAX_BODY_BYTES, readContact, validateContact, type ContactResponse, type ContactValues } from "@/components/cta/validate";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const OUTBOUND_TIMEOUT_MS = 8000;

// Naive by design: per server instance, forgotten on restart. It stops a stuck script or a bored
// visitor, not a distributed attack; put a real limiter at the edge if that ever matters.
const hits = new Map<string, number[]>();

const json = (body: ContactResponse, status: number, headers?: HeadersInit) => Response.json(body, { status, headers });

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Seconds until the caller may try again, or 0 when the request is allowed (and counted). */
function rateLimit(key: string, now: number): number {
  if (hits.size > 2000) {
    for (const [k, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return Math.max(1, Math.ceil((recent[0] + WINDOW_MS - now) / 1000));
  }
  recent.push(now);
  hits.set(key, recent);
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
      subject: `Map my company: ${oneLine(values.name)}, ${oneLine(values.company)}`.slice(0, 160),
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

/** Try each configured channel in order; the first that accepts the enquiry wins. */
async function deliver(values: ContactValues): Promise<"sent" | "failed" | "unconfigured"> {
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_WEBHOOK_URL } = process.env;
  const channels: (() => Promise<boolean>)[] = [];
  if (RESEND_API_KEY && CONTACT_TO_EMAIL) channels.push(() => sendWithResend(values, RESEND_API_KEY, CONTACT_TO_EMAIL));
  if (CONTACT_WEBHOOK_URL) channels.push(() => sendToWebhook(values, CONTACT_WEBHOOK_URL));
  if (channels.length === 0) return "unconfigured";

  for (const send of channels) {
    try {
      if (await send()) return "sent";
    } catch (error) {
      // Error names only (timeout, network). Never the enquiry itself.
      console.error(`[contact] Delivery attempt threw: ${error instanceof Error ? error.name : "unknown"}`);
    }
  }
  return "failed";
}

export async function POST(request: Request): Promise<Response> {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return json({ ok: false, error: "Send JSON." }, 415);
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
  console.error("[contact] No delivery channel configured. Set RESEND_API_KEY + CONTACT_TO_EMAIL or CONTACT_WEBHOOK_URL.");
  return json({ ok: false, error: "Contact delivery is not configured." }, 503);
}
