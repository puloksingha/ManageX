import { Link } from "react-router-dom";
import AppLogo from "../components/AppLogo";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <AppLogo />
        <nav className="flex gap-3">
          <Link className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold" to="/login">
            Login
          </Link>
          <Link className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white" to="/register">
            Register
          </Link>
        </nav>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-14 pt-8 lg:grid-cols-2">
        <section>
          <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Production-ready college workflow
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">Assignment management for Students, Teachers, and Admins.</h2>
          <p className="mt-4 max-w-xl text-slate-600 dark:text-slate-300">
            Secure authentication, verified email onboarding, file submissions, grading, profile management, and role-based control from a single platform.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/register?role=student" className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white">
              Student Register
            </Link>
            <Link to="/register?role=teacher" className="rounded-lg border border-slate-300 px-5 py-3 font-semibold">
              Teacher Register
            </Link>
            <Link to="/register?role=admin" className="rounded-lg border border-slate-300 px-5 py-3 font-semibold">
              Admin Register
            </Link>
          </div>
        </section>

        <section className="grid gap-4">
          <article className="rounded-2xl bg-white p-5 shadow dark:bg-slate-900">
            <h3 className="text-lg font-bold">Student Portal</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">View assignments, upload submissions, track status and grades.</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow dark:bg-slate-900">
            <h3 className="text-lg font-bold">Teacher Workspace</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Create assignments, review uploads, and grade with feedback.</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow dark:bg-slate-900">
            <h3 className="text-lg font-bold">Admin Control Center</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Manage users, departments, classes, and system audit trails.</p>
          </article>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/70 px-6 py-8 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-4">
            <img
              src="https://github.com/puloksingha.png"
              alt="Pulok Singha"
              className="h-14 w-14 rounded-full border border-slate-300 object-cover dark:border-slate-700"
              loading="lazy"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">© 2026 Pulok Singha</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Full-Stack MERN Developer</p>
            </div>
          </div>
          <a
            href="mailto:puloksingha.dev@gmail.com"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            puloksingha.dev@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
