import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLogo from "./AppLogo";

const linksByRole = {
  student: [
    { to: "/student", label: "Dashboard" },
    { to: "/profile", label: "Profile" }
  ],
  department: [
    { to: "/department", label: "Dashboard" },
    { to: "/profile", label: "Profile" }
  ],
  teacher: [
    { to: "/department", label: "Dashboard" },
    { to: "/profile", label: "Profile" }
  ],
  admin: [
    { to: "/admin", label: "Dashboard" },
    { to: "/profile", label: "Profile" }
  ]
};

const Sidebar = ({ collapsed = false, mobileOpen = false, onCloseMobile, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    if (onCloseMobile) onCloseMobile();
    navigate("/login");
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 -translate-x-full border-r border-slate-200 bg-white p-4 transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 md:static md:translate-x-0 ${
        mobileOpen ? "translate-x-0" : ""
      } ${collapsed ? "md:w-20" : "md:w-64"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <AppLogo to="/app" compact={collapsed} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-100 md:inline-flex"
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
            className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-100 md:hidden"
          >
            Close
          </button>
        </div>
      </div>

      <p className={`mt-1 text-sm text-slate-500 dark:text-slate-300 ${collapsed ? "hidden md:block md:text-center" : ""}`}>
        {collapsed ? String((user?.role === "teacher" ? "department" : user?.role) || "-").slice(0, 1).toUpperCase() : user?.role === "teacher" ? "department" : user?.role}
      </p>

      <nav className="mt-6 space-y-2">
        {(linksByRole[user?.role] || []).map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onCloseMobile}
            title={collapsed ? link.label : undefined}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium ${collapsed ? "md:text-center" : ""} ${
                isActive
                  ? "bg-brand-100 text-brand-900 dark:bg-brand-700 dark:text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              }`
            }
          >
            {collapsed ? link.label.slice(0, 2).toUpperCase() : link.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        title={collapsed ? "Logout" : undefined}
        className={`mt-8 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800 ${
          collapsed ? "md:text-center" : ""
        }`}
      >
        {collapsed ? "LO" : "Logout"}
      </button>
    </aside>
  );
};

export default Sidebar;

