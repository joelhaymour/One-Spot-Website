/**
 * The Examples section: one ordinary moment in four kinds of business, before and after One Spot.
 * Illustrative composites, not client case studies. Keep every step concrete and every actor a real role.
 */

export type StoryActor = "person" | "agent" | "customer" | "owner" | "wait";

export interface StoryStep {
  time: string;
  actor: StoryActor;
  who: string;
  text: string;
}

export interface StoryOutcome {
  label: string;
  before: string;
  after: string;
}

export interface Story {
  id: string;
  industry: string;
  business: string;
  moment: string;
  before: StoryStep[];
  after: StoryStep[];
  outcomes: StoryOutcome[];
}

export const STORIES: Story[] = [
  {
    id: "home",
    industry: "Home services",
    business: "A 24-person plumbing and heating company",
    moment: "7:40pm. A customer calls about a leaking water heater.",
    before: [
      { time: "7:40pm", actor: "wait", who: "Voicemail", text: "The office closed at five. The call goes to voicemail." },
      { time: "8:15am", actor: "person", who: "Office manager", text: "Hears the message the next morning and writes the job on the whiteboard." },
      { time: "9:30am", actor: "owner", who: "You", text: "Call around the crew to find out who's free and has the right parts." },
      { time: "10:05am", actor: "customer", who: "Customer", text: "Gets a call back, but has already booked another company." },
    ],
    after: [
      { time: "7:40pm", actor: "agent", who: "Front desk agent", text: "Answers, asks the right questions, and offers the first open slot." },
      { time: "7:41pm", actor: "agent", who: "Scheduler agent", text: "Adds the job to Carlos's first stop and checks his van has the parts." },
      { time: "7:41pm", actor: "customer", who: "Customer", text: "Gets a text: booked for 8am tomorrow, with Carlos's name." },
      { time: "8:00am", actor: "person", who: "Carlos", text: "Arrives ready. The invoice is waiting when the job is done." },
      { time: "8:30am", actor: "owner", who: "You", text: "See it in your morning summary. Nothing for you to do." },
    ],
    outcomes: [
      { label: "Time to book the job", before: "14 hours", after: "1 minute" },
      { label: "People chasing it", before: "3", after: "0" },
      { label: "Result", before: "Job lost", after: "Paid same day" },
    ],
  },
  {
    id: "clinic",
    industry: "Dental & medical",
    business: "A dental practice with three chairs",
    moment: "6:10pm. A patient cancels tomorrow's 10am cleaning.",
    before: [
      { time: "6:10pm", actor: "wait", who: "Inbox", text: "The cancellation email lands after the front desk has gone home." },
      { time: "8:05am", actor: "person", who: "Front desk", text: "Finds it the next morning, between phone calls." },
      { time: "8:20am", actor: "person", who: "Front desk", text: "Works down the paper waitlist, leaving voicemails." },
      { time: "10:00am", actor: "wait", who: "Chair two", text: "Sits empty for an hour. The hygienist catches up on paperwork." },
    ],
    after: [
      { time: "6:10pm", actor: "agent", who: "Front desk agent", text: "Reads the cancellation and frees up the slot." },
      { time: "6:11pm", actor: "agent", who: "Scheduler agent", text: "Texts the three patients on the waitlist who can come at short notice." },
      { time: "6:22pm", actor: "customer", who: "Patient", text: "Replies “yes”, gets the slot and the usual reminder." },
      { time: "6:22pm", actor: "agent", who: "Scheduler agent", text: "Updates the day sheet and lets the hygienist know." },
      { time: "8:00am", actor: "owner", who: "You", text: "Walk in to a full day. The change is in the morning summary." },
    ],
    outcomes: [
      { label: "Time to fill the chair", before: "Never", after: "12 minutes" },
      { label: "Calls made by staff", before: "6", after: "0" },
      { label: "Result", before: "Empty hour", after: "Full schedule" },
    ],
  },
  {
    id: "wholesale",
    industry: "Wholesale",
    business: "A building-supply distributor with 40 people",
    moment: "4:55pm Friday. A big customer emails a 40-line order.",
    before: [
      { time: "Mon 8:30am", actor: "person", who: "Sales rep", text: "Retypes the order line by line into the order system." },
      { time: "Mon 11:00am", actor: "person", who: "Warehouse", text: "Starts picking and finds two items are out of stock." },
      { time: "Mon 2:00pm", actor: "customer", who: "Customer", text: "Hears about the missing items after the truck is already loaded." },
      { time: "Next week", actor: "wait", who: "Accounting", text: "Sends the invoice once someone remembers the order shipped." },
    ],
    after: [
      { time: "4:56pm", actor: "agent", who: "Order agent", text: "Reads the email and enters all 40 lines. No retyping." },
      { time: "4:56pm", actor: "agent", who: "Stockroom agent", text: "Spots two short items and drafts a supplier reorder." },
      { time: "5:02pm", actor: "owner", who: "You", text: "Approve the reorder with one tap from your phone." },
      { time: "5:03pm", actor: "customer", who: "Customer", text: "Gets a confirmation with the delivery date and one suggested swap." },
      { time: "Mon 7:00am", actor: "person", who: "Warehouse", text: "Picks a complete order. The invoice goes out when the truck leaves." },
    ],
    outcomes: [
      { label: "Order entered", before: "Next business day", after: "1 minute" },
      { label: "Surprises for the customer", before: "2", after: "0" },
      { label: "Invoice sent", before: "A week later", after: "On dispatch" },
    ],
  },
  {
    id: "services",
    industry: "Professional services",
    business: "A 12-person accounting firm",
    moment: "Tuesday. A new client says yes.",
    before: [
      { time: "Day 1", actor: "person", who: "Partner", text: "Writes a welcome email and engagement letter from scratch." },
      { time: "Day 3", actor: "person", who: "Assistant", text: "Sets up folders and the client record by hand, in two systems." },
      { time: "Days 4–20", actor: "wait", who: "Paperwork", text: "Documents trickle in. Someone chases them over email, one by one." },
      { time: "Month end", actor: "owner", who: "You", text: "Realize the first invoice never went out." },
    ],
    after: [
      { time: "Day 1", actor: "agent", who: "Onboarding agent", text: "Sends the engagement letter for e-signature, in your firm's own words." },
      { time: "Day 1", actor: "agent", who: "Onboarding agent", text: "Creates the client record, folders and a checklist of documents." },
      { time: "Days 2–6", actor: "customer", who: "Client", text: "Gets friendly reminders until every document is in." },
      { time: "Day 6", actor: "person", who: "Accountant", text: "Starts the work with everything in one place." },
      { time: "Day 7", actor: "agent", who: "Collections agent", text: "Sends the first invoice on schedule. You see it in the summary." },
    ],
    outcomes: [
      { label: "Time to get started", before: "3 weeks", after: "6 days" },
      { label: "Emails written by hand", before: "15+", after: "1" },
      { label: "First invoice", before: "Forgotten", after: "On time" },
    ],
  },
];
