import { PAUSES, PAYOFF } from "@/content/copy";
import { BusinessSection } from "@/components/business/BusinessSection";
import { ContactSection } from "@/components/cta/ContactSection";
import { FlowsSection } from "@/components/flows/FlowsSection";
import { HeroSection } from "@/components/hero/HeroSection";
import { LoopSection } from "@/components/loop/LoopSection";
import { ProcessSection } from "@/components/process/ProcessSection";
import { ScalingSection } from "@/components/scaling/ScalingSection";
import { Statement } from "@/components/ui/Section";

/**
 * The film, in order. Full-screen typographic pauses sit beside the scenes they introduce.
 *
 *   hero            the eight tools, before and after (its cue carries the visitor into 01)
 *   01 how we work   it starts with your business
 *   02 the hub       see more, then do less: dashboard, then to do
 *   03 scaling       it knows when it needs help
 *   04 agents        watch one do the job
 *   05 in action     three things that happen in every business, routed by One Spot
 *   payoff           see more, do less
 *   contact
 */
export default function Home() {
  return (
    <main id="content">
      <HeroSection />
      <ProcessSection index="01" />
      {/* The owner as the company's wiring: the thought the display answers. */}
      <Statement>{PAUSES.beforeHub}</Statement>
      <BusinessSection index="02" />
      <Statement>{PAUSES.beforeScaling}</Statement>
      <ScalingSection index="03" />
      <Statement>{PAUSES.beforeAgents}</Statement>
      <LoopSection index="04" />
      <FlowsSection index="05" />
      {/* The end state: the owner moves from operator to governor. */}
      <Statement id="payoff" kicker="The owner" support={PAYOFF.support}>
        {PAYOFF.line}
      </Statement>
      <ContactSection />
    </main>
  );
}
