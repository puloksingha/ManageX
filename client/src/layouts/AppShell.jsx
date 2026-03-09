import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLogo from "../components/AppLogo";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const dashboardHomeByRole = {
  student: "/student",
  department: "/department",
  teacher: "/department",
  admin: "/admin",
};

const roleLabelMap = {
  student: "Student workspace",
  department: "Department workspace",
  teacher: "Department workspace",
  admin: "Admin workspace",
};

const AppShell = ({ title, children }) => {
  const { user } = useAuth();
  const [dark, setDark] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("managex-theme");
    if (savedTheme === "dark") {
      setDark(true);
      return;
    }
    if (savedTheme === "light") {
      setDark(false);
      return;
    }
    setDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("managex-theme", dark ? "dark" : "light");
  }, [dark]);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date()),
    []
  );

  const roleLabel = roleLabelMap[user?.role] || "Workspace";
  const identityPills = [
    roleLabel,
    user?.department ? `Department: ${user.department}` : "Campus workspace",
    user?.emailVerified ? "Verified account" : "Verification pending",
  ];

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
        <div className="md:flex">
          {mobileSidebarOpen ? (
            <button
              type="button"
              aria-label="Close menu overlay"
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden"
            />
          ) : null}

          <Sidebar
            collapsed={sidebarCollapsed}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          />

          <main className="relative min-w-0 flex-1 overflow-x-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_58%)] dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_58%)]" />
            <div className="pointer-events-none absolute right-0 top-24 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-700/20" />
            <div className="relative mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(true)}
                    className="rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 md:hidden"
                  >
                    Menu
                  </button>
                  <AppLogo to="/app" compact className="hidden sm:inline-flex md:hidden" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">
                      ManageX Control Layer
                    </p>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">{title}</h1>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden rounded-xl border border-white/70 bg-white/70 px-4 py-2 text-right shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 sm:block">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Today</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{todayLabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDark((prev) => !prev)}
                    className="rounded-xl border border-slate-300 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
                  >
                    {dark ? "Light mode" : "Dark mode"}
                  </button>
                </div>
              </div>

              <section className="mb-6 overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-xl shadow-emerald-100/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/75 dark:shadow-none md:p-7">
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">
                      ManageX Workspace
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl">
                      Welcome back, {user?.name || "User"}.
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base">
                      This workspace keeps assignments, submissions, grading, and academic operations organized in one place.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {identityPills.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-slate-200 bg-slate-50/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <article className="rounded-3xl bg-gradient-to-br from-emerald-600 to-cyan-600 p-5 text-white shadow-lg shadow-emerald-500/20">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">Workspace status</p>
                      <p className="mt-2 text-xl font-black">Operational and up to date</p>
                      <p className="mt-2 text-sm leading-6 text-white/85">
                        Access dashboards, profile controls, and daily workflow actions from a single interface.
                      </p>
                    </article>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                      <Link
                        to={dashboardHomeByRole[user?.role] || "/app"}
                        className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100 dark:hover:border-emerald-800"
                      >
                        Open dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100 dark:hover:border-cyan-800"
                      >
                        Edit profile
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">{children}</section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
