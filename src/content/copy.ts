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
  { label: "The Hub", href: "/#business" },
  { label: "Agents", href: "/#agents" },
  { label: "In action", href: "/#in-action" },
];

/**
 * The eight tools. The opening animation shows them twice: first with the owner in the middle, then with
 * One Spot in the middle. Nothing is ripped out; only what stands between the tools changes.
 */
export const BEFORE_AFTER = {
  before: "Eight tools. You in the middle.",
  after: "Eight tools. One Spot in the middle.",
  tools: ["Email", "CRM", "Spreadsheets", "Documents", "Chat", "Accounting", "Calendar", "Support"] as const,
};

export const HERO = {
  eyebrow: "Custom business operating system",
  headline: ["Run the business.", "Not every task."],
  sub: "Organizing your business, made simple.",
  /** The opening scroll cue. Points at the first chapter. */
  cue: "See how we work",
  /** The two states of the opening animation, captioned under it as they change. */
  states: {
    before: { label: "Before", text: BEFORE_AFTER.before },
    after: { label: "After", text: BEFORE_AFTER.after },
  },
  /** A working day, counted, under the drawing. Before, the first two climb with every jump of attention. */
  counters: [
    { label: "Tab switches today", before: 325, after: 14 },
    { label: "Copy-pastes", before: 144, after: 0 },
    { label: "Things waiting on you", before: 41, after: 3 },
  ],
  /** Quiet SR line for the hero animation (the drawing itself is aria-hidden). */
  overview:
    "The same eight tools, before and after: email, CRM, spreadsheets, documents, chat, accounting, calendar and support. Before, you stand in the middle, holding them together. After, One Spot stands in the middle, connected to every tool, and you are connected to One Spot by one line.",
};

export const BUSINESS = {
  eyebrow: "One Spot Hub · Central command center",
  /** The short name used in the nav, the breadcrumb and the way back. */
  short: "The Hub",
  heading: "This is a company. Go inside.",
  lead: "Everything happening across the business. Only what needs you rises to the top.",
  back: "Back to the Hub",
  /** The display's two tabs, and the two words it says as each one arrives. */
  tabs: { dashboard: "Dashboard", todo: "To Do" },
  seeMore: "See more.",
  doLess: "Do less.",
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
  doorsNote: "These seven are an example. We design the digital workforce around how your company is actually organized.",
};

export const FLOWS = {
  eyebrow: "In action",
  heading: "Something happens. You get one decision.",
  lead: "Three things that happen in every business, handled the way One Spot handles them. Only the systems that matter take part; the rest stay quiet.",
  /** The pattern every scenario follows, in five beats. Shown under the heading. */
  pattern: [
    "Something happens",
    "One Spot finds the relevant information",
    "Work moves between the right systems",
    "One Spot connects the dots",
    "You receive one clear decision",
  ],
  /** The three scenarios themselves live in content/flows.ts. */
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
  heading: "It starts with your business.",
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
      title: "Assign the work.",
      body: "Once the system understands the job, we move repeatable work out of your hands and into the right mix of people, automation and agents.",
      note: "The goal isn't more technology. It's fewer things depending on you.",
    },
    {
      title: "See more. Do less.",
      body: "As the system runs, your digital workforce handles more of the execution while One Spot gives you a clearer view of what needs attention, approval or a decision.",
      note: "Over time the operating history becomes intelligence: patterns, bottlenecks and opportunities that were hard to see before.",
    },
  ],
};

/** Full-screen pauses. One sentence, nothing moving. */
export const PAUSES = {
  beforeHub: "Every company has an operating layer. Usually it's the owner.",
  beforeAgents: "A chatbot waits to be asked. An agent has a job.",
  beforeScaling: "You wouldn't hire one person to do every job.",
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
