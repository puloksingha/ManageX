const statusStyles = {
  Submitted: "bg-emerald-100 text-emerald-700",
  Graded: "bg-blue-100 text-blue-700",
  Pending: "bg-amber-100 text-amber-700",
  Late: "bg-rose-100 text-rose-700",
  Overdue: "bg-rose-100 text-rose-700",
  Open: "bg-sky-100 text-sky-700"
};

import { apiOrigin } from "../api/client";

const AssignmentCard = ({ title, subject, dueDate, status, attachments = [] }) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || statusStyles.Pending}`}>
          {status}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Subject: {subject || "-"}</p>
      <p className="text-sm text-slate-500 dark:text-slate-300">Due: {new Date(dueDate).toLocaleDateString()}</p>
      {attachments.length ? (
        <div className="mt-2">
          <a
            href={`${apiOrigin}${attachments[0]}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-emerald-600 hover:underline"
          >
            View attachment
          </a>
        </div>
      ) : null}
    </article>
  );
};

export default AssignmentCard;
