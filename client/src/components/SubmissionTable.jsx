const SubmissionTable = ({ rows = [] }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
          <tr>
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Assignment</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Marks</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id} className="border-t border-slate-200 dark:border-slate-800">
              <td className="px-4 py-3">{row.student?.name || "-"}</td>
              <td className="px-4 py-3">{row.assignment?.title || "-"}</td>
              <td className="px-4 py-3">{row.status}</td>
              <td className="px-4 py-3">{row.marks ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubmissionTable;