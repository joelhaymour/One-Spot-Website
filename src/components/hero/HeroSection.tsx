import { HERO } from "@/content/copy";
import { AnchorLink } from "@/components/chrome/anchor";
import { CinematicSlot } from "@/components/media/CinematicSlot";
import { Arrow } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { HeroOverview } from "./HeroOverview";

/**
 * The opening frame: five words, and a short preview of the connected business.
 * The visitor is not asked to do anything here; the display they can step into is the closing chapter.
 */
export function HeroSection() {
  return (
    <section className="relative overflow-x-clip" aria-labelledby="hero-heading">
      <CinematicSlot slot="hero-room" className="max-md:hidden" />

      <div className="relative mx-auto grid min-h-[100svh] w-full max-w-[1400px] items-center gap-x-[clamp(32px,5vw,96px)] gap-y-12 px-[var(--gutter)] pb-16 pt-[calc(var(--nav-h)+40px)] md:pb-20 lg:grid-cols-[minmax(0,46rem)_minmax(26rem,1fr)]">
        <div className="max-w-[46rem]">
          <Eyebrow>{HERO.eyebrow}</Eyebrow>
          <h1 id="hero-heading" className="t-display mt-7">
            {HERO.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="t-lead mt-7 max-w-[30rem]">{HERO.sub}</p>

          <AnchorLink href="/#how" className="group mt-10 inline-flex items-center gap-3 text-[var(--text-1)] transition-colors duration-200 hover:text-[var(--text-0)]">
            <span className="h-px w-8 bg-[var(--line-strong)] transition-colors duration-200 group-hover:bg-[var(--text-2)]" />
            <span className="t-label text-current">{HERO.cue}</span>
            <Arrow className="rotate-90" />
          </AnchorLink>
        </div>

        <HeroOverview className="w-full max-w-[760px] justify-self-center lg:justify-self-end" />
      </div>
    </section>
  );
}
