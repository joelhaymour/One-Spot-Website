import { PAUSES } from "@/content/copy";
import { HeroBusiness } from "@/components/hero/HeroBusiness";
import { LoopSection } from "@/components/loop/LoopSection";
import { Statement } from "@/components/ui/Section";

/**
 * The film, in order. Scenes are separated by full-screen typographic pauses where nothing moves.
 */
export default function Home() {
  return (
    <main id="content">
      <HeroBusiness />
      <Statement>{PAUSES.afterHero}</Statement>
      <Statement>{PAUSES.beforeAgents}</Statement>
      <LoopSection />
    </main>
  );
}
