"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { gsap, EASE } from "@/lib/gsap";
import { clamp, lerp } from "@/lib/math";
import { cn } from "@/lib/cn";

/**
 * VirtualDisplay — the "premium computer" every HUD and workstation lives in.
 *
 * Content is authored once at a fixed virtual resolution (px), then scaled to fit, so the
 * composition is identical on every screen. A camera can push into any region of the virtual
 * canvas: a gentle move on desktop, a full-frame move on phones where the whole UI would be
 * unreadably small. Camera moves are how the display explains what the agent is looking at.
 */

export interface FocusRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface VirtualDisplayHandle {
  /** Move the camera to a region of the virtual canvas. `null` returns to the full view. */
  focus: (rect: FocusRect | null, opts?: { strength?: number; duration?: number; immediate?: boolean }) => void;
  /** Bounding box, in client pixels, of a region of the virtual canvas as currently displayed. */
  rectOf: (rect: FocusRect) => DOMRect | null;
  screen: HTMLDivElement | null;
}

interface VirtualDisplayProps {
  width?: number;
  height?: number;
  children: ReactNode;
  /** Declarative camera target. Changing it animates the camera. */
  focus?: FocusRect | null;
  /** 0 = never move, 1 = focus region fills the screen. */
  focusStrength?: number;
  /** Slim status strip rendered inside the bezel, above the screen content. */
  className?: string;
  screenClassName?: string;
  style?: CSSProperties;
  /** Light the screen spills onto its surroundings. Defaults to the live accent. */
  glow?: boolean;
  label?: string;
}

export const VirtualDisplay = forwardRef<VirtualDisplayHandle, VirtualDisplayProps>(function VirtualDisplay(
  { width = 1280, height = 760, children, focus = null, focusStrength = 0.5, className, screenClassName, style, glow = true, label },
  ref,
) {
  const screen = useRef<HTMLDivElement>(null);
  const scaler = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const cam = useRef({ x: 0, y: 0, z: 1 });

  // JS fit is authoritative; the CSS trig expression below covers the frames before hydration.
  useLayoutEffect(() => {
    const el = screen.current;
    const target = scaler.current;
    if (!el || !target) return;
    const apply = () => target.style.setProperty("--vd-scale", String(el.clientWidth / width));
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  const resolve = (rect: FocusRect | null, strength: number) => {
    if (!rect || strength <= 0) return { x: 0, y: 0, z: 1 };
    const fit = Math.min(width / rect.w, height / rect.h) * 0.94;
    const z = lerp(1, Math.max(1, fit), clamp(strength));
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    // Keep the focus centre on the screen centre, without ever revealing past the canvas edge.
    const x = clamp(width / 2 - cx * z, width - width * z, 0);
    const y = clamp(height / 2 - cy * z, height - height * z, 0);
    return { x, y, z };
  };

  const moveTo = (rect: FocusRect | null, strength: number, duration: number, immediate: boolean) => {
    const el = camera.current;
    if (!el) return;
    const next = resolve(rect, strength);
    const write = () => {
      el.style.transform = `translate3d(${cam.current.x}px, ${cam.current.y}px, 0) scale(${cam.current.z})`;
    };
    gsap.killTweensOf(cam.current);
    if (immediate) {
      Object.assign(cam.current, next);
      write();
      return;
    }
    gsap.to(cam.current, { ...next, duration, ease: EASE.camera, onUpdate: write });
  };

  useImperativeHandle(ref, () => ({
    focus: (rect, opts) =>
      moveTo(rect, opts?.strength ?? focusStrength, opts?.duration ?? 1.2, opts?.immediate ?? false),
    rectOf: (rect) => {
      const el = camera.current;
      if (!el) return null;
      const box = el.getBoundingClientRect();
      const k = box.width / width;
      return new DOMRect(box.left + rect.x * k, box.top + rect.y * k, rect.w * k, rect.h * k);
    },
    get screen() {
      return screen.current;
    },
  }));

  const focusKey = focus ? `${focus.x},${focus.y},${focus.w},${focus.h}` : "full";
  const mounted = useRef(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    moveTo(focus, focusStrength, 1.2, reduce || !mounted.current);
    mounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey, focusStrength]);

  return (
    <div className={cn("relative", className)} style={style}>
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-[6%] -bottom-[14%] top-[30%] -z-10 opacity-70 blur-[70px]"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 60%, rgba(var(--accent-rgb), 0.16), rgba(var(--accent-rgb), 0.04) 55%, transparent 75%)",
          }}
        />
      )}

      {/* chassis: machined dark metal, one bright top edge */}
      <div
        className="relative rounded-[22px] p-[9px] md:p-[11px]"
        style={{
          background: "linear-gradient(180deg, #23272d 0%, #14171b 18%, #0c0e11 60%, #121519 100%)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.6), 0 60px 120px -40px rgba(0,0,0,0.95), 0 30px 60px -30px rgba(0,0,0,0.8)",
        }}
      >
        <div
          ref={screen}
          role="group"
          aria-label={label}
          className={cn("relative overflow-hidden rounded-[13px] bg-[#06070a]", screenClassName)}
          style={{
            aspectRatio: `${width} / ${height}`,
            containerType: "inline-size",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 80px rgba(0,0,0,0.65)",
          }}
        >
          <div
            ref={scaler}
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width,
              height,
              transform: `scale(var(--vd-scale, tan(atan2(100cqw, ${width}px))))`,
            }}
          >
            <div ref={camera} className="absolute inset-0 origin-top-left will-change-transform">
              {children}
            </div>
          </div>

          {/* glass: one soft diagonal reflection and a vignette, nothing more */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.012) 22%, transparent 38%), radial-gradient(120% 90% at 50% 40%, transparent 60%, rgba(0,0,0,0.42) 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
});
