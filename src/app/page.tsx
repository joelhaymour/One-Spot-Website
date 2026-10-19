import { Connect } from "@/components/sections/Connect";
import { Contact } from "@/components/sections/Contact";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Worth } from "@/components/sections/Worth";

/**
 * The page, in order:
 *
 *   hero        modern workflows, made simple
 *   01 connect  the parts of any business around one dashboard; the morning screen; websites in a line
 *   02 worth    what a better way of working could be worth, from their own numbers
 *   03 process  business first, technology second, in one row
 *   04 faq
 *   05 contact  tell us what you'd like help with
 */
export default function Home() {
  return (
    <main id="content">
      <Hero />
      <Connect />
      <Worth />
      <Process />
      <Faq />
      <Contact />
    </main>
  );
}
