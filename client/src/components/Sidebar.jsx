import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLogo from "./AppLogo";

const linksByRole = {
  student: [
    { to: "/student", label: "Dashboard" },
    { to: "/profile", label: "Profile" }
  ],
  teacher: [
    { to: "/teacher", label: "Dashboard" },
    { to: "/profile", label: "Profile" }
  ],
  admin: [
    { to: "/admin", label: "Dashboard" },
    { to: "/profile", label: "Profile" }
  ]
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-full border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:w-64">
      <AppLogo to="/app" compact />
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{user?.role}</p>

      <nav className="mt-6 space-y-2">
        {(linksByRole[user?.role] || []).map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium ${
                isActive
                  ? "bg-brand-100 text-brand-900 dark:bg-brand-700 dark:text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-8 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
