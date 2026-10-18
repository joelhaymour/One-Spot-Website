"use client";

/**
 * Carries a few words from elsewhere on the page into the contact form's "What would you like help with?"
 * box (the calculator's "Talk these numbers through"). The form only takes it while that box is empty,
 * so nothing a visitor typed is ever replaced.
 */
const KEY = "os-prefill";
const EVENT = "os:prefill";

export function setPrefill(text: string) {
  try {
    sessionStorage.setItem(KEY, text);
  } catch {
    // private mode: the event below still carries it
  }
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: text }));
}

/** Calls back with any waiting text now, and again whenever new text arrives. Returns the unsubscribe. */
export function onPrefill(fn: (text: string) => void): () => void {
  try {
    const waiting = sessionStorage.getItem(KEY);
    if (waiting) fn(waiting);
  } catch {
    // nothing stored
  }
  const handler = (e: Event) => fn((e as CustomEvent<string>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

export function clearPrefill() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // nothing stored
  }
}
