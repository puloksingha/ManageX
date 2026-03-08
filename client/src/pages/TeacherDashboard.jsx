import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import SubmissionTable from "../components/SubmissionTable";
import GradeForm from "../components/GradeForm";
import { api, apiOrigin } from "../api/client";
import { useAuth } from "../context/AuthContext";

const toneStyles = {
  emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/20",
  cyan: "from-cyan-500 to-cyan-600 shadow-cyan-500/20",
  amber: "from-amber-500 to-amber-600 shadow-amber-500/20",
  slate: "from-slate-700 to-slate-900 shadow-slate-500/20",
};

const statusStyles = {
  Submitted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  Graded: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  Late: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  Open: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
};

const SummaryCard = ({ label, value, description, tone }) => (
  <article className={`rounded-[1.75rem] bg-gradient-to-br ${toneStyles[tone]} p-5 text-white shadow-lg`}>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{label}</p>
    <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
    <p className="mt-3 text-sm leading-6 text-white/80">{description}</p>
  </article>
);

const toDateTimeLocalInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [departmentAssignments, setDepartmentAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selected, setSelected] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState("");
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    subject: "",
    batch: "",
    dueDate: "",
    maxMarks: 100,
  });

  const load = async () => {
    const [subRes, subjectRes, batchRes, myAssignmentRes, departmentAssignmentRes] = await Promise.all([
      api.get("/submissions"),
      api.get("/meta/subjects"),
      api.get("/meta/batches"),
      api.get("/assignments?mine=true"),
      api.get("/assignments?departmentOnly=true"),
    ]);
    setSubmissions(subRes.data.submissions || []);
    setSubjects(subjectRes.data.subjects || []);
    setBatches(batchRes.data.batches || []);
    setMyAssignments(myAssignmentRes.data.assignments || []);
    setDepartmentAssignments(departmentAssignmentRes.data.assignments || []);

    if (!selected && subRes.data.submissions?.length) {
      setSelected(subRes.data.submissions[0]._id);
    }
    if (!assignmentForm.subject && subjectRes.data.subjects?.length) {
      setAssignmentForm((prev) => ({ ...prev, subject: subjectRes.data.subjects[0]._id }));
    }
    if (!assignmentForm.batch && batchRes.data.batches?.length) {
      setAssignmentForm((prev) => ({ ...prev, batch: batchRes.data.batches[0]._id }));
    }
  };

  useEffect(() => {
    load().catch(() => {
      setSubmissions([]);
      setSubjects([]);
      setBatches([]);
      setMyAssignments([]);
      setDepartmentAssignments([]);
    });
  }, []);

  const onGrade = async ({ marks, feedback }) => {
    if (!selected) return;
    try {
      await api.patch(`/submissions/${selected}/grade`, { marks: Number(marks), feedback });
      toast.success("Submission graded");
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to grade");
    }
  };

  const resetForm = () => {
    setEditingAssignmentId("");
    setAttachment(null);
    setAssignmentForm({
      title: "",
      description: "",
      subject: subjects[0]?._id || "",
      batch: batches[0]?._id || "",
      dueDate: "",
      maxMarks: 100,
    });
  };

  const startEdit = (assignment) => {
    setEditingAssignmentId(assignment._id);
    setAttachment(null);
    setAssignmentForm({
      title: assignment.title || "",
      description: assignment.description || "",
      subject: assignment.subject?._id || "",
      batch: assignment.batch?._id || "",
      dueDate: toDateTimeLocalInput(assignment.dueDate),
      maxMarks: assignment.maxMarks || 100,
    });
  };

  const createOrUpdateAssignment = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      Object.entries(assignmentForm).forEach(([key, value]) => payload.append(key, value));
      if (attachment) payload.append("attachments", attachment);

      if (editingAssignmentId) {
        await api.put(`/assignments/${editingAssignmentId}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Assignment updated");
      } else {
        await api.post("/assignments", payload, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Assignment created");
      }

      resetForm();
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Assignment save failed");
    }
  };

  const removeAssignment = async (id) => {
    const confirmed = window.confirm("Delete this assignment?");
    if (!confirmed) return;

    try {
      await api.delete(`/assignments/${id}`);
      toast.success("Assignment deleted");
      if (editingAssignmentId === id) {
        resetForm();
      }
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Assignment delete failed");
    }
  };

  const selectedSubmission = useMemo(
    () => submissions.find((submission) => submission._id === selected),
    [submissions, selected]
  );

  const summary = useMemo(() => {
    const pendingReview = submissions.filter((submission) => submission.status !== "Graded").length;
    const graded = submissions.filter((submission) => submission.status === "Graded").length;
    const activeAssignments = myAssignments.filter((assignment) => assignment.status === "Open").length;
    return {
      submissions: submissions.length,
      pendingReview,
      graded,
      activeAssignments,
      departmentAssignments: departmentAssignments.length,
    };
  }, [submissions, myAssignments, departmentAssignments]);

  return (
    <DashboardLayout title="Department Dashboard">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Submissions" value={summary.submissions} description="Student uploads currently visible to your workspace." tone="slate" />
        <SummaryCard label="Need review" value={summary.pendingReview} description="Submissions still waiting for grading or feedback." tone="amber" />
        <SummaryCard label="Graded" value={summary.graded} description="Completed reviews already returned to students." tone="cyan" />
        <SummaryCard label="My assignments" value={myAssignments.length} description="Assignments created directly by your account." tone="emerald" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-6">
          <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Review queue</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Student submissions</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Review files, pick a submission, and send marks with feedback from the same workspace.
                </p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                {summary.pendingReview} pending
              </span>
            </div>
            <div className="mt-6">
              <SubmissionTable rows={submissions} />
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-400">Grading panel</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Grade selected submission</h2>
              </div>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-3 dark:border-slate-700 dark:bg-slate-800 lg:max-w-sm"
              >
                <option value="">Select a submission</option>
                {submissions.map((row) => (
                  <option key={row._id} value={row._id}>
                    {row.student?.name} - {row.assignment?.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedSubmission ? (
              <div className="mt-6 rounded-[1.75rem] bg-slate-50/90 p-5 dark:bg-slate-950/70">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-white dark:bg-slate-100 dark:text-slate-900">
                    {selectedSubmission.student?.name || "Student"}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedSubmission.status] || statusStyles.Pending}`}>
                    {selectedSubmission.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Assignment</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {selectedSubmission.assignment?.title || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Current marks</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{selectedSubmission.marks ?? "-"}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {selectedSubmission.fileUrl ? (
                    <a
                      href={`${apiOrigin}${selectedSubmission.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300"
                    >
                      Open student file
                    </a>
                  ) : null}
                  <span className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
                    Max marks: {selectedSubmission.assignment?.maxMarks ?? "-"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[1.75rem] bg-slate-50/90 p-5 text-sm text-slate-500 dark:bg-slate-950/70 dark:text-slate-400">
                Select a submission to see details and grade it.
              </div>
            )}

            <div className="mt-6">
              <GradeForm onSubmit={onGrade} />
            </div>
          </article>
        </div>

        <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Assignment editor</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
            {editingAssignmentId ? "Update assignment" : "Create assignment"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Publish work for your department, set marks, and attach reference files if needed.
          </p>

          <form onSubmit={createOrUpdateAssignment} className="mt-6 space-y-4">
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
              placeholder="Title"
              value={assignmentForm.title}
              onChange={(e) => setAssignmentForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
            <textarea
              className="min-h-28 w-full rounded-xl border border-slate-300 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
              placeholder="Description"
              value={assignmentForm.description}
              onChange={(e) => setAssignmentForm((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
              value={assignmentForm.subject}
              onChange={(e) => setAssignmentForm((prev) => ({ ...prev, subject: e.target.value }))}
              required
            >
              <option value="">Subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
              value={assignmentForm.batch}
              onChange={(e) => setAssignmentForm((prev) => ({ ...prev, batch: e.target.value }))}
              required
            >
              <option value="">Batch</option>
              {batches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.name}
                </option>
              ))}
            </select>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
                type="datetime-local"
                value={assignmentForm.dueDate}
                onChange={(e) => setAssignmentForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
                type="number"
                min="1"
                value={assignmentForm.maxMarks}
                onChange={(e) => setAssignmentForm((prev) => ({ ...prev, maxMarks: e.target.value }))}
                required
              />
            </div>
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-950/60">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Reference attachment</label>
              <input type="file" accept=".pdf,.docx,.zip" onChange={(e) => setAttachment(e.target.files?.[0] || null)} className="mt-3 w-full text-sm" />
            </div>

            <div className="flex gap-2">
              <button className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500">
                {editingAssignmentId ? "Update Assignment" : "Create Assignment"}
              </button>
              {editingAssignmentId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 px-4 py-3 font-semibold dark:border-slate-700"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </article>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Owned by you</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">My assignments</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{summary.activeAssignments} currently open for students.</p>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-3 py-3">Title</th>
                <th className="px-3 py-3">Subject</th>
                <th className="px-3 py-3">Batch</th>
                <th className="px-3 py-3">Due</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myAssignments.map((assignment) => (
                <tr key={assignment._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-4 font-medium text-slate-800 dark:text-slate-100">{assignment.title}</td>
                  <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{assignment.subject?.name || "-"}</td>
                  <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{assignment.batch?.name || "-"}</td>
                  <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{new Date(assignment.dueDate).toLocaleString()}</td>
                  <td className="px-3 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[assignment.status] || statusStyles.Open}`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(assignment)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAssignment(assignment._id)}
                        className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-500"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {myAssignments.length === 0 ? (
                <tr>
                  <td className="px-3 py-8 text-center text-slate-500 dark:text-slate-400" colSpan={6}>
                    No assignments created yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Shared workspace</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
              Assignments in {user?.department || "your department"}
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{summary.departmentAssignments} visible across the department workspace.</p>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-3 py-3">Title</th>
                <th className="px-3 py-3">Subject</th>
                <th className="px-3 py-3">Owner</th>
                <th className="px-3 py-3">Batch</th>
                <th className="px-3 py-3">Due</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {departmentAssignments.map((assignment) => (
                <tr key={assignment._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-4 font-medium text-slate-800 dark:text-slate-100">{assignment.title}</td>
                  <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{assignment.subject?.name || "-"}</td>
                  <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{assignment.createdBy?.name || "-"}</td>
                  <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{assignment.batch?.name || "-"}</td>
                  <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{new Date(assignment.dueDate).toLocaleString()}</td>
                  <td className="px-3 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[assignment.status] || statusStyles.Open}`}>
                      {assignment.status}
                    </span>
                  </td>
                </tr>
              ))}
              {departmentAssignments.length === 0 ? (
                <tr>
                  <td className="px-3 py-8 text-center text-slate-500 dark:text-slate-400" colSpan={6}>
                    No assignments found for your department.
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

export default TeacherDashboard;
