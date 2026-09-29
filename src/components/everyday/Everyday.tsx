"use client";

import { useEffect, useRef, useState } from "react";
import { ContactForm } from "@/components/sections/ContactForm";
import { examples, questions, services } from "@/content/everyday";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
function Logo() {
  return (
    <a className="ed-logo" href="#top" aria-label="One Spot home">
      <span className="ed-mark" aria-hidden="true">
        <i />
      </span>
      one spot<span className="ed-logo-period">.</span>
    </a>
  );
}
function Artwork({ kind }: { kind: number }) {
  if (kind === 0)
    return (
      <div className="ed-mini-site" aria-hidden="true">
        <div className="ed-mini-nav">
          <b>FIELDWORK</b>
          <span>Services&nbsp; / &nbsp;Contact</span>
        </div>
        <div className="ed-mini-body">
          <div>
            <strong>
              Good work.
              <br />
              Right on
              <br />
              your doorstep.
            </strong>
            <span className="ed-mini-cta">Let’s talk ↗</span>
          </div>
          <div className="ed-plant">
            <i />
            <i />
            <i />
            <i />
            <span />
          </div>
        </div>
      </div>
    );
  if (kind === 1)
    return (
      <div className="ed-connections" aria-hidden="true">
        <span>New order</span>
        <i />
        <b className="ed-hub">●</b>
        <i />
        <div>
          <span>
            Packing list <b>✓</b>
          </span>
          <span>
            Stock updated <b>✓</b>
          </span>
        </div>
      </div>
    );
  return (
    <div className="ed-draft" aria-hidden="true">
      <span className="ed-draft-icon">✳</span>
      <p>
        That follow-up?
        <br />
        <strong>Ready when you are.</strong>
      </p>
      <div>
        <span>Review draft</span>
        <b>↗</b>
      </div>
    </div>
  );
}
export function Everyday() {
  const [active, setActive] = useState(0);
  const [after, setAfter] = useState(true);
  const [step, setStep] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [menu, setMenu] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const example = examples[active];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setStep((current) => Math.min(current + 1, 3)),
      750,
    );
    const end = window.setTimeout(() => setPlaying(false), 2450);
    return () => {
      clearInterval(timer);
      clearTimeout(end);
    };
  }, [playing]);

  useEffect(() => {
    const elements = root.current?.querySelectorAll("[data-enter]");
    if (!elements || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ed-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    elements.forEach((el) => {
      el.classList.add("ed-waiting");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function choose(index: number) {
    setActive(index);
    setPlaying(false);
    setStep(3);
  }
  function replay() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(3);
      return;
    }
    setStep(0);
    setPlaying(true);
  }

  return (
    <div className="everyday" ref={root} id="top">
      <header className="ed-header ed-wrap">
        <Logo />
        <nav
          aria-label="Main navigation"
          className={menu ? "ed-nav is-open" : "ed-nav"}
          id="everyday-nav"
        >
          <a href="#help" onClick={() => setMenu(false)}>
            What we do
          </a>
          <a href="#examples" onClick={() => setMenu(false)}>
            See it in action
          </a>
          <a href="#approach" onClick={() => setMenu(false)}>
            Our approach
          </a>
        </nav>
        <a className="ed-button ed-button-small" href="#contact">
          Let’s talk <Arrow />
        </a>
        <button
          className="ed-menu"
          aria-expanded={menu}
          aria-controls="everyday-nav"
          onClick={() => setMenu(!menu)}
          aria-label={menu ? "Close menu" : "Open menu"}
        >
          {menu ? "×" : "☰"}
        </button>
      </header>
      <main id="content">
        <section className="ed-hero ed-wrap">
          <div className="ed-hero-copy">
            <p className="ed-eyebrow">
              <span className="ed-dot" /> SMALL BUSINESS. BIG BREATH OF FRESH
              AIR.
            </p>
            <h1>
              Look better.
              <br />
              Work smarter.
              <br />
              <span>Get on with it.</span>
            </h1>
            <p className="ed-lead">
              Better websites. Less busywork. A little help behind the scenes.
              We make your business easier to find—and easier to run.
            </p>
            <div className="ed-hero-actions">
              <a className="ed-button" href="#examples">
                Show me what you mean <Arrow />
              </a>
              <span>No tech talk required.</span>
            </div>
          </div>
          <div
            className="ed-hero-art"
            role="img"
            aria-label="Illustration: a customer finds your website, sends an enquiry, and you receive the details."
          >
            <div className="ed-art-grid" />
            <span className="ed-art-caption">
              A SMALL CHANGE. A BETTER DAY.
            </span>
            <div className="ed-orbit" aria-hidden="true" />
            <div className="ed-hero-browser">
              <div className="ed-browser-top">
                <span>● ● ●</span>
                <small>your-business.com</small>
                <span>↗</span>
              </div>
              <div className="ed-business">
                <p>THE GOOD NEIGHBOUR</p>
                <h2>
                  A local favourite.
                  <br />
                  Now easy to find.
                </h2>
                <div className="ed-shop-illustration">
                  <div className="ed-shop-roof" />
                  <div className="ed-shop-sign">HELLO, NEIGHBOUR</div>
                  <div className="ed-shop-window">
                    <span>✳</span>
                  </div>
                  <div className="ed-shop-door" />
                </div>
                <span className="ed-fake-button">Let’s make it happen ↗</span>
              </div>
            </div>
            <div className="ed-note ed-note-yellow">
              <span className="ed-note-symbol">↗</span>
              <div>
                <small>NEW ENQUIRY</small>
                <strong>“Can we book you?”</strong>
              </div>
            </div>
            <div className="ed-note ed-note-white">
              <span className="ed-check">✓</span>
              <div>
                <strong>Details sent to your team.</strong>
                <small>One less thing on your list.</small>
              </div>
            </div>
            <span className="ed-art-spark" aria-hidden="true">
              ✳
            </span>
            <span className="ed-handwritten">That’s more like it.</span>
          </div>
        </section>
        <div className="ed-business-strip ed-wrap">
          <span>
            For the businesses
            <br />
            <b>that keep life moving.</b>
          </span>
          <p>Local services</p>
          <span className="ed-strip-dot">·</span>
          <p>Shops & studios</p>
          <span className="ed-strip-dot">·</span>
          <p>Busy teams</p>
          <span className="ed-strip-dot">·</span>
          <p>People like you</p>
        </div>
        <section className="ed-section ed-wrap" id="help">
          <div className="ed-section-heading" data-enter>
            <div>
              <p className="ed-eyebrow">01 / A FEW WAYS WE CAN HELP</p>
              <h2>
                Good for business.
                <br />
                <span>Even better for your day.</span>
              </h2>
            </div>
            <p>
              You don’t need to know what to ask for.
              <br />
              Just tell us what’s getting in the way.
            </p>
          </div>
          <div className="ed-services">
            {services.map((service, index) => (
              <a
                data-enter
                className={`ed-service ${service.color}`}
                key={service.number}
                href="#examples"
                onClick={() => {
                  choose(index);
                  setAfter(true);
                }}
              >
                <div className="ed-service-top">
                  <span>{service.number}</span>
                  <span className="ed-round-arrow">↗</span>
                </div>
                <h3>{service.name}</h3>
                <p>{service.body}</p>
                <div className="ed-service-art">
                  <Artwork kind={index} />
                </div>
                <span className="ed-service-label">{service.label}</span>
              </a>
            ))}
          </div>
        </section>
        <section className="ed-examples-shell" id="examples">
          <div className="ed-wrap ed-section">
            <div className="ed-section-heading" data-enter>
              <div>
                <p className="ed-eyebrow">
                  02 / LESS EXPLAINING. MORE SHOWING.
                </p>
                <h2>
                  Here’s what that
                  <br />
                  <span>actually looks like.</span>
                </h2>
              </div>
              <p>
                Pick a familiar moment.
                <br />
                See how we could make it easier.
              </p>
            </div>
            <div
              className="ed-example-tabs"
              aria-label="Choose a business example"
            >
              {examples.map((item, index) => (
                <button
                  key={item.short}
                  aria-pressed={active === index}
                  onClick={() => choose(index)}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.short}
                </button>
              ))}
            </div>
            <div
              className="ed-example-panel"
              aria-live="polite"
              aria-atomic="false"
            >
              <div className="ed-example-copy">
                <p className="ed-eyebrow">{example.name}</p>
                <h3>{example.title}</h3>
                <div className="ed-switch" aria-label="Compare the example">
                  <button
                    aria-pressed={!after}
                    onClick={() => {
                      setAfter(false);
                      setPlaying(false);
                    }}
                  >
                    The usual way
                  </button>
                  <button
                    aria-pressed={after}
                    onClick={() => {
                      setAfter(true);
                      setStep(3);
                    }}
                  >
                    With One Spot
                  </button>
                </div>
                <p className="ed-example-description">
                  {after ? example.after : example.before}
                </p>
                <a className="ed-text-link" href="#contact">
                  This sounds like my business <Arrow />
                </a>
              </div>
              <div
                className={`ed-example-demo ${after ? "is-after" : "is-before"}`}
              >
                <div className="ed-demo-top">
                  <span className="ed-dot" />{" "}
                  {after ? "A LITTLE MORE CONNECTED" : "SOUND FAMILIAR?"}
                  <span>ILLUSTRATION</span>
                </div>
                {after ? (
                  <div className="ed-flow" key={active}>
                    {example.steps.map((label, index) => (
                      <div
                        key={label}
                        className={`ed-flow-row ${step > index ? "done" : ""}`}
                      >
                        <span className="ed-flow-number">
                          {step > index ? "✓" : `0${index + 1}`}
                        </span>
                        <div>
                          <small>STEP 0{index + 1}</small>
                          <strong>{label}</strong>
                        </div>
                        <span className="ed-flow-tick">↗</span>
                      </div>
                    ))}
                    <div className="ed-flow-result">
                      <span>
                        {step === 3 ? example.result : "One step at a time…"}
                      </span>
                      <button
                        onClick={replay}
                        disabled={playing}
                        aria-label="Replay this example"
                      >
                        ↻
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="ed-before-scene">
                    <span className="ed-tangle" aria-hidden="true">
                      ↝
                    </span>
                    <div>
                      <span>Another thing to remember.</span>
                      <span>Another tab to open.</span>
                      <span>Another job for later.</span>
                    </div>
                    <p>It shouldn’t all depend on you.</p>
                  </div>
                )}
              </div>
            </div>
            <p className="ed-example-disclaimer">
              Every business is different. These are examples of what we can
              build together, not client results.
            </p>
          </div>
        </section>
        <section className="ed-section ed-wrap ed-approach" id="approach">
          <div data-enter>
            <p className="ed-eyebrow">03 / PEOPLE FIRST. ALWAYS.</p>
            <h2>
              First, a conversation.
              <br />
              <span>Then, a better way.</span>
            </h2>
            <p className="ed-approach-lead">
              We’re a hands-on consulting partner for small and mid-sized
              businesses. We learn how your day works, then build what would
              actually help.
            </p>
            <div className="ed-personal-note">
              <span aria-hidden="true">✳</span>
              <p>
                You know your business.
                <br />
                <b>We’ll handle the technical bit.</b>
              </p>
            </div>
          </div>
          <ol className="ed-process">
            <li data-enter>
              <span>01</span>
              <div>
                <h3>Tell us where it gets stuck.</h3>
                <p>
                  A tired website. Too much admin. An inbox you can’t keep up
                  with. We start by listening.
                </p>
              </div>
            </li>
            <li data-enter>
              <span>02</span>
              <div>
                <h3>Start with one useful change.</h3>
                <p>
                  We agree on what to build, what it costs, and what it should
                  do for you. Then we get to work.
                </p>
              </div>
            </li>
            <li data-enter>
              <span>03</span>
              <div>
                <h3>Make sure it works for you.</h3>
                <p>
                  We test it with your team, show you how it works, and agree on
                  the support you need next.
                </p>
              </div>
            </li>
          </ol>
        </section>
        <section className="ed-faq ed-wrap">
          <h2>A few good questions.</h2>
          <div>
            {questions.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="ed-contact" id="contact">
          <div className="ed-wrap ed-contact-grid">
            <div data-enter>
              <p className="ed-eyebrow">LET’S TAKE SOMETHING OFF YOUR PLATE.</p>
              <h2>
                What could
                <br />
                be <span>easier?</span>
              </h2>
              <p>
                Tell us a little about your business and what you’d like to
                change. We’ll take it from there.
              </p>
              <a href="mailto:joel@onespot.build">
                joel@onespot.build <Arrow />
              </a>
              <span className="ed-contact-flower" aria-hidden="true">
                ✳
              </span>
            </div>
            <div className="ed-form">
              <ContactForm />
              <p className="ed-form-note">
                A real conversation with a real person. No tech knowledge
                needed.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="ed-footer ed-wrap">
        <Logo />
        <p>A little less complicated. A lot more possible.</p>
        <span>© {new Date().getFullYear()} One Spot</span>
        <a href="#top" aria-label="Back to top">
          ↑
        </a>
      </footer>
    </div>
  );
}
