import { Contact } from "@/components/sections/Contact";
import { Examples } from "@/components/sections/Examples";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Tools } from "@/components/sections/Tools";

/**
 * The page, in order:
 *
 *   hero        modern workflows, made simple; what a better way of working could be worth
 *   01 process  business first, technology second: listen, map, plan, build, stay
 *   02 tools    one job, too many clicks; then the same apps, connected
 *   03 examples one job in four businesses, today and with One Spot
 *   04 faq
 *   05 contact  tell us where it feels manual
 */
export default function Home() {
  return (
    <main id="content">
      <Hero />
      <Process />
      <Tools />
      <Examples />
      <Faq />
      <Contact />
    </main>
  );
}
