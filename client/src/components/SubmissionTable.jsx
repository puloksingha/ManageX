import { resolveAssetUrl } from "../api/client";
import { getAssetActionLabel, getAssetDisplayName } from "../utils/assets";

const statusStyles = {
  Submitted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  Graded: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  Late: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
};

const SubmissionTable = ({ rows = [], selectedId = "", onSelect }) => {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/70 bg-white/85 shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
      <div className="grid gap-3 p-3 xl:hidden">
        {rows.map((row) => {
          const isSelected = selectedId === row._id;

          return (
            <article
              key={row._id}
              className={`relative rounded-lg border p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition ${
                isSelected
                  ? "border-emerald-300 bg-emerald-50/90 shadow-md dark:border-emerald-700 dark:bg-emerald-950/20"
                  : "border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-950/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-slate-100">{row.student?.name || "-"}</p>
                  <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{row.assignment?.title || "-"}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[row.status] || statusStyles.Pending}`}>
                  {row.status || "Pending"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Marks</p>
                  <p className="mt-1 text-[13px] font-semibold text-slate-800 dark:text-slate-100">{row.marks ?? "-"}</p>
                </div>
                <div>
                  <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Attachment</p>
                  {row.fileUrl ? (
                    <a
                      href={resolveAssetUrl(row.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex text-[13px] font-semibold text-emerald-600 hover:underline"
                    >
                      {getAssetActionLabel({ type: row.fileType, url: row.fileUrl })}
                    </a>
                  ) : (
                    <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">No file</p>
                  )}
                  {row.fileUrl ? <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{getAssetDisplayName({ name: row.fileName, url: row.fileUrl })}</p> : null}
                </div>
              </div>

              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(row._id)}
                  className={`mt-4 w-full rounded-lg px-4 py-3 text-[13px] font-semibold transition ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {isSelected ? "Selected for grading" : "Select for grading"}
                </button>
              ) : null}
            </article>
          );
        })}

        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-[13px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No submissions available yet.
          </div>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead className="bg-slate-50/90 text-slate-600 dark:bg-slate-950/70 dark:text-slate-200">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Assignment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Marks</th>
              <th className="px-4 py-3">File</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row._id}
                className={`border-t border-slate-200/80 transition dark:border-slate-800 ${
                  selectedId === row._id ? "bg-emerald-50/70 dark:bg-emerald-950/10" : ""
                } ${onSelect ? "cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40" : ""}`}
                onClick={onSelect ? () => onSelect(row._id) : undefined}
              >
                <td className="px-4 py-4 font-medium text-slate-800 dark:text-slate-100">{row.student?.name || "-"}</td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{row.assignment?.title || "-"}</td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[row.status] || statusStyles.Pending}`}>
                    {row.status || "Pending"}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{row.marks ?? "-"}</td>
                <td className="px-4 py-4">
                  {row.fileUrl ? (
                    <a
                      href={resolveAssetUrl(row.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-emerald-600 hover:underline"
                    >
                      {getAssetActionLabel({ type: row.fileType, url: row.fileUrl })}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-slate-500 dark:text-slate-400" colSpan={5}>
                  No submissions available yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmissionTable;
