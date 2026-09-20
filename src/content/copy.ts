/**
 * The copy deck. One voice: calm, precise, plainspoken, numerate.
 * Rules: the founder says "I". No adjective that cannot be measured. No exclamation marks.
 * Visitor-facing copy never says "HUD"; the visitor sees "The Business".
 * One action name everywhere: "Map my company".
 */

export const SITE = {
  name: "One Spot",
  title: "One Spot — The AI operating layer for your company",
  description:
    "One Spot designs and builds the AI operating layer for your company: AI agents that connect the people, software and processes you already have.",
  footerTagline: "The AI operating layer for the company you already have.",
  action: "Map my company",
};

export const NAV = [
  { label: "The Business", href: "/#business" },
  { label: "Agents", href: "/#agents" },
  { label: "Network", href: "/#network" },
  { label: "How I work", href: "/#how" },
];

export const HERO = {
  eyebrow: "The AI operating layer",
  headline: ["Your whole business.", "One spot."],
  sub: "I build AI agents that work across the people and software you already have. They watch. They act. They report to you.",
  hint: "Scroll to step inside",
};

export const BUSINESS = {
  eyebrow: "The Business",
  heading: "This is a company. Go inside.",
  lead: "Revenue, cash, pipeline, deadlines, and what to fix first. Pick a department.",
  prompt: "Select a department",
};

export const LOOP = {
  eyebrow: "Agents at work",
  heading: "Watch one do the job.",
  lead: "It observes, thinks, acts, learns and reports. Scroll through a full shift.",
  beats: [
    { label: "Observes.", line: "Reads everything that comes in." },
    { label: "Thinks.", line: "Works out what matters, and why." },
    { label: "Acts.", line: "Sends it. Files it. Books it. In your software." },
    { label: "Learns.", line: "Keeps what worked. Drops what didn't." },
    { label: "Reports.", line: "Tells the CEO Agent. Who tells you." },
  ],
};

export const NETWORK = {
  eyebrow: "Agent network",
  heading: "What Marketing sees, Operations knows.",
  lead: "Every agent reports to the CEO Agent. It passes word where it's needed, then brings you one decision.",
  relay: [
    { from: "marketing", to: "ceo", speaker: "Marketing Agent", line: "Enquiries up 46% in six days.", caption: "Marketing notices demand climbing faster than planned." },
    { from: "ceo", to: "operations", speaker: "CEO Agent", line: "Checking capacity.", caption: "The CEO Agent knows who needs to hear it." },
    { from: "operations", to: "ceo", speaker: "Operations Agent", line: "88% booked. 12 slots can open.", caption: "Operations checks people, hours and materials." },
    { from: "ceo", to: "owner", speaker: "To you", line: "One decision needed: open 12 slots before raising ad spend.", caption: "You get one line, with the answer attached." },
  ],
} as const;

export const SCALING = {
  eyebrow: "Autonomous scaling",
  heading: "It knows when it needs help.",
  lead: "An agent that falls behind says so. Specialists arrive and split the load: research, execution, reporting.",
  signal: "Workload at 140% of capacity. I am becoming the bottleneck. Requesting two specialists.",
  lanes: ["Research", "Execution", "Reporting"],
  beats: [
    { title: "One agent. A steady day.", body: "Work arrives. Work clears." },
    { title: "Then the work triples.", body: "The queue grows faster than it clears." },
    { title: "It says so.", body: "No struggling in silence. It measures its own load and asks for help." },
    { title: "Specialists arrive.", body: "The CEO Agent approves two more. They take their place beside it." },
    { title: "The work splits by skill.", body: "One researches. One executes. One reports. Throughput triples." },
  ],
};

export const PROCESS = {
  eyebrow: "How I work",
  heading: "It starts with your business. Not with AI.",
  lead: "Six steps. One person accountable for all of them.",
  steps: [
    { title: "Learn the business.", body: "I sit with you and your team. How the money comes in, where the time goes." },
    { title: "Find the friction.", body: "Where people wait, retype, chase and forget. Ranked by what it costs you." },
    { title: "Draw the org chart.", body: "Which agents, which jobs, what needs your sign-off. On one page, before anything is built." },
    { title: "Build one, prove it.", body: "One department first. It proves itself on your real work before the next begins." },
    { title: "Connect everything.", body: "Agents plug into the software you already pay for, and report to one CEO Agent." },
    { title: "Keep it sharp.", body: "Every month: what the agents did, what they missed, what to build next." },
  ],
};

export const BEFORE_AFTER = {
  eyebrow: "Before / After",
  heading: "Same software. Different company.",
  lead: "Nothing gets ripped out. Your email, spreadsheets, books and calendar stay. Agents work between them.",
  before: "Eight tools. You in the middle.",
  after: "Eight tools. One Spot in the middle.",
  tools: ["Email", "CRM", "Spreadsheets", "Documents", "Chat", "Accounting", "Calendar", "Support"],
};

/** Full-screen pauses. One sentence, nothing moving. */
export const PAUSES = {
  afterHero: "Every company has an operating layer. Usually it's the owner.",
  beforeAgents: "A chatbot waits to be asked. An agent has a job.",
  beforeScaling: "You wouldn't hire one person to do every job.",
  beforeAfter: "Your software works. It just doesn't work together.",
  beforeCta: "You still run the company. Now you can see all of it.",
};

export const CTA = {
  eyebrow: "Start here",
  heading: "Show me how your company works.",
  lead: "One call. I map where the hours go and name the first agent I'd build.",
  button: "Map my company",
  fields: {
    name: "Your name",
    email: "Work email",
    company: "Company, and what it does",
    stuck: "Where the day gets stuck",
  },
  reassurance: "I answer every message myself. If agents won't pay for themselves in your business, I'll say so.",
  success: { title: "Received.", body: "I'll reply within one working day with a time to talk." },
  error: "That didn't send. Please try again.",
  errorDirect: "Or email me directly:",
  errorBusy: "Too many messages from this connection. Try again in a few minutes.",
};
