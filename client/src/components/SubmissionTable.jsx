import { apiOrigin } from "../api/client";

const statusStyles = {
  Submitted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  Graded: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  Late: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
};

const SubmissionTable = ({ rows = [] }) => {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/85 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
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
              <tr key={row._id} className="border-t border-slate-200/80 dark:border-slate-800">
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
                      href={`${apiOrigin}${row.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-emerald-600 hover:underline"
                    >
                      Open file
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
