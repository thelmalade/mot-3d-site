// Course-vault content for the four programs. `owned` is the demo default; real
// entitlement is read from localStorage (set after a mock purchase / sign-in).
// Replace this with the real /api/my-courses + /api/courses data in production.

export const PROGRAMS = {
  "cso-battalion": {
    name: "CSO Battalion",
    tagline: "The systematic options playbook. Structured rotations, defined risk.",
    poster: "https://picsum.photos/seed/cso-battalion-hero/1280/720",
    price: "$497",
    owned: true,
    modules: [
      { title: "Onboarding", lessons: [
        { t: "Welcome to the Battalion", len: "6:12", free: true },
        { t: "Platform setup and risk rules", len: "14:38" },
      ]},
      { title: "Core system", lessons: [
        { t: "The CSO rotation framework", len: "22:05" },
        { t: "Entry triggers and confirmation", len: "18:47" },
        { t: "Position sizing and drawdown control", len: "16:20" },
      ]},
      { title: "Live execution", lessons: [
        { t: "Tape reading the open", len: "27:54" },
        { t: "Managing a runner", len: "12:31" },
      ]},
    ],
  },
  "maxtermind": {
    name: "Maxtermind",
    tagline: "Max's full mentorship. Psychology, process and the trader's mind.",
    poster: "https://picsum.photos/seed/maxtermind-hero/1280/720",
    price: "$997",
    owned: false,
    modules: [
      { title: "Foundations", lessons: [
        { t: "The Maxtermind method", len: "9:40", free: true },
        { t: "Building a repeatable routine", len: "19:12" },
      ]},
      { title: "Mindset", lessons: [
        { t: "Process over excuses", len: "21:08" },
        { t: "Handling losing streaks", len: "17:55" },
      ]},
      { title: "Scaling", lessons: [
        { t: "From eval to multiple funded accounts", len: "24:16" },
      ]},
    ],
  },
  "p2p": {
    name: "P2P",
    tagline: "Path to Pro. The structured beginner-to-funded track.",
    poster: "https://picsum.photos/seed/p2p-hero/1280/720",
    price: "$297",
    owned: false,
    modules: [
      { title: "Start here", lessons: [
        { t: "Markets, instruments and platforms", len: "11:24", free: true },
        { t: "Reading a chart from scratch", len: "16:02" },
      ]},
      { title: "Your first strategy", lessons: [
        { t: "Support, resistance and structure", len: "18:30" },
        { t: "Your first rule-based setup", len: "20:11" },
      ]},
    ],
  },
  "futuresone": {
    name: "FuturesOne",
    tagline: "Futures specialization. NQ, ES, YM and the prop path.",
    poster: "https://picsum.photos/seed/futuresone-hero/1280/720",
    price: "$597",
    owned: true,
    modules: [
      { title: "Futures fundamentals", lessons: [
        { t: "Contracts, ticks and margin", len: "13:18", free: true },
        { t: "Index futures behavior", len: "17:44" },
      ]},
      { title: "The prop path", lessons: [
        { t: "Passing the evaluation", len: "23:02" },
        { t: "Holding a funded account", len: "19:36" },
        { t: "Payout discipline", len: "14:09" },
      ]},
    ],
  },
};
