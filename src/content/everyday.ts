/** Fictional demonstrations, not client testimonials or measured results. */
export const examples = [
  {
    name: "A local service business",
    short: "The missed enquiry",
    icon: "↗",
    title: "A new customer.\nA clear next step.",
    before:
      "Someone likes your work, but can’t find your services or figure out how to book. So they leave.",
    after:
      "A clear website shows what you do, answers the obvious questions, and makes getting in touch easy.",
    steps: [
      "Find the right service",
      "Send a simple enquiry",
      "Get a clear next step",
    ],
    result: "Less searching. More conversations.",
  },
  {
    name: "An independent shop",
    short: "The online order",
    icon: "▧",
    title: "Order comes in.\nThings get moving.",
    before:
      "You copy an order into a spreadsheet, email the packing team, and remember to update the customer later.",
    after:
      "An order sends the details to your team, updates your stock, and gets a confirmation to the customer.",
    steps: [
      "Customer places an order",
      "Packing list reaches the team",
      "Customer gets an update",
    ],
    result: "One order. No copying and pasting.",
  },
  {
    name: "A busy service team",
    short: "The follow-up",
    icon: "✳",
    title: "The follow-up.\nAlready on it.",
    before:
      "You finish the job, then spend your evening checking invoices and writing the same reminders again.",
    after:
      "A digital assistant checks what’s outstanding and drafts a friendly reminder. You review it before it goes out.",
    steps: [
      "Find the overdue invoice",
      "Draft a friendly reminder",
      "Ask you before sending",
    ],
    result: "The routine gets done. You stay in charge.",
  },
] as const;
export const services = [
  {
    number: "01",
    name: "A website that\ngets to the point.",
    body: "Make it easy to understand your business, see your work, and take the next step.",
    label: "Website design & redesign",
    color: "peach",
  },
  {
    number: "02",
    name: "Your tools.\nWorking together.",
    body: "Connect the things you already use, so details move from one place to the next without you.",
    label: "Connected tools & workflows",
    color: "sage",
  },
  {
    number: "03",
    name: "A little help with\nthe everyday.",
    body: "Give a digital assistant a clear job, like preparing replies or following up on unpaid invoices.",
    label: "Practical AI assistants",
    color: "lavender",
  },
] as const;
export const questions = [
  [
    "Do I need to know anything about AI?",
    "No. Tell us what takes too much time or isn’t working. We’ll explain the options in everyday language and handle the technical work.",
  ],
  [
    "Can we just start with the website?",
    "Absolutely. A website redesign can be the whole project. If connecting bookings, orders, or enquiries would help later, we can take that next step together.",
  ],
  [
    "Will we need to change all our tools?",
    "We start with what you already use. We check what can connect, explain any limitations, and agree on a plan before changing anything.",
  ],
  [
    "How much will it cost?",
    "That depends on the work. We’ll talk through what you need, agree on the scope, and give you a price before we start building.",
  ],
] as const;
