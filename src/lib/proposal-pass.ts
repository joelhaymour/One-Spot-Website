import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * A short-lived, signed pass handed back after someone sends the enquiry form. It lets that same person
 * ask for "a proposal by tomorrow" (their project questions) without anyone else being able to request
 * forms for arbitrary addresses. Signed with HUD_LEADS_SECRET; good for two days.
 */
const MAX_AGE_MS = 2 * 24 * 60 * 60 * 1000;

type Pass = { email: string; name: string; at: number };

const b64 = (v: string | Buffer) => Buffer.from(v).toString("base64url");
const sign = (body: string, secret: string) => createHmac("sha256", secret).update(body).digest("base64url");

export function makePass(email: string, name: string, secret: string): string {
  const body = b64(JSON.stringify({ email, name, at: Date.now() } satisfies Pass));
  return `${body}.${sign(body, secret)}`;
}

export function readPass(pass: unknown, secret: string): Pass | null {
  if (typeof pass !== "string" || pass.length > 2000) return null;
  const [body, sig] = pass.split(".");
  if (!body || !sig) return null;
  const want = Buffer.from(sign(body, secret));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Pass;
    if (typeof p.email !== "string" || typeof p.at !== "number" || Date.now() - p.at > MAX_AGE_MS) return null;
    return { email: p.email, name: typeof p.name === "string" ? p.name : "", at: p.at };
  } catch {
    return null;
  }
}
