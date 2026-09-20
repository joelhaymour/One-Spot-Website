/**
 * The Operations console's week. Numbers agree with content/departments.ts: 128 active jobs across
 * 5 stages, stage 3 queue at 19, Thursday at 117%, Team B free for 11 hours on Wednesday, 2 jobs moved,
 * 3 people notified, item 2210 with 6 days of stock, 1.5 days idle between intake and scheduling.
 *
 * The arithmetic is kept honest so the panels agree with each other: three teams give 52 hours a day,
 * the two late bookings add 11 hours to Thursday (50 to 61 hours, 96% to 117%), and moving them fills
 * exactly the 11 hours Team B had free on Wednesday (35 to 46 hours, 67% to 88%).
 */

/** Where the shift is: before the jam, while Thursday is overbooked, after the two jobs have moved. */
export type Phase = 0 | 1 | 2;

export interface Job {
  id: string;
  customer: string;
  hours: number;
}

/** The two late bookings that overfill Thursday, and later move to Team B on Wednesday. */
export const MOVERS: [Job, Job] = [
  { id: "J-331", customer: "Marsh & Co.", hours: 6 },
  { id: "J-336", customer: "Pereira", hours: 5 },
];

export interface Stage {
  id: string;
  name: string;
  /** Jobs in the stage, by phase. Eight jobs leave scheduling for the stage 3 queue, so the total stays 128. */
  count: [number, number, number];
  /** Jobs in the stage that are waiting to start, by phase. */
  waiting: [number, number, number];
  jobs: Job[];
}

export const ACTIVE_JOBS = 128;

export const STAGES: Stage[] = [
  {
    id: "intake",
    name: "Intake",
    count: [17, 17, 17],
    waiting: [3, 3, 3],
    jobs: [
      { id: "J-338", customer: "Whitcombe", hours: 4 },
      { id: "J-337", customer: "Adeyemi & Co.", hours: 9 },
      { id: "J-335", customer: "Castell", hours: 6 },
    ],
  },
  {
    id: "scheduling",
    name: "Scheduling",
    count: [29, 21, 21],
    waiting: [6, 6, 6],
    jobs: [
      { id: "J-334", customer: "Novak", hours: 7 },
      { id: "J-333", customer: "Thorne Ltd", hours: 12 },
      { id: "J-332", customer: "Ibarra", hours: 5 },
      { id: "J-330", customer: "Lindqvist", hours: 8 },
      { id: "J-329", customer: "Hartley & Sons", hours: 10 },
    ],
  },
  {
    id: "progress",
    name: "In progress",
    count: [46, 54, 54],
    waiting: [11, 19, 15],
    jobs: [
      { id: "J-314", customer: "Okafor", hours: 8 },
      { id: "J-316", customer: "Brandt", hours: 8 },
      { id: "J-317", customer: "Silva & Reed", hours: 7 },
      { id: "J-318", customer: "Fenwick", hours: 6 },
    ],
  },
  {
    id: "review",
    name: "Review",
    count: [22, 22, 22],
    waiting: [4, 4, 4],
    jobs: [
      { id: "J-299", customer: "Aldana", hours: 5 },
      { id: "J-296", customer: "Mercer", hours: 11 },
      { id: "J-295", customer: "Quinn", hours: 6 },
      { id: "J-291", customer: "Rowe & Daughters", hours: 8 },
    ],
  },
  {
    id: "done",
    name: "Done",
    count: [14, 14, 14],
    waiting: [0, 0, 0],
    jobs: [
      { id: "J-290", customer: "Halloran", hours: 7 },
      { id: "J-288", customer: "Petrov", hours: 4 },
      { id: "J-287", customer: "Ashby", hours: 9 },
    ],
  },
];

/** Index of the stage that backs up ("stage 3"). */
export const JAM_STAGE = 2;

export const TEAMS = [
  { id: "A", label: "Team A", hours: 16 },
  { id: "B", label: "Team B", hours: 24 },
  { id: "C", label: "Team C", hours: 12 },
] as const;

export const DAY_CAPACITY = TEAMS.reduce((sum, t) => sum + t.hours, 0);

export interface Day {
  id: string;
  label: string;
  /** Booked hours, by phase. */
  booked: [number, number, number];
}

export const DAYS: Day[] = [
  { id: "mon", label: "Mon", booked: [49, 49, 49] },
  { id: "tue", label: "Tue", booked: [50, 50, 50] },
  { id: "wed", label: "Wed", booked: [35, 35, 46] },
  { id: "thu", label: "Thu", booked: [50, 61, 50] },
  { id: "fri", label: "Fri", booked: [49, 49, 49] },
];

export const WED = 2;
export const THU = 3;

export const percent = (hours: number) => Math.round((hours / DAY_CAPACITY) * 100);

/** The standing schedule: SCHEDULE[team][day] is that team's jobs for the day, as [job, hours]. */
export const SCHEDULE: [string, number][][][] = [
  [
    [["J-301", 8], ["J-304", 7]],
    [["J-304", 8], ["J-309", 8]],
    [["J-309", 6], ["J-312", 5]],
    [["J-314", 8], ["J-317", 7]],
    [["J-317", 8], ["J-320", 7]],
  ],
  [
    [["J-302", 12], ["J-306", 10]],
    [["J-302", 12], ["J-308", 11]],
    [["J-311", 13]],
    [["J-303", 12], ["J-316", 8], ["J-319", 4]],
    [["J-303", 12], ["J-322", 11]],
  ],
  [
    [["J-305", 7], ["J-307", 5]],
    [["J-307", 6], ["J-310", 5]],
    [["J-313", 6], ["J-315", 5]],
    [["J-318", 6], ["J-321", 5]],
    [["J-321", 6], ["J-323", 5]],
  ],
];

/** Where each late booking sits on Thursday, and where it lands in Team B's Wednesday. */
export const MOVES = [
  { job: MOVERS[0], from: { team: 0, slot: 2 }, to: { team: 1, slot: 1 } },
  { job: MOVERS[1], from: { team: 2, slot: 2 }, to: { team: 1, slot: 2 } },
] as const;

export const FREE_HOURS = 11;

/** What the agent checks before it moves anything. `rest` is the standing fact, `found` is this week's answer. */
export const CAPACITY_CHECKS = [
  { id: "people", label: "People", rest: "3 teams, 52 hours a day", found: "Team B is free Wednesday, 11 hours" },
  { id: "materials", label: "Materials", rest: "Checked for every job", found: "In stock for both jobs" },
  { id: "vendors", label: "Vendor lead times", rest: "4 to 9 days", found: "No delivery needed before Thursday" },
] as const;

export const NOTIFIED = [
  { name: "R. Okafor", role: "Team A" },
  { name: "L. Brandt", role: "Team B" },
  { name: "M. Silva", role: "Team C" },
] as const;

export interface StockItem {
  id: string;
  name: string;
  onHand: string;
  days: number;
}

export const STOCK: StockItem[] = [
  { id: "2204", name: "Disposable gloves, M", onHand: "1,240", days: 31 },
  { id: "2210", name: "Filter cartridges", onHand: "18", days: 6 },
  { id: "2216", name: "Cleaning solution, 5 L", onHand: "42", days: 19 },
  { id: "2225", name: "Label rolls", onHand: "96", days: 27 },
];

export const LOW_ITEM = "2210";
/** Scale of the days-of-stock bars. */
export const STOCK_SCALE = 35;

export interface Quote {
  vendor: string;
  price: string;
  lead: string;
  best?: boolean;
}

const QUOTES: Quote[] = [
  { vendor: "Calder Supply", price: "$412.00", lead: "3 days" },
  { vendor: "Brightwell Trade", price: "$389.00", lead: "4 days", best: true },
  { vendor: "Penrose & Hale", price: "$431.50", lead: "2 days" },
];

export const PURCHASE_ORDER = {
  number: "PO-0878",
  quantity: 40,
  last: "PO-0871",
  quotes: QUOTES,
  note: "Best of 3 quotes: $389.00, delivered in 4 days.",
} as const;

/**
 * A median job, in days: time worked in each stage, then time idle before the next stage picks it up.
 * It adds up to 9.5 days, 2.4 of them idle, 1.5 of those between intake and scheduling.
 */
export const JOB_TIMELINE = [
  { id: "intake", name: "Intake", work: 0.6, idle: 1.5 },
  { id: "scheduling", name: "Scheduling", work: 0.8, idle: 0.4 },
  { id: "progress", name: "In progress", work: 4.6, idle: 0.3 },
  { id: "review", name: "Review", work: 1.1, idle: 0.2 },
] as const;

export const PROPOSAL = {
  medianJob: 9.5,
  idleTotal: 2.4,
  slowest: { label: "intake to scheduling", idle: 1.5 },
  projected: 0.3,
  saving: "1.2 days",
  change: "Send each job to scheduling when it is accepted, not in the end-of-day batch.",
} as const;
