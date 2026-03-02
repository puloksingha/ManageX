import { useState } from "react";
import { Link } from "react-router-dom";
import AppLogo from "../components/AppLogo";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const dashboardHomeByRole = {
  student: "/student",
  department: "/department",
  teacher: "/department",
  admin: "/admin"
};

const AppShell = ({ title, children }) => {
  const { user } = useAuth();
  const [dark, setDark] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen md:flex">
        {mobileSidebarOpen ? (
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
          />
        ) : null}

        <Sidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />

        <main className="flex-1 overflow-x-hidden bg-slate-100 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-100 md:hidden"
              >
                Menu
              </button>
              <AppLogo to="/app" compact className="hidden sm:inline-flex md:hidden" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
            </div>
            <button
              type="button"
              onClick={() => setDark((prev) => !prev)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-100"
            >
              {dark ? "Light" : "Dark"} mode
            </button>
          </div>

          <section className="mb-6 overflow-hidden rounded-2xl border border-emerald-300/70 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-4 text-white shadow-lg shadow-emerald-500/20 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">ManageX Workspace</p>
                <h2 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">Welcome back, {user?.name || "User"}</h2>
                <p className="mt-2 text-sm font-medium text-white/90 md:text-base">
                  Role: <span className="font-semibold capitalize">{user?.role === "teacher" ? "department" : user?.role || "member"}</span>
                  {user?.department ? ` | Department: ${user.department}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={dashboardHomeByRole[user?.role] || "/app"}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="rounded-xl border border-white/80 bg-white/15 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/25"
                >
                  Profile
                </Link>
              </div>
            </div>
          </section>

          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;

