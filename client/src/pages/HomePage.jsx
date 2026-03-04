import { Link } from "react-router-dom";
import AppLogo from "../components/AppLogo";
import ahnafImage from "../assets/ahnaf.png";

const HomePage = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-emerald-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="pointer-events-none absolute -left-12 top-16 h-44 w-44 rounded-full bg-emerald-300/40 blur-3xl pulse-soft dark:bg-emerald-700/30" />
      <div className="pointer-events-none absolute right-0 top-40 h-52 w-52 rounded-full bg-cyan-300/40 blur-3xl float-slow dark:bg-cyan-700/30" />

      <header className="mx-auto flex w-full max-w-6xl animate-fade-up items-center justify-between px-6 py-6">
        <AppLogo />
        <nav className="flex gap-3">
          <Link className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-sm" to="/login">
            Login
          </Link>
          <Link
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30"
            to="/register"
          >
            Register
          </Link>
        </nav>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-14 pt-8 lg:grid-cols-2 lg:items-start">
        <section className="animate-fade-up delay-1">
          <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            Production-ready college workflow
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Assignment management for Students, Departments, and Admins.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Secure authentication, verified email onboarding, file submissions, grading, profile management, and role-based
            control from a single platform.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/register?role=student"
              className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 sm:text-base"
            >
              Student Register
            </Link>
            <Link
              to="/register?role=department"
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white/60 hover:shadow-sm dark:border-slate-700 dark:hover:bg-slate-800/60 sm:text-base"
            >
              Department Register
            </Link>
          </div>
        </section>

        <section className="grid gap-4">
          <article className="animate-fade-up delay-2 tilt-3d rounded-2xl bg-white p-5 shadow hover:shadow-lg dark:bg-slate-900">
            <h3 className="text-lg font-bold">Student Portal</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">View assignments, upload submissions, track status and grades.</p>
          </article>
          <article className="animate-fade-up delay-3 tilt-3d rounded-2xl bg-white p-5 shadow hover:shadow-lg dark:bg-slate-900">
            <h3 className="text-lg font-bold">Department Workspace</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Create assignments, review uploads, and grade with feedback.</p>
          </article>
          <article className="animate-fade-up delay-4 tilt-3d rounded-2xl bg-white p-5 shadow hover:shadow-lg dark:bg-slate-900">
            <h3 className="text-lg font-bold">Admin Control Center</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Manage users, departments, classes, and system audit trails.</p>
          </article>
        </section>
      </main>

      <footer className="animate-fade-up delay-5 border-t border-slate-200 bg-white/70 px-6 py-8 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
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
          © manageX. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
