import { Link } from "react-router-dom";

const AppLogo = ({ to = "/", compact = false, className = "" }) => {
  return (
    <Link to={to} className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-lg font-black text-white shadow-lg shadow-emerald-500/25">
        M
      </span>
      {!compact && (
        <span>
          <span className="block text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">ManageX</span>
          <span className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-300">Smart Assignment Flow</span>
        </span>
      )}
    </Link>
  );
};

export default AppLogo;
