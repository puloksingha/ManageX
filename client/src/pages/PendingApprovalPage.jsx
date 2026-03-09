import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import AuthShell from "../layouts/AuthShell";
import { api } from "../api/client";

const statusCopy = {
  idle: {
    title: "Approval pending",
    description: "Your department account has been created, but dashboard access will be available only after admin approval.",
    tone: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
  },
  pending: {
    title: "Still waiting for approval",
    description: "The admin has not approved your department account yet. Please check again later.",
    tone: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
  },
  approved: {
    title: "Account approved",
    description: "Your department account is approved. You can return to login and access the dashboard now.",
    tone: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200",
  },
  "email-verification-required": {
    title: "Email verification required",
    description: "Verify your email address first. Approval status is checked only after email verification is complete.",
    tone: "border-cyan-300 bg-cyan-50 text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-200",
  },
  "not-required": {
    title: "Approval not required",
    description: "This account type does not require admin approval before login.",
    tone: "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  },
};

const PendingApprovalPage = () => {
  const [params] = useSearchParams();
  const email = params.get("email") || "";
  const [status, setStatus] = useState("idle");
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    if (!email) {
      toast.error("Email address is missing");
      return;
    }

    setChecking(true);
    try {
      const { data } = await api.post("/auth/approval-status", { email });
      setStatus(data.status || "pending");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to check approval status");
    } finally {
      setChecking(false);
    }
  };

  const current = statusCopy[status] || statusCopy.pending;

  return (
    <AuthShell title="Department Approval Status" subtitle="Check whether your account has been approved for dashboard access.">
      <div className={`mt-6 rounded-xl border px-4 py-4 ${current.tone}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em]">Status</p>
        <h2 className="mt-2 text-xl font-bold">{current.title}</h2>
        <p className="mt-2 text-sm leading-6">{current.description}</p>
        {email ? <p className="mt-3 text-sm font-medium">Email: {email}</p> : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={checkStatus}
          disabled={checking}
          className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {checking ? "Checking..." : "Check approval status"}
        </button>
        <Link
          to={status === "approved" ? `/login?role=department` : "/login?role=department"}
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          Back to login
        </Link>
        {status === "email-verification-required" ? (
          <Link
            to={`/verify-email?email=${encodeURIComponent(email)}`}
            className="rounded-xl border border-cyan-300 px-4 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-300 dark:hover:bg-cyan-950/30"
          >
            Verify email
          </Link>
        ) : null}
      </div>
    </AuthShell>
  );
};

export default PendingApprovalPage;
