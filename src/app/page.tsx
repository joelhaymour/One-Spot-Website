import { Contact } from "@/components/sections/Contact";
import { Examples } from "@/components/sections/Examples";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
import { Promises } from "@/components/sections/Promises";
import { Websites } from "@/components/sections/Websites";

/**
 * The page, in order. It follows the One Spot HUD: every business moves through the same steps, and the
 * page walks a visitor through them before asking for anything.
 *
 *   hero         the promise, and one company file filling in step by step
 *   01 how       look, listen, map, find, show, build (one animation each)
 *   02 examples  one moment in six businesses, before and after
 *   03 websites  the storefront, before and after, and a bag that sells
 *   04 promises  what stays in your hands
 *   05 faq
 *   06 contact   tell us where it feels manual
 */
export default function Home() {
  return (
    <main id="content">
      <Hero />
      <Journey />
      <Examples />
      <Websites />
      <Promises />
      <Faq />
      <Contact />
    </main>
  );
}
