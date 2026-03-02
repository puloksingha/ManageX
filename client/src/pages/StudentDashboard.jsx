import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Bar } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  BarElement,
  Tooltip
} from "chart.js";
import DashboardLayout from "../layouts/DashboardLayout";
import AssignmentCard from "../components/AssignmentCard";
import { api, apiOrigin } from "../api/client";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const StudentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);

  const load = async () => {
    const [aRes, sRes] = await Promise.all([api.get("/assignments"), api.get("/submissions")]);
    setAssignments(aRes.data.assignments || []);
    setSubmissions(sRes.data.submissions || []);
    if (!selectedAssignment && aRes.data.assignments?.length) {
      setSelectedAssignment(aRes.data.assignments[0]._id);
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
      const fd = new FormData();
      fd.append("assignment", selectedAssignment);
      fd.append("notes", notes);
      fd.append("file", file);
      await api.post("/submissions", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setFile(null);
      setNotes("");
      toast.success("Submission uploaded");
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed");
    }
  };

  const stats = useMemo(() => {
    const upcoming = assignments.filter((a) => new Date(a.dueDate) >= new Date()).length;
    const graded = submissions.filter((s) => s.status === "Graded").length;
    const late = submissions.filter((s) => s.status === "Late").length;
    return { upcoming, graded, total: submissions.length, late };
  }, [assignments, submissions]);

  const chartData = {
    labels: ["Upcoming", "Graded", "Late", "Total Submissions"],
    datasets: [
      {
        label: "Student stats",
        data: [stats.upcoming, stats.graded, stats.late, stats.total],
        backgroundColor: ["#21b66f", "#0ea5e9", "#ef4444", "#f59e0b"]
      }
    ]
  };

  return (
    <DashboardLayout title="Student Dashboard">
      <section className="grid gap-4 lg:grid-cols-3">
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
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold">Upload Assignment</h2>
          <form className="space-y-3" onSubmit={submitAssignment}>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
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
            <textarea
              className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <input
              type="file"
              accept=".pdf,.docx,.zip"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full"
            />
            <button className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white">Submit</button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold">Submission Overview</h2>
          <div className="max-w-xl">
            <Bar data={chartData} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold">My Submission Results</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-3 py-2">Assignment</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Grade</th>
                <th className="px-3 py-2">Teacher Comment</th>
                <th className="px-3 py-2">My File</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2">{submission.assignment?.title || "-"}</td>
                  <td className="px-3 py-2">{submission.status}</td>
                  <td className="px-3 py-2">
                    {submission.status === "Graded"
                      ? `${submission.marks ?? "-"} / ${submission.assignment?.maxMarks ?? "-"}`
                      : "Pending review"}
                  </td>
                  <td className="px-3 py-2">{submission.feedback || "-"}</td>
                  <td className="px-3 py-2">
                    {submission.fileUrl ? (
                      <a
                        href={`${apiOrigin}${submission.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-emerald-600 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td className="px-3 py-5 text-center text-slate-500" colSpan={5}>
                    No submissions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  );
};

export default StudentDashboard;
