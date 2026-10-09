import { readPass } from "@/lib/proposal-pass";

const OUTBOUND_TIMEOUT_MS = 8000;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

const json = (body: Record<string, unknown>, status: number) => Response.json(body, { status });
const firstName = (name: string) => name.trim().split(/\s+/)[0] || "there";

/** Per server instance, like the contact form's: stops a stuck script, not a determined one. */
function limited(request: Request) {
  const key = request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  hits.set(key, [...recent, now]);
  if (hits.size > 2000) hits.delete(hits.keys().next().value!);
  return false;
}

async function emailLink(to: string, name: string, url: string): Promise<boolean> {
  const { RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL } = process.env;
  if (!RESEND_API_KEY) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL || "One Spot <onboarding@resend.dev>",
      to: [to],
      ...(CONTACT_TO_EMAIL ? { reply_to: CONTACT_TO_EMAIL } : {}),
      subject: "Your proposal questions from One Spot",
      text: [
        `Hi ${firstName(name)},`,
        "",
        "Thanks for reaching out to One Spot. Here are your 10 quick questions (about 5 minutes):",
        url,
        "",
        "Once you send them back, we'll email you a tailored proposal by tomorrow. Rough answers are fine, and your answers save as you go, so you can come back to this link anytime.",
        "",
        "Joel",
        "One Spot",
      ].join("\n"),
    }),
    signal: AbortSignal.timeout(OUTBOUND_TIMEOUT_MS),
  });
  if (!res.ok) console.error(`[proposal] Resend responded ${res.status}`);
  return res.ok;
}

/**
 * "Want a proposal by tomorrow?" after the enquiry: the HUD makes their project questions (and notes the
 * promise), we email them the link, and the page opens it. Only someone holding the pass from their own
 * enquiry can ask.
 */
export async function POST(request: Request): Promise<Response> {
  const type = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (type !== "application/json") return json({ ok: false, error: "Send JSON." }, 415);
  if (request.headers.get("sec-fetch-site") === "cross-site") return json({ ok: false, error: "Not allowed." }, 403);
  const origin = request.headers.get("origin");
  if (origin) {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    let same = false;
    try {
      same = new URL(origin).host === host;
    } catch {
      same = false;
    }
    if (!same) return json({ ok: false, error: "Not allowed." }, 403);
  }
  if (limited(request)) return json({ ok: false, error: "Too many requests. Try again in a few minutes." }, 429);

  const { HUD_LEADS_URL, HUD_LEADS_SECRET } = process.env;
  if (!HUD_LEADS_URL || !HUD_LEADS_SECRET) return json({ ok: false, error: "Not available." }, 503);
  const body = (await request.json().catch(() => null)) as { pass?: unknown } | null;
  const pass = readPass(body?.pass, HUD_LEADS_SECRET);
  if (!pass) return json({ ok: false, error: "That link has expired. Please send the form again." }, 400);

  try {
    const res = await fetch(`${HUD_LEADS_URL.replace(/\/$/, "")}/request`, {
      method: "POST",
      headers: { Authorization: `Bearer ${HUD_LEADS_SECRET}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: pass.email, name: pass.name }),
      signal: AbortSignal.timeout(OUTBOUND_TIMEOUT_MS),
    });
    const hud = (await res.json().catch(() => null)) as { ok?: boolean; url?: string } | null;
    if (!res.ok || !hud?.ok || !hud.url) {
      console.error(`[proposal] HUD responded ${res.status}`);
      return json({ ok: false, error: "Couldn't open the questions." }, 502);
    }
    const emailed = await emailLink(pass.email, pass.name, hud.url).catch((error) => {
      console.error(`[proposal] Email threw: ${error instanceof Error ? error.name : "unknown"}`);
      return false;
    });
    return json({ ok: true, url: hud.url, emailed }, 200);
  } catch (error) {
    console.error(`[proposal] HUD request threw: ${error instanceof Error ? error.name : "unknown"}`);
    return json({ ok: false, error: "Couldn't open the questions." }, 502);
  }
}
