import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLogo from "../components/AppLogo";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const MOBILE_BREAKPOINT = 640;
const DESKTOP_BREAKPOINT = 1024;

const MenuIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const HomeIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 11.5L12 5l8 6.5V20a1 1 0 01-1 1h-4.5v-5.5h-5V21H5a1 1 0 01-1-1v-8.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SunIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 2.5V5.2M12 18.8v2.7M21.5 12h-2.7M5.2 12H2.5M18.72 5.28l-1.91 1.91M7.19 16.81l-1.91 1.91M18.72 18.72l-1.91-1.91M7.19 7.19L5.28 5.28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const MoonIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M19.5 14.2A7.5 7.5 0 019.8 4.5a8.5 8.5 0 1010.2 9.7h-.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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

const getSavedCollapsedState = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const savedState = window.localStorage.getItem("managex-sidebar-collapsed");
  if (savedState === "true") return true;
  if (savedState === "false") return false;
  return null;
};

const getInitialCollapsed = () => {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.innerWidth <= DESKTOP_BREAKPOINT) {
    return true;
  }

  return getSavedCollapsedState() ?? false;
};

const AppShell = ({ title, children }) => {
  const { user } = useAuth();
  const [dark, setDark] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsed);

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

  useEffect(() => {
    const syncViewportState = () => {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        setIsCollapsed(true);
        setMobileSidebarOpen(false);
        return;
      }

      if (window.innerWidth <= DESKTOP_BREAKPOINT) {
        setIsCollapsed(true);
        setMobileSidebarOpen(false);
        return;
      }

      setIsCollapsed(getSavedCollapsedState() ?? false);
    };

    syncViewportState();
    window.addEventListener("resize", syncViewportState);

    return () => window.removeEventListener("resize", syncViewportState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth <= DESKTOP_BREAKPOINT) {
      return;
    }

    window.localStorage.setItem("managex-sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

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
  const workspaceHome = dashboardHomeByRole[user?.role] || "/app";

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex h-screen flex-row overflow-hidden bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
        <div className="flex h-full w-full flex-row overflow-hidden">
          {mobileSidebarOpen ? (
            <button
              type="button"
              aria-label="Close menu overlay"
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-[998] bg-black/50 backdrop-blur-sm sm:hidden"
            />
          ) : null}

          <Sidebar
            isCollapsed={isCollapsed}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          />

          <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
              <div className="relative rounded-lg border border-white/70 bg-white/90 px-3 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-4 sm:py-4">
                <div className="grid grid-cols-3 items-center gap-2 sm:hidden">
                  <div className="flex justify-start">
                    <button
                      type="button"
                      onClick={() => setMobileSidebarOpen(true)}
                      aria-label="Open navigation menu"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white/85 text-slate-700 shadow-sm backdrop-blur transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:hover:bg-slate-900"
                    >
                      <MenuIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="min-w-0 text-center">
                    <p className="truncate text-[clamp(15px,4vw,16px)] font-black tracking-tight text-slate-900 dark:text-slate-100">{title}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Link
                      to={workspaceHome}
                      aria-label="Open dashboard"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50/90 text-slate-800 transition hover:border-emerald-200 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100 dark:hover:border-emerald-800"
                    >
                      <HomeIcon className="h-5 w-5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDark((prev) => !prev)}
                      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white/80 text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
                    >
                      {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="hidden flex-col gap-3 sm:flex lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <AppLogo to={workspaceHome} compact className="hidden sm:inline-flex lg:hidden" />
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                        ManageX Control Layer
                      </p>
                      <h1 className="text-[clamp(18px,3vw,20px)] font-black tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
                      <p className="mt-1 text-[clamp(13px,2vw,16px)] text-slate-500 dark:text-slate-400">
                        {user?.department || "Campus workspace"} - {todayLabel}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Link
                        to={workspaceHome}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50/90 px-4 py-3 text-[clamp(13px,2vw,16px)] font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100 dark:hover:border-emerald-800"
                      >
                        <HomeIcon className="h-5 w-5" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDark((prev) => !prev)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white/80 px-4 py-3 text-[clamp(13px,2vw,16px)] font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
                      >
                        {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                        <span>{dark ? "Light mode" : "Dark mode"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <section className="relative overflow-hidden rounded-lg border border-white/70 bg-white/90 p-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:p-4 lg:p-6">
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
                  <div>
                    <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                      ManageX Workspace
                    </p>
                    <h2 className="mt-2 text-[clamp(18px,4vw,28px)] font-black tracking-tight text-slate-900 dark:text-slate-100">
                      Welcome back, {user?.name || "User"}.
                    </h2>
                    <p className="mt-3 max-w-2xl text-[clamp(13px,2vw,16px)] leading-6 text-slate-600 dark:text-slate-300">
                      This workspace keeps assignments, submissions, grading, and academic operations organized in one place.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {identityPills.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-slate-200 bg-slate-50/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <article className="relative rounded-lg bg-gradient-to-br from-emerald-600 to-cyan-600 p-3 text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] sm:p-4 lg:p-5">
                      <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-white/75">Workspace status</p>
                      <p className="mt-2 text-[clamp(15px,2.4vw,20px)] font-black">Operational and up to date</p>
                      <p className="mt-2 text-[clamp(13px,2vw,16px)] leading-6 text-white/85">
                        Access dashboards, profile controls, and daily workflow actions from a single interface.
                      </p>
                    </article>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                      <Link
                        to={workspaceHome}
                        className="rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-3 text-[clamp(13px,2vw,16px)] font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100 dark:hover:border-emerald-800 sm:px-4 sm:py-4"
                      >
                        Open dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-3 text-[clamp(13px,2vw,16px)] font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100 dark:hover:border-cyan-800 sm:px-4 sm:py-4"
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
