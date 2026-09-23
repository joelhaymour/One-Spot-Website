import { HERO } from "@/content/copy";
import { AnchorLink } from "@/components/chrome/anchor";
import { CinematicSlot } from "@/components/media/CinematicSlot";
import { Arrow } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { HeroTools } from "./HeroTools";

/**
 * The opening frame: the headline in two lines, and the same eight tools before and after One Spot.
 * The visitor is not asked to do anything here; the cue carries them into how we work.
 * The container runs wider than the sections below it so the drawing gets the room a large screen has;
 * the copy column sizes to its longest line (the headline; 634px at the largest size), the drawing takes the rest.
 */
export function HeroSection() {
  return (
    <section className="relative overflow-x-clip" aria-labelledby="hero-heading">
      <CinematicSlot slot="hero-room" className="max-md:hidden" />

      <div className="relative mx-auto grid min-h-[100svh] w-full max-w-[1520px] items-center gap-x-[clamp(32px,4vw,72px)] gap-y-8 px-[var(--gutter)] pb-16 pt-[calc(var(--nav-h)+40px)] md:gap-y-12 md:pb-20 lg:grid-cols-[auto_minmax(26rem,1fr)]">
        <div className="max-w-[46rem]">
          <Eyebrow>{HERO.eyebrow}</Eyebrow>
          <h1 id="hero-heading" className="t-display mt-7">
            {HERO.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="t-lead mt-7 max-w-[32rem]">{HERO.sub}</p>

          <AnchorLink href="/#how" className="group mt-10 inline-flex items-center gap-3 text-[var(--text-1)] transition-colors duration-200 hover:text-[var(--text-0)]">
            <span className="h-px w-8 bg-[var(--line-strong)] transition-colors duration-200 group-hover:bg-[var(--text-2)]" />
            <span className="t-label text-current">{HERO.cue}</span>
            <Arrow className="rotate-90" />
          </AnchorLink>
        </div>

        <HeroTools className="min-w-0 justify-self-center" />
      </div>
    </section>
  );
}
