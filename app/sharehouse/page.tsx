import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SharehousePortalClient from "@/components/SharehousePortalClient";
import { getPublicSharehouseNeeds } from "@/lib/sharehouse-actions";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "BURP Sharehouse — A Community That Shares",
  description:
    "A thoughtful, accountable way for the BURP community to carry genuine needs, create opportunity, and share beyond itself.",
};

const supportPaths = [
  {
    number: "01",
    title: "Member care",
    description:
      "Practical help through difficult moments—from urgent health and household needs to education and family emergencies.",
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 40S8 31.4 8 18.5C8 12.7 12 9 17 9c3.1 0 5.7 1.6 7 4 1.3-2.4 3.9-4 7-4 5 0 9 3.7 9 9.5C40 31.4 24 40 24 40Z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Work & opportunity",
    description:
      "Support that builds strength: tools, training, mentorship, customers, connections, and carefully considered financial help.",
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M9 36V19h30v17M16 19v-5h16v5M8 27h32M21 27v4h6v-4" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Outreach",
    description:
      "Shared resources for credible, selected work beyond BURP—from food and school supplies to emergency and community relief.",
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 7v34M24 13c-5-5-13-3-14 4 7 1 11 0 14-4ZM24 22c5-5 13-3 14 4-7 1-11 0-14-4ZM24 31c-4-4-10-2-11 3 5 1 8 0 11-3Z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Community life",
    description:
      "A clearly separated contribution to the gatherings and shared experiences that help this community become a home.",
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="18" cy="17" r="6" />
        <circle cx="34" cy="20" r="4" />
        <path d="M7 39c1-8 5-12 11-12s10 4 11 12M29 29c6-2 11 2 12 8" />
      </svg>
    ),
  },
];

const principles = [
  ["Compassion", "Every person is met with kindness, never shame."],
  ["Stewardship", "Every contribution is handled with care and purpose."],
  ["Transparency", "Clear records and reporting keep trust visible."],
  ["Fairness", "Need—not friendship or influence—guides decisions."],
  ["Confidentiality", "Private circumstances remain protected."],
  ["Empowerment", "Where possible, help creates lasting strength."],
];

export default async function SharehousePage() {
  const needs = await getPublicSharehouseNeeds();
  const activeCount = needs.filter((need) => need.status === "active").length;
  const metCount = needs.filter((need) => need.status === "met").length;

  return (
    <main className="sharehouse-page min-h-screen overflow-hidden bg-vellum text-ink">
      <section className="sharehouse-hero relative min-h-[760px] h-[92svh] flex flex-col text-vellum">
        <Image
          src="/images/sharehouse/sharehouse-community-hero.png"
          alt="A community sharing food and practical supplies around a table"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,15,12,.89)_0%,rgba(17,15,12,.65)_35%,rgba(17,15,12,.12)_72%),linear-gradient(0deg,rgba(17,15,12,.78)_0%,transparent_45%)]" />

        <header className="relative z-10 w-full px-5 sm:px-8 lg:px-12 py-6">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between border-b border-white/25 pb-5">
            <Link
              href="/"
              className="rounded-sm border border-white/25 bg-vellum/95 px-2.5 py-1.5 shadow-lg backdrop-blur-md transition-transform hover:-translate-y-0.5 sm:px-3"
            >
              <Image
                src="/images/sharehouse/burp-logo-transparent.png"
                alt="BURP — The Berean Upper Room Platform"
                width={1942}
                height={809}
                className="h-auto w-32 sm:w-40"
              />
            </Link>
            <nav className="flex items-center gap-3 sm:gap-6" aria-label="Sharehouse navigation">
              <a
                href="#needs"
                className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75 transition-colors hover:text-white sm:inline"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                View needs
              </a>
              <Link
                href="/sharehouse/submit"
                className="rounded-full border border-white/70 bg-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-md transition-all hover:bg-vellum hover:text-ink sm:px-5"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Share a need
              </Link>
            </nav>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 items-end px-5 pb-12 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
          <div className="max-w-3xl sharehouse-rise">
            <span
              className="mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-gold-glow"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              <span className="h-px w-10 bg-gold-glow" />
              A community that shares
            </span>
            <h1
              className="max-w-3xl text-[clamp(4.25rem,10vw,9.5rem)] font-medium leading-[0.76] tracking-[-0.055em]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              We carry it
              <span className="block pl-[0.28em] italic text-gold-glow">together.</span>
            </h1>
            <div className="mt-8 flex max-w-2xl flex-col gap-7 border-l border-gold-soft/70 pl-5 sm:flex-row sm:items-end sm:justify-between sm:pl-7">
              <p className="max-w-lg text-sm leading-7 text-white/78 sm:text-base">
                A thoughtful, accountable way to meet genuine needs, create opportunity,
                and make generosity part of the culture of BURP.
              </p>
              <a
                href="#story"
                className="group flex shrink-0 items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Discover Sharehouse
                <span className="grid size-10 place-items-center rounded-full border border-white/40 transition-transform group-hover:translate-y-1">↓</span>
              </a>
            </div>
          </div>
        </div>

        <div className="sharehouse-orbit absolute right-[7%] top-[26%] z-10 hidden size-28 rounded-full border border-white/30 lg:grid place-items-center">
          <svg viewBox="0 0 64 64" className="size-12 fill-none stroke-white/80 stroke-[1.2]" aria-hidden="true">
            <path d="M32 52S15 43 15 28c0-6 4-10 9-10 4 0 7 2 8 6 1-4 4-6 8-6 5 0 9 4 9 10 0 15-17 24-17 24Z" />
            <path d="M32 24v20M25 34h14" />
          </svg>
        </div>
      </section>

      <section className="border-b border-stone-edge bg-parchment-soft">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-x divide-stone-edge lg:grid-cols-4">
          {[
            [activeCount.toString().padStart(2, "0"), "active needs"],
            [metCount.toString().padStart(2, "0"), "needs met"],
            ["100%", "voluntary"],
            ["01", "shared community"],
          ].map(([value, label]) => (
            <div key={label} className="px-5 py-6 text-center sm:py-8">
              <strong className="block text-2xl font-semibold sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>{value}</strong>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.18em] text-stone-light" style={{ fontFamily: "var(--font-accent)" }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="story" className="relative px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="pointer-events-none absolute -right-24 top-20 size-80 rounded-full border border-gold-soft/30" />
        <div className="pointer-events-none absolute -right-5 top-40 size-48 rounded-full border border-gold-soft/40" />
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-24">
          <div>
            <p className="sharehouse-kicker">Why Sharehouse exists</p>
            <p className="mt-8 max-w-sm text-sm leading-7 text-stone-mid">
              BURP is more than a Bible study group. We pray together, grow together,
              celebrate together—and when necessary, carry one another&apos;s burdens.
            </p>
            <div className="mt-12 flex items-center gap-4 text-gold-deep">
              <svg viewBox="0 0 80 24" className="h-6 w-20 fill-none stroke-current" aria-hidden="true">
                <path d="M1 12h27c7 0 7-8 14-8s7 16 14 16 7-8 14-8h9" />
              </svg>
              <span className="text-[9px] font-bold uppercase tracking-[0.22em]" style={{ fontFamily: "var(--font-accent)" }}>Galatians 6:2</span>
            </div>
          </div>
          <div>
            <h2 className="text-[clamp(3rem,6vw,6.5rem)] font-medium leading-[0.92] tracking-[-0.045em]" style={{ fontFamily: "var(--font-display)" }}>
              Compassion,
              <span className="block italic text-gold-deep">made practical.</span>
            </h2>
            <p className="mt-8 max-w-2xl text-base leading-8 text-stone sm:text-lg">
              When one person has a need, the community should have a clear way to help.
              And when we have enough together, we should be ready to look beyond ourselves.
              Sharehouse turns care into thoughtful action—without replacing responsibility or
              compromising anyone&apos;s dignity.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ink px-5 py-24 text-vellum sm:px-8 sm:py-32 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 border-b border-white/15 pb-10 md:flex-row md:items-end">
            <div>
              <p className="sharehouse-kicker text-gold-glow">How we can show up</p>
              <h2 className="mt-5 max-w-2xl text-5xl font-medium leading-none tracking-[-0.035em] sm:text-7xl" style={{ fontFamily: "var(--font-display)" }}>
                More than a fund.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-white/58">
              Sometimes help is money. Sometimes it is a connection, a customer,
              a place to stay, sound advice, or someone willing to stand beside you.
            </p>
          </div>

          <div className="grid md:grid-cols-2">
            {supportPaths.map((path) => (
              <article key={path.number} className="sharehouse-path group relative border-b border-white/15 py-10 md:odd:border-r md:odd:pr-10 md:even:pl-10 lg:py-14">
                <div className="flex items-start gap-6 sm:gap-8">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-gold-soft" style={{ fontFamily: "var(--font-accent)" }}>{path.number}</span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-8 size-12 fill-none stroke-gold-glow stroke-[1.35] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3">
                      {path.icon}
                    </div>
                    <h3 className="text-3xl font-medium sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>{path.title}</h3>
                    <p className="mt-4 max-w-md text-sm leading-7 text-white/55">{path.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div className="relative mx-auto w-full max-w-xl">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-parchment-deep">
              <Image
                src="/images/sharehouse/sharehouse-opportunity.png"
                alt="Two women working together on plans for a small business"
                fill
                sizes="(max-width: 1024px) 90vw, 42vw"
                className="object-cover transition-transform duration-[1400ms] hover:scale-[1.025]"
              />
            </div>
            <div className="absolute -bottom-8 -right-3 grid size-28 place-items-center rounded-full bg-gold text-center text-[9px] font-bold uppercase leading-4 tracking-[0.16em] text-white sm:-right-10 sm:size-36" style={{ fontFamily: "var(--font-accent)" }}>
              Help that<br />builds strength
            </div>
            <svg className="absolute -left-8 -top-9 h-28 w-28 fill-none stroke-gold-soft/70" viewBox="0 0 100 100" aria-hidden="true">
              <path d="M50 2v22M50 76v22M2 50h22M76 50h22M16 16l16 16M68 68l16 16M84 16 68 32M32 68 16 84" />
              <circle cx="50" cy="50" r="11" />
            </svg>
          </div>
          <div>
            <p className="sharehouse-kicker">Built on trust</p>
            <h2 className="mt-6 text-5xl font-medium leading-[0.95] tracking-[-0.04em] sm:text-7xl" style={{ fontFamily: "var(--font-display)" }}>
              Care with both
              <span className="block italic text-gold-deep">heart & wisdom.</span>
            </h2>
            <p className="mt-8 max-w-xl text-base leading-8 text-stone-mid">
              Generosity grows where trust is protected. Requests are considered with compassion,
              appropriate verification, shared oversight, and careful financial records.
            </p>
            <div className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {principles.map(([title, text], index) => (
                <div key={title} className="border-t border-stone-edge pt-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-[9px] font-bold text-gold-deep" style={{ fontFamily: "var(--font-accent)" }}>0{index + 1}</span>
                    <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
                  </div>
                  <p className="mt-2 pl-7 text-xs leading-6 text-stone-mid">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-stone-edge bg-parchment-soft px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="sharehouse-kicker justify-center">A simple, human process</p>
            <h2 className="mt-5 text-4xl font-medium sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>Ask. Consider. Carry.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["01", "Share the need", "Tell us what happened, what help could change, and when it is needed. Requests can remain confidential."],
              ["02", "Review with care", "A trusted team considers the need, confirms what is reasonable, and looks for the most helpful response."],
              ["03", "Respond together", "The right support may be funding, practical help, opportunity, expertise, or a connection within the community."],
            ].map(([number, title, text]) => (
              <article key={number} className="group min-h-64 border border-stone-edge bg-vellum p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold-soft hover:shadow-[0_20px_60px_rgba(53,43,28,.08)] sm:p-9">
                <span className="text-[10px] font-bold tracking-[0.2em] text-gold-deep" style={{ fontFamily: "var(--font-accent)" }}>{number}</span>
                <h3 className="mt-14 text-3xl font-medium" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
                <p className="mt-4 text-sm leading-7 text-stone-mid">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="needs" className="scroll-mt-4 px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="sharehouse-kicker">The community board</p>
              <h2 className="mt-5 text-5xl font-medium leading-none tracking-[-0.035em] sm:text-7xl" style={{ fontFamily: "var(--font-display)" }}>Where care becomes action.</h2>
            </div>
            <Link href="/sharehouse/submit" className="sharehouse-primary-button">Share a need <span>↗</span></Link>
          </div>
          <SharehousePortalClient initialNeeds={needs} />
        </div>
      </section>

      <section className="relative overflow-hidden bg-gold px-5 py-24 text-ink sm:px-8 sm:py-28 lg:px-12">
        <svg className="absolute -right-20 -top-28 h-[520px] w-[520px] fill-none stroke-white/20" viewBox="0 0 400 400" aria-hidden="true">
          <circle cx="200" cy="200" r="70" /><circle cx="200" cy="200" r="120" /><circle cx="200" cy="200" r="170" />
        </svg>
        <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-ink/60" style={{ fontFamily: "var(--font-accent)" }}>The bigger vision</p>
            <h2 className="mt-6 max-w-4xl text-5xl font-medium leading-[0.92] tracking-[-0.04em] sm:text-7xl lg:text-8xl" style={{ fontFamily: "var(--font-display)" }}>
              The greatest resource may be the community itself.
            </h2>
          </div>
          <Link href="/sharehouse/submit" className="grid size-32 shrink-0 place-items-center rounded-full border border-ink/30 text-center text-[10px] font-bold uppercase leading-5 tracking-[0.16em] transition-all hover:rotate-6 hover:bg-ink hover:text-vellum" style={{ fontFamily: "var(--font-accent)" }}>
            Begin a<br />request ↗
          </Link>
        </div>
      </section>

      <footer className="bg-ink px-5 py-12 text-vellum sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="rounded-sm bg-vellum px-3 py-2 transition-transform hover:-translate-y-0.5">
            <Image
              src="/images/sharehouse/burp-logo-transparent.png"
              alt="BURP — The Berean Upper Room Platform"
              width={1942}
              height={809}
              className="h-auto w-40"
            />
          </Link>
          <p className="text-[9px] uppercase tracking-[0.18em] text-white/45" style={{ fontFamily: "var(--font-accent)" }}>
            Study together · grow together · give together · carry one another
          </p>
        </div>
      </footer>
    </main>
  );
}
