import { Link } from "react-router-dom";
import AppLogo from "../components/AppLogo";
import ahnafImage from "../assets/ahnaf.png";

const manualProblems = [
  {
    title: "Scattered submissions",
    description: "Assignments shared through email, chat, and paper notes create duplicate files, missed uploads, and no trust in the latest version.",
  },
  {
    title: "Deadline confusion",
    description: "Manual follow-ups make it difficult to know who submitted on time, who is late, and which subject still needs action.",
  },
  {
    title: "Slow review cycles",
    description: "Checking folders one by one delays grading, feedback, and progress tracking for both departments and students.",
  },
];

const powerfulFeatures = [
  "Role-based access for students, departments, and admins",
  "Assignment publishing with due dates and organized subject flow",
  "Secure file submission tracking from a single dashboard",
  "Feedback and grading without spreadsheet juggling",
  "Verified onboarding with profile management and authentication",
  "Admin-level control over users, classes, and audit visibility",
];

const workflowSteps = [
  {
    step: "01",
    title: "Set up your academic workspace",
    description: "Admins manage users, departments, and classes so the platform reflects the real college structure from day one.",
  },
  {
    step: "02",
    title: "Create and assign work",
    description: "Departments publish assignments, define deadlines, and monitor incoming submissions from one organized workspace.",
  },
  {
    step: "03",
    title: "Submit, review, and close the loop",
    description: "Students upload files, departments grade with feedback, and everyone sees status updates without manual follow-up.",
  },
];

const roleHighlights = [
  {
    title: "Students",
    description: "See active assignments, upload work, and follow grading progress without asking for updates manually.",
    accent: "from-emerald-500/15 to-emerald-50",
  },
  {
    title: "Departments",
    description: "Create assignments, review files, and manage grading from a cleaner academic workflow.",
    accent: "from-cyan-500/15 to-cyan-50",
  },
  {
    title: "Admins",
    description: "Control users, departments, batches, and subjects from a central system built for operational oversight.",
    accent: "from-slate-900/10 to-slate-100",
  },
];

const faqs = [
  {
    question: "Who is this platform for?",
    answer: "ManageX is built for academic organizations that need a structured workflow for assignments, submissions, grading, and administration.",
  },
  {
    question: "What problem does it solve?",
    answer: "It replaces manual assignment tracking across chats, email, and scattered files with one structured submission and review flow.",
  },
  {
    question: "How does ManageX stay organized?",
    answer: "Role-based access, centralized records, and shared workflow visibility keep students, departments, and administrators aligned in one system.",
  },
];

const HomePage = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-emerald-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="pointer-events-none absolute -left-12 top-16 h-44 w-44 rounded-full bg-emerald-300/40 blur-3xl pulse-soft dark:bg-emerald-700/30" />
      <div className="pointer-events-none absolute right-0 top-40 h-52 w-52 rounded-full bg-cyan-300/40 blur-3xl float-slow dark:bg-cyan-700/30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_52%)]" />

      <header className="sticky top-0 z-20 border-b border-transparent bg-slate-50/80 backdrop-blur dark:bg-slate-950/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <AppLogo />
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#problems" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              Problems
            </a>
            <a href="#features" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              Features
            </a>
            <a href="#workflow" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              How It Works
            </a>
            <a href="#faq" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              FAQ
            </a>
            <Link
              to="/login?role=admin"
              className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800 transition hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-950/50"
            >
              Admin Login
            </Link>
          </nav>
          <div className="flex gap-3">
            <Link className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-sm" to="/login">
              Login
            </Link>
            <Link
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30"
              to="/register"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="animate-fade-up delay-1">
            <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              Academic workflow platform
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl lg:text-6xl">
              Modernize assignment management with one connected academic system.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
              ManageX brings assignment publishing, submissions, grading, onboarding, and admin control into one clear workflow
              built for students, departments, and campus operations.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/register?role=student"
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 sm:text-base"
              >
                Student Register
              </Link>
              <Link
                to="/register?role=department"
                className="rounded-xl border border-slate-300 bg-white/70 px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:hover:bg-slate-800/80 sm:text-base"
              >
                Department Register
              </Link>
              <a
                href="#features"
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800 sm:text-base"
              >
                Explore features
              </a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <article className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">3</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Core roles aligned in one platform</p>
              </article>
              <article className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">1</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Unified workflow from publish to grading</p>
              </article>
              <article className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">24/7</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Visibility without manual follow-up</p>
              </article>
            </div>
          </div>

          <section className="grid gap-4">
            <article className="animate-fade-up delay-2 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-emerald-100/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85 dark:shadow-none">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Live workflow</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Built for academic delivery</h2>
                </div>
                <div className="rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  ManageX
                </div>
              </div>
              <div className="mt-6 grid gap-4">
                <article className="rounded-3xl bg-slate-950 p-5 text-white dark:bg-slate-800">
                  <h3 className="text-lg font-bold">Student Portal</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    View assignments, upload submissions, and track status updates and grading history.
                  </p>
                </article>
                <div className="grid gap-4 sm:grid-cols-2">
                  <article className="rounded-3xl bg-emerald-50 p-5 dark:bg-emerald-950/30">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Department Workspace</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Create assignments, review uploads, and send grades with feedback.
                    </p>
                  </article>
                  <article className="rounded-3xl bg-cyan-50 p-5 dark:bg-cyan-950/30">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Admin Control Center</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Manage users, departments, classes, and system-level oversight.
                    </p>
                  </article>
                </div>
              </div>
            </article>
          </section>
        </section>

        <section id="problems" className="mt-24 animate-fade-up delay-2">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-700 dark:text-rose-400">
              Problems With Manual Assignment Management
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100 md:text-4xl">
              Traditional assignment handling wastes time at every step.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              When the process depends on chat groups, spreadsheets, and scattered folders, students miss context and departments
              lose control over timelines and evaluation.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {manualProblems.map((problem, index) => (
              <article
                key={problem.title}
                className={`rounded-[1.75rem] border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                  index === 1
                    ? "border-rose-200 bg-rose-50/85 dark:border-rose-900 dark:bg-rose-950/20"
                    : "border-white/70 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80"
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Problem 0{index + 1}</p>
                <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">{problem.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{problem.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-24 animate-fade-up delay-2">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Built For Every Role</p>
              <h2 className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100 md:text-4xl">
                One platform, three focused user experiences.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Each role has a focused workflow, while the full system stays connected through shared academic operations.
            </p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {roleHighlights.map((role) => (
              <article
                key={role.title}
                className={`rounded-[1.75rem] border border-white/70 bg-gradient-to-br ${role.accent} p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-900`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{role.title}</p>
                <p className="mt-4 text-xl font-black text-slate-900 dark:text-slate-100">{role.title} experience</p>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{role.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="features"
          className="mt-24 animate-fade-up delay-3 rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-xl shadow-emerald-100/60 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none"
        >
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">
              Powerful Features
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100 md:text-4xl">
              Everything needed to run assignment operations cleanly.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              The platform combines operational control, visibility, and academic workflow tools in a layout designed for fast
              daily use.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {powerfulFeatures.map((feature) => (
              <article
                key={feature}
                className="rounded-3xl border border-slate-200 bg-slate-50/90 p-5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-emerald-800 dark:hover:bg-slate-950"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    +
                  </span>
                  <p className="text-sm font-medium leading-7 text-slate-700 dark:text-slate-200">{feature}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="mt-24 animate-fade-up delay-4">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-400">How It Works</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100 md:text-4xl">
              A simple flow from setup to submission and review.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              Each role gets a focused experience, but the workflow stays connected so assignments move forward without manual
              coordination.
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {workflowSteps.map((item) => (
              <article
                key={item.step}
                className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-gradient-to-br from-white to-cyan-50/70 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-900"
              >
                <div className="absolute right-5 top-5 text-5xl font-black leading-none text-slate-200 dark:text-slate-800">{item.step}</div>
                <p className="relative z-10 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-400">
                  Step {item.step}
                </p>
                <h3 className="relative z-10 mt-4 max-w-xs text-xl font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
                <p className="relative z-10 mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="mt-24 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">FAQ</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100 md:text-4xl">
              Frequently asked questions.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              Clear answers for teams evaluating how the platform handles academic workflow and administrative control.
            </p>
          </div>
          <div className="grid gap-4">
            {faqs.map((item) => (
              <article key={item.question} className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-24 animate-fade-up delay-5 overflow-hidden rounded-[2.25rem] border border-emerald-300/50 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-8 py-10 text-white shadow-2xl shadow-emerald-500/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/75">Final CTA</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">Ready to streamline assignment operations with a cleaner, stronger workflow?</h2>
              <p className="mt-4 text-base leading-8 text-white/85">
                Bring registration, assignment publishing, submissions, grading, and administration into one organized platform.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register?role=student"
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                Start as student
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-white/75 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                Open login
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/70 px-6 py-8 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Developer</p>
            <div className="mt-3 flex items-center gap-3">
              <img
                src="https://github.com/puloksingha.png"
                alt="Pulok Singha"
                className="h-16 w-16 rounded-full border border-slate-300 object-cover dark:border-slate-700"
                loading="lazy"
              />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Pulok Singha</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Full-Stack MERN Developer</p>
                <div className="mt-1 flex gap-3 text-sm">
                  <a
                    href="https://github.com/puloksingha"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/pulok-singha"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    LinkedIn
                  </a>
                </div>
                <a
                  href="mailto:puloksingha.dev@gmail.com"
                  className="mt-1 block text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  puloksingha.dev@gmail.com
                </a>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">System Design Contributor</p>
            <div className="mt-3 flex items-center gap-3">
              <img
                src={ahnafImage}
                alt="Ahnaf Tahmid Laskar"
                className="h-16 w-16 rounded-full border border-slate-300 object-cover dark:border-slate-700"
                loading="lazy"
              />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Ahnaf Tahmid Laskar</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">System Design Contributor</p>
                <div className="mt-1 flex gap-3 text-sm">
                  <a
                    href="https://www.linkedin.com/in/ahnaf-tahmid-9595b4314/"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-cyan-700 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>
        <p className="mx-auto mt-6 w-full max-w-6xl text-center text-xs text-slate-500 dark:text-slate-400">
          Copyright ManageX. All rights reserved.
        </p>
        <p className="mx-auto mt-2 w-full max-w-6xl text-center text-sm text-slate-600 dark:text-slate-300">
          Administrative access is available through the dedicated <Link to="/login?role=admin" className="font-semibold text-emerald-700 dark:text-emerald-400">Admin Login</Link>.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
