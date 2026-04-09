import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLogo from "./AppLogo";

const DashboardIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 5.5h7v5H4v-5zm9 0h7v8h-7v-8zM4 12.5h7V20H4v-7.5zm9 3.5h7V20h-7v-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ProfileIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LogoutIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M15 16l4-4-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 5H7a2 2 0 00-2 2v10a2 2 0 002 2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const linksByRole = {
  student: [
    { to: "/student", label: "Dashboard", icon: DashboardIcon },
    { to: "/profile", label: "Profile", icon: ProfileIcon }
  ],
  department: [
    { to: "/department", label: "Dashboard", icon: DashboardIcon },
    { to: "/profile", label: "Profile", icon: ProfileIcon }
  ],
  teacher: [
    { to: "/department", label: "Dashboard", icon: DashboardIcon },
    { to: "/profile", label: "Profile", icon: ProfileIcon }
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: DashboardIcon },
    { to: "/profile", label: "Profile", icon: ProfileIcon }
  ]
};

const roleLabelMap = {
  student: "Student",
  department: "Department",
  teacher: "Department",
  admin: "Admin"
};

const Sidebar = ({ isCollapsed = false, mobileOpen = false, onCloseMobile, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = linksByRole[user?.role] || [];
  const roleLabel = roleLabelMap[user?.role] || "Member";
  const showLabels = !isCollapsed || mobileOpen;
  const sidebarWidth = mobileOpen ? 220 : isCollapsed ? 60 : 220;
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
      style={{ width: `${sidebarWidth}px`, transition: "width 0.25s ease" }}
      className={`fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col overflow-x-hidden border-r border-emerald-900/30 bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 px-3 py-4 text-white shadow-2xl transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <AppLogo to="/app" compact={isCollapsed && !mobileOpen} className="min-w-0 text-white" light />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white transition hover:bg-[rgba(255,255,255,0.07)] md:inline-flex"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              <path d="M12 5l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 bg-white/10 px-3 text-[13px] font-semibold text-white transition hover:bg-[rgba(255,255,255,0.07)] md:hidden"
          >
            Close
          </button>
        </div>
      </div>

      <section className={`mt-6 rounded-lg border border-white/10 bg-white/10 p-3 shadow-[0_2px_8px_rgba(0,0,0,0.18)] ${showLabels ? "" : "px-2"}`}>
        <div className={`flex items-center gap-3 ${showLabels ? "" : "justify-center"}`}>
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 text-sm font-black tracking-[0.2em]">
            {initials}
          </div>
          {showLabels ? (
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold uppercase tracking-[0.18em] text-emerald-200">{roleLabel}</p>
              <p className="mt-1 truncate text-[13px] font-semibold text-white">{user?.name || "ManageX User"}</p>
              <p className="truncate text-[13px] text-white/65">{user?.email || "No email"}</p>
            </div>
          ) : null}
        </div>
      </section>

      <nav className="mt-6 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onCloseMobile}
              title={!showLabels ? link.label : undefined}
              className={({ isActive }) =>
                `group flex items-center rounded-lg px-3 py-3 text-[13px] font-semibold transition ${
                  showLabels ? "gap-3 justify-start" : "justify-center"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
                    : "text-white/80 hover:bg-[rgba(255,255,255,0.07)] hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {showLabels ? <span>{link.label}</span> : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        {showLabels ? (
          <article className="rounded-lg border border-white/10 bg-white/10 p-4 text-[13px] text-white/75 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
            <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-emerald-200">Quick access</p>
            <p className="mt-2 leading-6">Use the dashboard for workflow activity and profile settings for account-level updates.</p>
          </article>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          title={!showLabels ? "Logout" : undefined}
          className={`flex w-full items-center rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-[13px] font-semibold text-white transition hover:bg-[rgba(255,255,255,0.07)] ${
            showLabels ? "gap-3 justify-start" : "justify-center"
          }`}
        >
          <LogoutIcon className="h-5 w-5 shrink-0" />
          {showLabels ? <span>Logout</span> : null}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
