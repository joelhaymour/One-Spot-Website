import { Contact } from "@/components/sections/Contact";
import { Examples } from "@/components/sections/Examples";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { Industries } from "@/components/sections/Industries";
import { Principles } from "@/components/sections/Principles";
import { Problem } from "@/components/sections/Problem";
import { Process } from "@/components/sections/Process";
import { WhatWeDo } from "@/components/sections/WhatWeDo";

/**
 * The page, in order. It follows how an owner would come to trust us: see the calm version of their
 * Monday, recognise the problem, learn the four jobs, see how we work, watch it happen in a business
 * like theirs, then talk.
 *
 *   hero         a busy Monday, sorted as you scroll
 *   01 why       the handoff problem
 *   02 what      connect, organize, automate, see clearly
 *   03 process   listen, map, plan, build, stay
 *   04 examples  one moment in four businesses, before and after
 *   06 working   five promises, and who we work with
 *   07 faq
 *   08 contact
 */
export default function Home() {
  return (
    <main id="content">
      <Hero />
      <Problem />
      <WhatWeDo />
      <Process />
      <Examples />
      <Principles />
      <Industries />
      <Faq />
      <Contact />
    </main>
  );
}
