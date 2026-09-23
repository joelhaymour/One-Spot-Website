import { COMPANY } from "@/content/hud";

/*
 * Everything the Marketing console shows. One fictional account with numbers that add up:
 * campaign leads sum to channel leads, cost per lead is always spend / leads, the blended figure
 * matches the Marketing tile on The Business ($38.20), and the story's +38% and −41% fall out of
 * the data rather than being typed next to it.
 */

/** [last hourly sync, after the sync that opens the story] */
export type Snapshot = readonly [number, number];

/** Spring Promotion, cost per lead, 28 days. Flat at about $42 for two weeks, then climbing to $58.10 (+38%). */
export const CPL_SPRING = [
  42.4, 41.8, 42.6, 42.0, 41.6, 42.3, 42.8, 41.9, 42.2, 42.5, 41.7, 42.0, 42.4, 42.1, 43.0, 43.9, 44.6, 45.9, 46.8, 48.1, 49.0,
  50.6, 51.9, 53.0, 54.6, 55.7, 57.0, 58.1,
];

/** All campaigns, cost per lead, 28 days. Down 12% on the month, flattening as Spring Promotion drags on it. */
export const CPL_BLENDED = [
  43.4, 43.1, 43.3, 42.8, 42.6, 42.7, 42.2, 41.9, 42.0, 41.5, 41.2, 41.3, 40.8, 40.5, 40.4, 40.0, 39.8, 39.9, 39.5, 39.2, 39.3,
  38.9, 38.8, 38.6, 38.5, 38.4, 38.3, 38.2,
];

/** Index of "two weeks ago" in the 28-day series. */
export const SLIP_FROM = 13;

export interface Campaign {
  id: string;
  name: string;
  status: string;
  spend: Snapshot;
  leads: Snapshot;
  /** Cost per lead, change over 14 days. */
  delta: string;
  trend: number[];
}

export const CAMPAIGNS: Campaign[] = [
  { id: "spring", name: "Spring Promotion", status: "Live", spend: [6342, 6391], leads: [109, 110], delta: "+38%", trend: CPL_SPRING.slice(SLIP_FROM) },
  {
    id: "new-customer",
    name: "New Customer Offer",
    status: "Live",
    spend: [4931, 4970],
    leads: [141, 142],
    delta: "−6%",
    trend: [37.2, 36.9, 37.0, 36.4, 36.6, 36.1, 35.9, 36.0, 35.6, 35.4, 35.5, 35.2, 35.1, 35.0],
  },
  {
    id: "local-search",
    name: "Local Search",
    status: "Live",
    spend: [3428, 3456],
    leads: [95, 96],
    delta: "−3%",
    trend: [37.1, 36.8, 37.0, 36.7, 36.9, 36.5, 36.6, 36.3, 36.4, 36.2, 36.1, 36.2, 36.0, 36.0],
  },
  {
    id: "refer",
    name: "Refer a Friend",
    status: "Always on",
    spend: [1480, 1480],
    leads: [61, 61],
    delta: "−9%",
    trend: [26.7, 26.2, 26.4, 25.8, 25.9, 25.5, 25.1, 25.3, 24.9, 24.7, 24.8, 24.5, 24.3, 24.26],
  },
  {
    id: "win-back",
    name: "Win-back Email",
    status: "Always on",
    spend: [626, 626],
    leads: [33, 34],
    delta: "+2%",
    trend: [18.0, 18.3, 17.9, 18.2, 18.1, 18.4, 18.0, 18.3, 18.2, 18.5, 18.3, 18.4, 18.3, 18.41],
  },
];

/** Same budget, 41% lower cost per lead: 6,391 / 186 = $34.36 against $58.10. */
export const SPRING_WON_LEADS = 186;
export const SPRING_WON_TREND = [58.1, 53.0, 46.9, 41.2, 38.4, 36.3, 35.1, 34.36];

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

export const TOTALS = ([0, 1] as const).map((i) => ({
  spend: sum(CAMPAIGNS.map((c) => c.spend[i])),
  leads: sum(CAMPAIGNS.map((c) => c.leads[i])),
}));

export const CHANNELS: { name: string; leads: Snapshot }[] = [
  { name: "Search ads", leads: [147, 148] },
  { name: "Social ads", leads: [119, 121] },
  { name: "Email", leads: [52, 52] },
  { name: "Website", leads: [63, 64] },
  { name: "Local listings", leads: [37, 37] },
  { name: "Referrals", leads: [21, 21] },
];

/** Where the winning variation's extra leads came from: the three launch channels. Sums to 186 − 110 = 76. */
export const WON_CHANNEL_LEADS = [31, 33, 12, 0, 0, 0];

export type VariationId = "A" | "B" | "C" | "D";
export const WINNER: VariationId = "C";
/** Cost per lead of the creative being replaced. */
export const BASELINE_CPL = 58.1;
/** Data index of "day 3" in a variation's series. */
export const DAY_3 = 2;

export interface Variation {
  id: VariationId;
  /** Cost per lead, day 1 to day 7. */
  cpl: number[];
  /** Budget share in %: [at launch, day 3, day 7]. */
  share: readonly [number, number, number];
}

export const VARIATIONS: Variation[] = [
  { id: "A", cpl: [55.2, 52.6, 50.6, 50.2, 49.8, 50.0, 49.6], share: [25, 20, 0] },
  { id: "B", cpl: [56.4, 55.0, 54.0, 54.5, 54.9, 54.4, 54.6], share: [25, 15, 0] },
  { id: "C", cpl: [53.0, 46.9, 41.2, 38.4, 36.3, 35.1, 34.36], share: [25, 50, 100] },
  { id: "D", cpl: [57.8, 57.2, 57.0, 57.5, 57.9, 58.6, 58.4], share: [25, 15, 0] },
];

/* Diagnosis. Delivery figures for the whole account, then for Spring Promotion alone. */
export const DELIVERY = {
  frequency: [2.8, 6.4],
  clickThrough: [1.9, 0.8],
  reachK: [48.2, 18.4],
} as const;

/** 28 days, indexed to 100 at the start, so "falling" and "flat" are comparable at a glance. */
export const CTR_ALL = [100, 101, 99, 100, 102, 100, 99, 101, 100, 98, 99, 100, 99, 98, 99, 100, 98, 99, 98, 97, 98, 99, 97, 98, 97, 98, 97, 97];
export const CTR_SPRING = [100, 99, 97, 96, 94, 93, 90, 89, 86, 85, 82, 80, 78, 75, 73, 71, 68, 66, 63, 61, 58, 56, 53, 51, 48, 46, 44, 42];
export const REACH_ALL = [100, 102, 99, 101, 103, 100, 98, 101, 102, 100, 99, 101, 100, 102, 101, 99, 100, 102, 101, 100, 99, 101, 102, 100, 101, 99, 100, 101];
export const REACH_SPRING = [100, 101, 100, 99, 100, 101, 100, 100, 99, 100, 101, 100, 99, 100, 100, 101, 100, 99, 100, 100, 101, 100, 100, 99, 100, 101, 100, 100];

export const CHECKS: { label: string; rest: string; finding: string; flagged?: boolean }[] = [
  { label: "Audience", rest: "5 segments, stable", finding: "Same as two weeks ago" },
  { label: "Offer", rest: "3 live offers", finding: "Same as two weeks ago" },
  { label: "Creative", rest: "14 ads live", finding: "Live 41 days. Seen 6.4 times per person.", flagged: true },
];

/* Schedule. The week after the one on The Business (Tue 21). */
export const WEEK = ["Mon 27", "Tue 28", "Wed 29", "Thu 30", "Fri 31", "Sat 1", "Sun 2"];
export const LAUNCH_CHANNELS = [
  { name: "Search ads", time: "07:30" },
  { name: "Social ads", time: "19:00" },
  { name: "Email", time: "12:15" },
];

export interface Slot {
  channel: number;
  day: number;
  variation: VariationId;
  /** Position in the fill sequence: the agent queues the week left to right. */
  order: number;
}

// Each channel rotates through all four variations, offset by one, so every variation gets equal exposure.
const ROTATION: { channel: number; firstDay: number; sequence: VariationId[] }[] = [
  { channel: 0, firstDay: 0, sequence: ["A", "B", "C", "D"] },
  { channel: 1, firstDay: 0, sequence: ["B", "C", "D", "A"] },
  { channel: 2, firstDay: 1, sequence: ["A", "B", "C", "D"] },
];

export const SLOTS: Slot[] = ROTATION.flatMap((r) => r.sequence.map((variation, i) => ({ channel: r.channel, day: r.firstDay + i, variation })))
  .sort((a, b) => a.day - b.day || a.channel - b.channel)
  .map((slot, order) => ({ ...slot, order }));

/** Share of replies by hour, 06:00 to 23:00. Three peaks: before work, lunch, evening. */
export const RESPONSE_BY_HOUR = [22, 64, 48, 30, 26, 34, 58, 41, 28, 24, 27, 33, 46, 70, 61, 40, 24, 14];
export const FIRST_HOUR = 6;
export const PEAK_HOURS = [7, 12, 19];

/* Competitor watch. */
export interface Competitor {
  name: string;
  offer: string;
  /** Days since anything last changed. */
  quietFor: string;
  change?: { kind: "offer"; to: string; when: string } | { kind: "bidding"; detail: string; when: string };
}

export const COMPETITORS: Competitor[] = [
  { name: "Northgate Group", offer: "10% off for new customers", quietFor: "34 days", change: { kind: "offer", to: "25% off for new customers", when: "3 days ago" } },
  { name: "Harbour Lane", offer: "Free consultation", quietFor: "61 days" },
  { name: "Alder & Finch", offer: "Price match on request", quietFor: "48 days", change: { kind: "offer", to: "Beats any quote by 10%", when: "9 days ago" } },
  { name: "Kestrel Works", offer: "No current offer", quietFor: "27 days", change: { kind: "bidding", detail: `Ads on searches for "${COMPANY.name}"`, when: "This week" } },
  { name: "Fieldhouse", offer: "Bundle and save 15%", quietFor: "40 days", change: { kind: "offer", to: "Seasonal sale: 20% off", when: "16 days ago" } },
];

/* Creative. */
export const IN_MARKET = {
  campaign: "Spring Promotion",
  angle: "Seasonal discount",
  age: "Live 41 days",
  ads: [
    { id: "Ad 1", format: "Image", headline: "Spring savings: 20% off.", clickThrough: "0.8%" },
    { id: "Ad 2", format: "Image", headline: "20% off this month only.", clickThrough: "0.7%" },
    { id: "Ad 3", format: "Video 15 s", headline: "Save 20% this spring.", clickThrough: "0.9%" },
    { id: "Ad 4", format: "Text only", headline: "Spring offer ends soon.", clickThrough: "0.8%" },
  ],
};

export const CONCEPT = {
  line: "Lead with the guarantee, not the discount.",
  why: "3 competitors lead with a discount. None with a guarantee.",
};

export const BRIEFS: { id: VariationId; headline: string; format: string; audience: string }[] = [
  { id: "A", headline: "Guaranteed. In writing.", format: "Image", audience: "Past inquirers" },
  { id: "B", headline: "Done right. Or redone.", format: "Video 15 s", audience: "Similar to best customers" },
  { id: "C", headline: "Not happy? Don't pay.", format: "Testimonial", audience: "New in your area" },
  { id: "D", headline: "No small print.", format: "Text only", audience: "Lapsed customers" },
];
