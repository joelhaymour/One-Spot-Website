import { PAUSES } from "@/content/copy";
import { BeforeAfterSection } from "@/components/beforeafter/BeforeAfterSection";
import { ContactSection } from "@/components/cta/ContactSection";
import { HeroBusiness } from "@/components/hero/HeroBusiness";
import { LoopSection } from "@/components/loop/LoopSection";
import { NetworkSection } from "@/components/network/NetworkSection";
import { ProcessSection } from "@/components/process/ProcessSection";
import { ScalingSection } from "@/components/scaling/ScalingSection";
import { Statement } from "@/components/ui/Section";

/**
 * The film, in order. Scenes are separated by full-screen typographic pauses where nothing moves.
 */
export default function Home() {
  return (
    <main id="content">
      <HeroBusiness />
      <Statement>{PAUSES.beforeAgents}</Statement>
      <LoopSection />
      {/* The owner as the company's wiring: the thought the network scene answers. */}
      <Statement>{PAUSES.afterHero}</Statement>
      <NetworkSection />
      <Statement>{PAUSES.beforeScaling}</Statement>
      <ScalingSection />
      <ProcessSection />
      <Statement>{PAUSES.beforeAfter}</Statement>
      <BeforeAfterSection />
      <Statement>{PAUSES.beforeCta}</Statement>
      <ContactSection />
    </main>
  );
}
