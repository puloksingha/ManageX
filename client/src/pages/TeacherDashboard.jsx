import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import SubmissionTable from "../components/SubmissionTable";
import GradeForm from "../components/GradeForm";
import { api } from "../api/client";

const TeacherDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selected, setSelected] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    subject: "",
    batch: "",
    dueDate: "",
    maxMarks: 100
  });

  const load = async () => {
    const [subRes, subjectRes, batchRes] = await Promise.all([
      api.get("/submissions"),
      api.get("/meta/subjects"),
      api.get("/meta/batches")
    ]);
    setSubmissions(subRes.data.submissions || []);
    setSubjects(subjectRes.data.subjects || []);
    setBatches(batchRes.data.batches || []);

    if (!selected && subRes.data.submissions?.length) {
      setSelected(subRes.data.submissions[0]._id);
    }
    if (!assignmentForm.subject && subjectRes.data.subjects?.length) {
      setAssignmentForm((p) => ({ ...p, subject: subjectRes.data.subjects[0]._id }));
    }
    if (!assignmentForm.batch && batchRes.data.batches?.length) {
      setAssignmentForm((p) => ({ ...p, batch: batchRes.data.batches[0]._id }));
    }
  };

  useEffect(() => {
    load().catch(() => {
      setSubmissions([]);
      setSubjects([]);
      setBatches([]);
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

  const createAssignment = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(assignmentForm).forEach(([k, v]) => fd.append(k, v));
      if (attachment) fd.append("attachments", attachment);

      await api.post("/assignments", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setAssignmentForm({
        title: "",
        description: "",
        subject: subjects[0]?._id || "",
        batch: batches[0]?._id || "",
        dueDate: "",
        maxMarks: 100
      });
      setAttachment(null);
      toast.success("Assignment created");
    } catch (error) {
      toast.error(error.response?.data?.message || "Assignment create failed");
    }
  };

  return (
    <DashboardLayout title="Teacher Dashboard">
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Student Submissions</h2>
          <SubmissionTable rows={submissions} />

          <div className="mt-4">
            <h2 className="mb-3 text-lg font-semibold">Grade Submission</h2>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">Select a submission</option>
              {submissions.map((row) => (
                <option key={row._id} value={row._id}>
                  {row.student?.name} - {row.assignment?.title}
                </option>
              ))}
            </select>
            <GradeForm onSubmit={onGrade} />
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Create Assignment</h2>
          <form onSubmit={createAssignment} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              placeholder="Title"
              value={assignmentForm.title}
              onChange={(e) => setAssignmentForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
            <textarea
              className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              placeholder="Description"
              value={assignmentForm.description}
              onChange={(e) => setAssignmentForm((p) => ({ ...p, description: e.target.value }))}
              required
            />
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              value={assignmentForm.subject}
              onChange={(e) => setAssignmentForm((p) => ({ ...p, subject: e.target.value }))}
              required
            >
              <option value="">Subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>{subject.name}</option>
              ))}
            </select>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              value={assignmentForm.batch}
              onChange={(e) => setAssignmentForm((p) => ({ ...p, batch: e.target.value }))}
              required
            >
              <option value="">Batch</option>
              {batches.map((batch) => (
                <option key={batch._id} value={batch._id}>{batch.name}</option>
              ))}
            </select>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              type="datetime-local"
              value={assignmentForm.dueDate}
              onChange={(e) => setAssignmentForm((p) => ({ ...p, dueDate: e.target.value }))}
              required
            />
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              type="number"
              min="1"
              value={assignmentForm.maxMarks}
              onChange={(e) => setAssignmentForm((p) => ({ ...p, maxMarks: e.target.value }))}
              required
            />
            <input type="file" accept=".pdf,.docx,.zip" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />

            <button className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white">Create Assignment</button>
          </form>
        </div>
      </section>
    </DashboardLayout>
  );
};

export default TeacherDashboard;