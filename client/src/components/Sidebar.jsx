import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLogo from "./AppLogo";

const linksByRole = {
  student: [
    { to: "/student", label: "Dashboard", short: "DB" },
    { to: "/profile", label: "Profile", short: "PR" },
  ],
  department: [
    { to: "/department", label: "Dashboard", short: "DB" },
    { to: "/profile", label: "Profile", short: "PR" },
  ],
  teacher: [
    { to: "/department", label: "Dashboard", short: "DB" },
    { to: "/profile", label: "Profile", short: "PR" },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", short: "DB" },
    { to: "/profile", label: "Profile", short: "PR" },
  ],
};

const roleLabelMap = {
  student: "Student",
  department: "Department",
  teacher: "Department",
  admin: "Admin",
};

const Sidebar = ({ collapsed = false, mobileOpen = false, onCloseMobile, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = linksByRole[user?.role] || [];
  const roleLabel = roleLabelMap[user?.role] || "Member";
  const initials = (user?.name || "M")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    if (onCloseMobile) onCloseMobile();
    navigate("/login");
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-white/70 bg-white/90 p-4 shadow-2xl shadow-slate-200/70 backdrop-blur transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900/92 dark:shadow-none md:static md:translate-x-0 ${
        mobileOpen ? "translate-x-0" : ""
      } ${collapsed ? "md:w-24" : "md:w-72"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <AppLogo to="/app" compact={collapsed} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 md:inline-flex"
          >
            {collapsed ? (
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M12 5l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 md:hidden"
          >
            Close
          </button>
        </div>
      </div>

      <section
        className={`mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-4 text-white dark:border-slate-800 ${
          collapsed ? "md:px-2 md:py-4" : ""
        }`}
      >
        <div className={`flex items-center gap-3 ${collapsed ? "md:flex-col" : ""}`}>
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-sm font-black tracking-[0.2em]">
            {initials}
          </div>
          <div className={`${collapsed ? "md:text-center" : ""}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200/80">{roleLabel} Portal</p>
            {!collapsed ? <p className="mt-1 text-sm font-semibold">{user?.name || "ManageX User"}</p> : null}
            {!collapsed ? <p className="text-xs text-white/65">{user?.email || "No email"}</p> : null}
          </div>
        </div>
      </section>

      <nav className="mt-6 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onCloseMobile}
            title={collapsed ? link.label : undefined}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                collapsed ? "md:justify-center md:px-2" : ""
              } ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
              }`
            }
          >
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-bold ${
                collapsed ? "" : ""
              } ${
                "border-current/15 bg-current/10"
              }`}
            >
              {collapsed ? link.short : link.short}
            </span>
            {!collapsed ? <span>{link.label}</span> : null}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        {!collapsed ? (
          <article className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-slate-100">Presentation tip</p>
            <p className="mt-1 leading-6">Open the dashboard first, then walk through profile, assignment flow, and role control.</p>
          </article>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900 ${
            collapsed ? "md:px-2" : ""
          }`}
        >
          {collapsed ? "OUT" : "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
