import { resolveAssetUrl } from "../api/client";
import { getAssetActionLabel, getAssetDisplayName } from "../utils/assets";

const statusStyles = {
  Submitted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  Graded: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  Late: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  Overdue: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  Open: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
};

const AssignmentCard = ({ title, subject, dueDate, status, attachments = [], attachmentDetails = [] }) => {
  const due = dueDate ? new Date(dueDate) : null;
  const dueLabel = due && !Number.isNaN(due.getTime()) ? due.toLocaleString() : "No due date";
  const primaryAttachment = attachmentDetails[0] || (attachments[0] ? { url: attachments[0] } : null);

  return (
    <article className="group rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/85">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{subject || "General subject"}</p>
          <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || statusStyles.Pending}`}>
          {status || "Pending"}
        </span>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50/90 p-4 dark:bg-slate-950/70">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Due date</p>
        <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">{dueLabel}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-300">
          {attachments.length ? `${attachments.length} attachment${attachments.length > 1 ? "s" : ""}` : "No attachment"}
        </p>
        {primaryAttachment ? (
          <a
            href={resolveAssetUrl(primaryAttachment.url)}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300"
          >
            {getAssetActionLabel(primaryAttachment)}
          </a>
        ) : null}
      </div>
      {primaryAttachment ? (
        <p className="mt-3 truncate text-xs text-slate-500 dark:text-slate-400">{getAssetDisplayName(primaryAttachment)}</p>
      ) : null}
    </article>
  );
};

export default AssignmentCard;
