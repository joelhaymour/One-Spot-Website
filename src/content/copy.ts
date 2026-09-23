/**
 * The copy deck. One voice: calm, precise, plainspoken, numerate.
 * Rules: the company says "we"; an individual agent speaking says "I". No adjective that cannot be
 * measured. No exclamation marks.
 * Visitor-facing copy never says "HUD"; the visitor sees the Hub (One Spot Hub, the command center).
 * One action name everywhere: "Map my company". One promise everywhere: "See more. Do less."
 *
 * Hierarchy the whole site follows:
 *   One Spot          the custom business operating system
 *   One Spot Hub      the central command center: where the owner sees the business
 *   Agents            the digital workforce: how One Spot executes (inside it, not the whole of it)
 *   Intelligence      what the operating history becomes
 *   Owner             the governor: approvals, exceptions and decisions, not routine execution
 */

export const SITE = {
  name: "One Spot",
  title: "One Spot — The custom business operating system for your company",
  description:
    "A custom business operating system built around how your company runs: one command center, a digital workforce, and only what needs you rising to the top.",
  footerTagline: "The custom business operating system for the company you already have.",
  footerLine: "Command center. Digital workforce. Intelligence that compounds.",
  action: "Map my company",
  promise: "See more. Do less.",
};

export const NAV = [
  { label: "How we work", href: "/#how" },
  { label: "Agents", href: "/#agents" },
  { label: "Network", href: "/#network" },
  { label: "The Hub", href: "/#business" },
];

export const HERO = {
  eyebrow: "Custom business operating system",
  headline: ["Your whole business.", "One Spot."],
  sub: "We learn how your company actually runs, build one central command center around it, and put a digital workforce to work across the systems you already use.",
  promise: SITE.promise,
  /** The opening scroll cue. Points at the first chapter. */
  cue: "See how we work",
  /** The layers the hero animation labels, top to bottom of the picture. */
  layers: {
    software: "Your business and its software",
    spot: "One Spot",
    hub: "Command center",
    workforce: "Digital workforce",
    owner: "Owner",
  },
  /** Quiet SR/overview line for the hero animation. */
  overview:
    "Your existing software feeds One Spot. Inside it, a command center shows the business and a digital workforce does the work. Only what needs you reaches you.",
};

export const BUSINESS = {
  eyebrow: "One Spot Hub · Central command center",
  /** The short name used in the nav, the breadcrumb and the way back. */
  short: "The Hub",
  heading: "This is a company. Go inside.",
  lead: "Everything happening across the business. Only what needs you rises to the top.",
  prompt: "Select a department",
  hint: "Scroll to step inside",
  back: "Back to the Hub",
};

export const LOOP = {
  eyebrow: "Digital workforce",
  heading: "Watch one do the job.",
  lead: "The Hub shows you the business. Your digital workforce does the work inside it. Scroll through one job, start to finish.",
  beats: [
    { label: "Observes.", line: "Reads everything that comes in." },
    { label: "Thinks.", line: "Works out what matters, and why." },
    { label: "Acts.", line: "Sends it. Files it. Books it. In your software." },
    { label: "Learns.", line: "Keeps what worked. Drops what didn't." },
    { label: "Reports.", line: "One line on the Hub. It reaches you only if it needs you." },
  ],
  /** Under the demonstration: the doors. */
  doors: "Every department runs the same loop. Step inside one.",
  doorsNote: "These seven are an example. We design the digital workforce around how your company is actually organised.",
};

export const NETWORK = {
  eyebrow: "Across departments",
  heading: "Your digital workforce works across departments.",
  lead: "Agents share what matters across the business. Executive agents connect the dots, coordinate work and bring the decisions that actually require you to the surface.",
  relay: [
    { from: "sales", to: "ceo", speaker: "Sales Agent", line: "New enquiries up 46% in six days.", caption: "Sales notices demand climbing faster than planned." },
    { from: "ceo", to: "operations", speaker: "CEO Agent", line: "Checking delivery capacity.", caption: "An executive agent connects the dots and asks the department that would feel it first." },
    { from: "operations", to: "ceo", speaker: "Operations Agent", line: "88% booked. 12 more slots can open.", caption: "Operations checks people, hours and materials." },
    { from: "ceo", to: "owner", speaker: "To you", line: "Open the 12 slots before taking on more work.", caption: "One recommendation reaches you, with the answer attached. You decide." },
  ],
} as const;

export const SCALING = {
  eyebrow: "Scaling the workforce",
  heading: "It knows when it needs help.",
  lead: "An agent that falls behind says so. The system can recommend its own expansion. It cannot grant itself headcount. You approve, and specialists split the load.",
  signal: "Workload at 140% of capacity for three weeks. I am becoming the bottleneck. Recommending two specialists.",
  /** The governance moment: a recommendation, not an approval. */
  recommendation: {
    speaker: "CEO Agent",
    tag: "Recommendation",
    line: "Workload has exceeded capacity for three weeks. Recommend adding Research and Execution specialists.",
    actions: ["Approve", "Review", "Not now"],
    approved: "Approved by you. Two specialists arriving.",
  },
  lanes: ["Research", "Execution", "Reporting"],
  beats: [
    { title: "One agent. A steady day.", body: "Work orders arrive. Work orders clear." },
    { title: "Then the work triples.", body: "The queue grows faster than it clears." },
    { title: "It says so.", body: "No struggling in silence. It measures its own load and asks for help." },
    { title: "The system recommends. You decide.", body: "The CEO Agent recommends two specialists. It cannot grant itself headcount. Nothing changes until you approve." },
    { title: "The work splits by skill.", body: "One researches. One executes. One reports. Throughput triples." },
  ],
};

export const PROCESS = {
  eyebrow: "How we work",
  heading: "It starts with your business. Not with AI.",
  lead: "Six steps. One team accountable for all of them.",
  steps: [
    {
      title: "Learn the business.",
      body: "We sit with you and your team to understand how work, information, decisions and money actually move.",
    },
    {
      title: "Map the operation.",
      body: "We map your departments, people, workflows, software, handoffs and the decisions that keep the company moving.",
    },
    {
      title: "Find the friction.",
      body: "We find where work waits, gets repeated, gets forgotten, needs a manual handoff or depends on you.",
      note: "Every opportunity is classified: redesign it, connect it, automate it, give it to an agent, or leave it human.",
    },
    {
      title: "Build your One Spot.",
      body: "We build a central command center around how your company already works: tasks, approvals, workflows, departments and operating information in one place.",
    },
    {
      title: "Put the system to work.",
      body: "We automate the right workflows and deploy agents where they create real operating leverage.",
      note: "Some problems need an integration. Some need automation. Some need an agent. We build the smallest solution that works.",
    },
    {
      title: "See more. Do less.",
      body: "As the system runs, your digital workforce handles more of the execution while One Spot gives you a clearer view of what needs attention, approval or a decision.",
      note: "Over time the operating history becomes intelligence: patterns, bottlenecks and opportunities that were hard to see before.",
    },
  ],
};

export const BEFORE_AFTER = {
  eyebrow: "Before / After",
  heading: "Same software. Different company.",
  lead: "Nothing gets ripped out. Your email, spreadsheets, books and calendar stay. One Spot works between them.",
  before: "Eight tools. You in the middle.",
  after: "Eight tools. One Spot in the middle.",
  payoff: "Your tools still do their jobs. You just stop being the thing holding them together.",
  tools: ["Email", "CRM", "Spreadsheets", "Documents", "Chat", "Accounting", "Calendar", "Support"],
};

/** Full-screen pauses. One sentence, nothing moving. */
export const PAUSES = {
  afterHero: "Every company has an operating layer. Usually it's the owner.",
  beforeAgents: "A chatbot waits to be asked. An agent has a job.",
  beforeScaling: "You wouldn't hire one person to do every job.",
  beforeAfter: "Your software works. It just doesn't work together.",
};

/** The end state. The owner moves from operator to governor. */
export const PAYOFF = {
  line: SITE.promise,
  support: "Your company keeps moving. You stay in control without staying inside every workflow.",
};

export const CTA = {
  eyebrow: "Start here",
  heading: "Show us how your company works.",
  lead: "We start by understanding where work, information and decisions get stuck. Then we map what One Spot could change.",
  button: "Map my company",
  fields: {
    name: "Your name",
    email: "Work email",
    company: "Company, and what it does",
    stuck: "Where the day gets stuck",
  },
  reassurance: "We answer every message ourselves. If One Spot won't pay for itself in your business, we'll say so.",
  success: { title: "Received.", body: "We'll reply within one working day with a time to talk." },
  error: "That didn't send. Please try again.",
  errorDirect: "Or email us directly:",
  errorBusy: "Too many messages from this connection. Try again in a few minutes.",
};
