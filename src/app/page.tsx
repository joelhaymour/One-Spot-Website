import { Contact } from "@/components/sections/Contact";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Tools } from "@/components/sections/Tools";

/**
 * The page, in order:
 *
 *   hero      modern workflows, made simple; one job in four businesses, today and with One Spot
 *   01 process  business first, technology second: listen, map, plan, build, stay
 *   02 tools    one job, too many clicks; then the same apps, connected
 *   03 faq
 *   04 contact  tell us where it feels manual
 */
export default function Home() {
  return (
    <main id="content">
      <Hero />
      <Process />
      <Tools />
      <Faq />
      <Contact />
    </main>
  );
}
