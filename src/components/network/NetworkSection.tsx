import { NETWORK } from "@/content/copy";
import { SectionHeading } from "@/components/ui/Section";
import { NetworkStory } from "./NetworkStory";

/**
 * Agent network. A demand spike travels Sales -> CEO Agent -> Operations -> CEO Agent -> the owner.
 * The heading scrolls away, then the stage sticks and the relay plays one beat per step.
 */
export function NetworkSection({ index = "05" }: { index?: string }) {
  return (
    <section id="network" aria-label={NETWORK.eyebrow} className="relative">
      <div className="mx-auto w-full max-w-[1440px] px-[var(--gutter)] pb-10 pt-28 md:pb-16 md:pt-40">
        <SectionHeading index={index} eyebrow={NETWORK.eyebrow} title={NETWORK.heading} lead={NETWORK.lead} />
      </div>
      <NetworkStory />
    </section>
  );
}
