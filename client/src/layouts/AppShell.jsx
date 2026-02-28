import { useState } from "react";
import AppLogo from "../components/AppLogo";
import Sidebar from "../components/Sidebar";

const AppShell = ({ title, children }) => {
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen md:flex">
        <Sidebar />
        <main className="flex-1 bg-slate-100 p-4 dark:bg-slate-950 md:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AppLogo to="/app" compact className="md:hidden" />
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            <button
              type="button"
              onClick={() => setDark((prev) => !prev)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
            >
              {dark ? "Light" : "Dark"} mode
            </button>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
