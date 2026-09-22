/**
 * Cinematic slots. Each one is an OPTIONAL enhancement layer for generated footage
 * (see docs/HIGGSFIELD_SHOTS.md). A slot set to `null` renders nothing and the scene's
 * real-time or CSS fallback carries it, which is the state the site ships in.
 *
 * To install a clip, put the encoded files in /public/media and describe them here:
 *
 *   "hero-room": {
 *     poster: "/media/hero-room.jpg",
 *     sources: [
 *       { src: "/media/hero-room.hevc.mp4", type: 'video/mp4; codecs="hvc1"' },
 *       { src: "/media/hero-room.av1.mp4",  type: 'video/mp4; codecs="av01.0.05M.08"' },
 *       { src: "/media/hero-room.h264.mp4", type: "video/mp4" },
 *     ],
 *   },
 */

export interface CinematicSource {
  src: string;
  type: string;
}

export interface CinematicAsset {
  poster: string;
  sources: CinematicSource[];
}

export type CinematicSlotId =
  | "hero-room"
  | "business-room"
  | "network-wide"
  | "arrival"
  | "before"
  | "after"
  | "cta-macro"
  | `dept-${string}-room`;

export const MEDIA: Partial<Record<CinematicSlotId, CinematicAsset | null>> = {
  "hero-room": null,
  "business-room": null,
  "network-wide": null,
  arrival: null,
  before: null,
  after: null,
  "cta-macro": null,
};
