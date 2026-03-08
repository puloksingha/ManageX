import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Bar } from "react-chartjs-2";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import DashboardLayout from "../layouts/DashboardLayout";
import AssignmentCard from "../components/AssignmentCard";
import { api, apiOrigin } from "../api/client";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const statusStyles = {
  Submitted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  Graded: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  Late: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
};

const toneStyles = {
  emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/20",
  cyan: "from-cyan-500 to-cyan-600 shadow-cyan-500/20",
  amber: "from-amber-500 to-amber-600 shadow-amber-500/20",
  slate: "from-slate-700 to-slate-900 shadow-slate-500/20",
};

const SummaryCard = ({ label, value, description, tone }) => (
  <article className={`rounded-[1.75rem] bg-gradient-to-br ${toneStyles[tone]} p-5 text-white shadow-lg`}>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{label}</p>
    <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
    <p className="mt-3 text-sm leading-6 text-white/80">{description}</p>
  </article>
);

const StudentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);

  const load = async () => {
    const [assignmentResponse, submissionResponse] = await Promise.all([api.get("/assignments"), api.get("/submissions")]);
    const nextAssignments = assignmentResponse.data.assignments || [];
    setAssignments(nextAssignments);
    setSubmissions(submissionResponse.data.submissions || []);
    if (!selectedAssignment && nextAssignments.length) {
      setSelectedAssignment(nextAssignments[0]._id);
    }
  };

  useEffect(() => {
    load().catch(() => {
      setAssignments([]);
      setSubmissions([]);
    });
  }, []);

  const submitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedAssignment || !file) {
      toast.error("Choose assignment and file");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("assignment", selectedAssignment);
      payload.append("notes", notes);
      payload.append("file", file);
      await api.post("/submissions", payload, { headers: { "Content-Type": "multipart/form-data" } });
      setFile(null);
      setNotes("");
      toast.success("Submission uploaded");
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed");
    }
  };

  const selectedAssignmentData = useMemo(
    () => assignments.find((assignment) => assignment._id === selectedAssignment),
    [assignments, selectedAssignment]
  );

  const upcomingAssignments = useMemo(
    () =>
      [...assignments]
        .filter((assignment) => new Date(assignment.dueDate).getTime() >= Date.now())
        .sort((left, right) => new Date(left.dueDate) - new Date(right.dueDate)),
    [assignments]
  );

  const stats = useMemo(() => {
    const graded = submissions.filter((submission) => submission.status === "Graded").length;
    const late = submissions.filter((submission) => submission.status === "Late").length;
    const pendingReview = submissions.filter((submission) => submission.status !== "Graded").length;
    return {
      upcoming: upcomingAssignments.length,
      graded,
      total: submissions.length,
      late,
      pendingReview,
    };
  }, [submissions, upcomingAssignments]);

  const chartData = {
    labels: ["Upcoming", "Graded", "Pending Review", "Late"],
    datasets: [
      {
        label: "Student stats",
        data: [stats.upcoming, stats.graded, stats.pendingReview, stats.late],
        backgroundColor: ["#21b66f", "#06b6d4", "#f59e0b", "#ef4444"],
        borderRadius: 10,
      },
    ],
  };

  return (
    <DashboardLayout title="Student Dashboard">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Upcoming" value={stats.upcoming} description="Assignments still open for submission." tone="emerald" />
        <SummaryCard label="Submitted" value={stats.total} description="Files you have already uploaded." tone="slate" />
        <SummaryCard label="Graded" value={stats.graded} description="Results ready to review and discuss." tone="cyan" />
        <SummaryCard label="Late" value={stats.late} description="Submissions that need immediate attention." tone="amber" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Submission center</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Upload your assignment</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Pick the assignment, attach your file, and keep a short note for the department if needed.
              </p>
            </div>
            {selectedAssignmentData ? (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                Due {new Date(selectedAssignmentData.dueDate).toLocaleString()}
              </div>
            ) : null}
          </div>

          <form className="mt-6 grid gap-4" onSubmit={submitAssignment}>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
            >
              <option value="">Select assignment</option>
              {assignments.map((assignment) => (
                <option key={assignment._id} value={assignment._id}>
                  {assignment.title}
                </option>
              ))}
            </select>

            {selectedAssignmentData ? (
              <div className="rounded-[1.5rem] bg-slate-50/90 p-4 dark:bg-slate-950/70">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-white dark:bg-slate-100 dark:text-slate-900">
                    {selectedAssignmentData.subject?.name || "Subject"}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                    Max marks: {selectedAssignmentData.maxMarks ?? "-"}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {selectedAssignmentData.description || "No description provided for this assignment."}
                </p>
              </div>
            ) : null}

            <textarea
              className="min-h-28 w-full rounded-xl border border-slate-300 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
              placeholder="Notes for your submission"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-950/60">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Upload file</label>
              <input
                type="file"
                accept=".pdf,.docx,.zip"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-3 w-full text-sm"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Accepted formats: PDF, DOCX, ZIP</p>
            </div>
            <button className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500">
              Submit assignment
            </button>
          </form>
        </article>

        <div className="grid gap-6">
          <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-400">Overview</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Submission performance</h2>
            <div className="mt-6">
              <Bar
                data={chartData}
                options={{
                  plugins: { legend: { display: false } },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
                height={260}
              />
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Need attention</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Upcoming deadlines</h2>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                {upcomingAssignments.length} open
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {upcomingAssignments.slice(0, 4).map((assignment) => (
                <article key={assignment._id} className="rounded-2xl bg-slate-50/90 p-4 dark:bg-slate-950/70">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{assignment.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{assignment.subject?.name || "Subject not assigned"}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </article>
              ))}
              {upcomingAssignments.length === 0 ? (
                <p className="rounded-2xl bg-slate-50/90 p-4 text-sm text-slate-500 dark:bg-slate-950/70 dark:text-slate-400">
                  No upcoming assignments at the moment.
                </p>
              ) : null}
            </div>
          </article>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Assignments</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Available assignment list</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Showing the first {Math.min(assignments.length, 6)} assignments</p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {assignments.slice(0, 6).map((assignment) => (
            <AssignmentCard
              key={assignment._id}
              title={assignment.title}
              subject={assignment.subject?.name}
              dueDate={assignment.dueDate}
              status={assignment.status}
              attachments={assignment.attachments || []}
            />
          ))}
          {assignments.length === 0 ? (
            <p className="rounded-[1.75rem] bg-slate-50/90 p-6 text-sm text-slate-500 dark:bg-slate-950/70 dark:text-slate-400">
              No assignments are available right now.
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Results</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">My submission results</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track status, grades, and file history in one place.</p>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-3 py-3">Assignment</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Grade</th>
                <th className="px-3 py-3">Teacher Comment</th>
                <th className="px-3 py-3">My File</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-4 font-medium text-slate-800 dark:text-slate-100">{submission.assignment?.title || "-"}</td>
                  <td className="px-3 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[submission.status] || statusStyles.Pending}`}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-slate-600 dark:text-slate-300">
                    {submission.status === "Graded"
                      ? `${submission.marks ?? "-"} / ${submission.assignment?.maxMarks ?? "-"}`
                      : "Pending review"}
                  </td>
                  <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{submission.feedback || "-"}</td>
                  <td className="px-3 py-4">
                    {submission.fileUrl ? (
                      <a
                        href={`${apiOrigin}${submission.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-emerald-600 hover:underline"
                      >
                        View file
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
              {submissions.length === 0 ? (
                <tr>
                  <td className="px-3 py-8 text-center text-slate-500 dark:text-slate-400" colSpan={5}>
                    No submissions yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  );
};

export default StudentDashboard;
