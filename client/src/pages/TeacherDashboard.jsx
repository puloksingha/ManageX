import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import SubmissionTable from "../components/SubmissionTable";
import GradeForm from "../components/GradeForm";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

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
    maxMarks: 100
  });

  const load = async () => {
    const [subRes, subjectRes, batchRes, myAssignmentRes, departmentAssignmentRes] = await Promise.all([
      api.get("/submissions"),
      api.get("/meta/subjects"),
      api.get("/meta/batches"),
      api.get("/assignments?mine=true"),
      api.get("/assignments?departmentOnly=true")
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
      maxMarks: 100
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
      maxMarks: assignment.maxMarks || 100
    });
  };

  const createOrUpdateAssignment = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(assignmentForm).forEach(([k, v]) => fd.append(k, v));
      if (attachment) fd.append("attachments", attachment);

      if (editingAssignmentId) {
        await api.put(`/assignments/${editingAssignmentId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Assignment updated");
      } else {
        await api.post("/assignments", fd, { headers: { "Content-Type": "multipart/form-data" } });
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

  return (
    <DashboardLayout title="Department Dashboard">
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
          <h2 className="mb-3 text-lg font-semibold">{editingAssignmentId ? "Edit Assignment" : "Create Assignment"}</h2>
          <form onSubmit={createOrUpdateAssignment} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
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

            <div className="flex gap-2">
              <button className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white">
                {editingAssignmentId ? "Update Assignment" : "Create Assignment"}
              </button>
              {editingAssignmentId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold dark:border-slate-700"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold">My Assignments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Batch</th>
                <th className="px-3 py-2">Due</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myAssignments.map((assignment) => (
                <tr key={assignment._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2">{assignment.title}</td>
                  <td className="px-3 py-2">{assignment.subject?.name || "-"}</td>
                  <td className="px-3 py-2">{assignment.batch?.name || "-"}</td>
                  <td className="px-3 py-2">{new Date(assignment.dueDate).toLocaleString()}</td>
                  <td className="px-3 py-2">{assignment.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(assignment)}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold dark:border-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAssignment(assignment._id)}
                        className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {myAssignments.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-center text-slate-500" colSpan={6}>
                    No assignments created yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold">Assignments In My Department ({user?.department || "Not set"})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Batch</th>
                <th className="px-3 py-2">Due</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {departmentAssignments.map((assignment) => (
                <tr key={assignment._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2">{assignment.title}</td>
                  <td className="px-3 py-2">{assignment.subject?.name || "-"}</td>
                  <td className="px-3 py-2">{assignment.createdBy?.name || "-"}</td>
                  <td className="px-3 py-2">{assignment.batch?.name || "-"}</td>
                  <td className="px-3 py-2">{new Date(assignment.dueDate).toLocaleString()}</td>
                  <td className="px-3 py-2">{assignment.status}</td>
                </tr>
              ))}
              {departmentAssignments.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-center text-slate-500" colSpan={6}>
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
