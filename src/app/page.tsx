import { PAUSES, PAYOFF } from "@/content/copy";
import { BeforeAfterSection } from "@/components/beforeafter/BeforeAfterSection";
import { BusinessSection } from "@/components/business/BusinessSection";
import { ContactSection } from "@/components/cta/ContactSection";
import { HeroSection } from "@/components/hero/HeroSection";
import { LoopSection } from "@/components/loop/LoopSection";
import { NetworkSection } from "@/components/network/NetworkSection";
import { ProcessSection } from "@/components/process/ProcessSection";
import { ScalingSection } from "@/components/scaling/ScalingSection";
import { Statement } from "@/components/ui/Section";

/**
 * The film, in order. Full-screen typographic pauses sit beside the scenes they introduce.
 *
 *   hero            a preview of the connected business (its cue carries the visitor into 01)
 *   01 how we work   it starts with your business, not with AI
 *   02 before/after  same software, different company
 *   03 scaling       it knows when it needs help
 *   04 agents        watch one do the job
 *   05 network       the workforce works across departments
 *   06 the hub       the display you can step into
 *   payoff           see more, do less
 *   contact
 */
export default function Home() {
  return (
    <main id="content">
      <HeroSection />
      <ProcessSection index="01" />
      <Statement>{PAUSES.beforeAfter}</Statement>
      <BeforeAfterSection index="02" />
      <Statement>{PAUSES.beforeScaling}</Statement>
      <ScalingSection index="03" />
      <Statement>{PAUSES.beforeAgents}</Statement>
      <LoopSection index="04" />
      <NetworkSection index="05" />
      {/* The owner as the company's wiring: the thought the display answers. */}
      <Statement>{PAUSES.afterHero}</Statement>
      <BusinessSection index="06" />
      {/* The end state: the owner moves from operator to governor. */}
      <Statement id="payoff" kicker="The owner" support={PAYOFF.support}>
        {PAYOFF.line}
      </Statement>
      <ContactSection />
    </main>
  );
}
