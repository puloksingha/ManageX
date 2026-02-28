import { Link } from "react-router-dom";
import AppLogo from "../components/AppLogo";

const AuthShell = ({ title, subtitle, children, footer }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-cyan-50 px-4 py-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto flex w-full max-w-5xl justify-between pb-6">
        <AppLogo />
        <div className="flex items-center gap-2">
          <Link className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold dark:border-slate-700" to="/login">Login</Link>
          <Link className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white" to="/register">Register</Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md rounded-2xl bg-white/90 p-8 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p> : null}

        {children}

        {footer ? <div className="mt-5 text-sm text-slate-500 dark:text-slate-300">{footer}</div> : null}
      </div>
    </div>
  );
};

export default AuthShell;
