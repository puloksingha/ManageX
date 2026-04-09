import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import SubmissionTable from "../components/SubmissionTable";
import GradeForm from "../components/GradeForm";
import { api, resolveAssetUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { getAssetActionLabel, getAssetDisplayName } from "../utils/assets";

const toneStyles = {
  emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/20",
  cyan: "from-cyan-500 to-cyan-600 shadow-cyan-500/20",
  amber: "from-amber-500 to-amber-600 shadow-amber-500/20",
  slate: "from-sky-600 to-slate-800 shadow-slate-500/20",
  rose: "from-rose-500 to-rose-600 shadow-rose-500/20",
};

const statusStyles = {
  Submitted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  Graded: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  Late: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  Open: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
};

const panelClass =
  "relative rounded-lg border border-white/70 bg-white/90 p-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:p-4 lg:p-5";

const insetCardClass =
  "relative rounded-lg border border-slate-200 bg-slate-50/90 p-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:border-slate-800 dark:bg-slate-950/60 sm:p-4";

const eyebrowClass = "text-[14px] font-bold uppercase tracking-[0.18em]";
const sectionTitleClass = "mt-2 text-[clamp(15px,2.4vw,20px)] font-black text-slate-900 dark:text-slate-100";
const bodyTextClass = "text-[clamp(13px,2vw,16px)] leading-6";
const fieldClass = "w-full rounded-lg border border-slate-300 px-3 py-3 text-[clamp(13px,2vw,16px)] dark:border-slate-700 dark:bg-slate-800";

const submissionFilterOptions = [
  { id: "all", label: "All" },
  { id: "review", label: "Need review" },
  { id: "Graded", label: "Graded" },
  { id: "Late", label: "Late" },
];

const assignmentFilterOptions = [
  { id: "all", label: "All" },
  { id: "Open", label: "Open" },
  { id: "Overdue", label: "Overdue" },
];

const SummaryCard = ({ label, value, description, tone }) => (
  <article className={`relative min-h-[90px] rounded-lg bg-gradient-to-br ${toneStyles[tone]} p-3 text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] sm:p-4 lg:p-5`}>
    <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-white/72 sm:text-[14px]">{label}</p>
    <p className="mt-2 text-[clamp(20px,4vw,30px)] font-black tracking-tight">{value}</p>
    <p className="mt-2 text-[clamp(12px,2vw,14px)] leading-5 text-white/82 sm:leading-6">{description}</p>
  </article>
);

const FilterChip = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.16em] transition ${
      active
        ? "bg-slate-900 text-white shadow-md dark:bg-slate-100 dark:text-slate-900"
        : "border border-slate-200 bg-white/80 text-slate-600 hover:border-emerald-200 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:border-emerald-800 dark:hover:text-white"
    }`}
  >
    {children}
  </button>
);

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const toDateTimeLocalInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const renderAssignmentActions = (assignment, onEdit, onDelete) => (
  <div className="flex flex-wrap gap-2">
    <button
      type="button"
      onClick={() => onEdit(assignment)}
      className="rounded-lg border border-slate-300 px-3 py-2 text-[13px] font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
    >
      Edit
    </button>
    <button
      type="button"
      onClick={() => onDelete(assignment._id)}
      className="rounded-lg bg-rose-600 px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-rose-500"
    >
      Delete
    </button>
  </div>
);

const AssignmentSection = ({
  title,
  eyebrow,
  subtitle,
  assignments,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  emptyMessage,
  showActions = false,
  showOwner = false,
  onEdit,
  onDelete,
}) => (
  <section className={panelClass}>
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div className="min-w-0">
        <p className={`${eyebrowClass} text-emerald-700 dark:text-emerald-400`}>{eyebrow}</p>
        <h2 className={sectionTitleClass}>{title}</h2>
        <p className={`mt-2 text-slate-600 dark:text-slate-300 ${bodyTextClass}`}>{subtitle}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search title, subject, batch"
          className={fieldClass}
        />
        <div className="flex flex-wrap gap-2">
          {assignmentFilterOptions.map((option) => (
            <FilterChip key={option.id} active={statusFilter === option.id} onClick={() => onStatusFilterChange(option.id)}>
              {option.label}
            </FilterChip>
          ))}
        </div>
      </div>
    </div>

    <div className="mt-6 grid gap-4 xl:hidden">
      {assignments.map((assignment) => (
        <article key={assignment._id} className={insetCardClass}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">{assignment.title}</p>
              <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{assignment.subject?.name || "-"}</p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[assignment.status] || statusStyles.Open}`}>
              {assignment.status}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Batch</p>
              <p className="mt-1 text-[13px] font-medium text-slate-800 dark:text-slate-100">{assignment.batch?.name || "-"}</p>
            </div>
            <div>
              <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Due</p>
              <p className="mt-1 text-[13px] font-medium text-slate-800 dark:text-slate-100">{formatDateTime(assignment.dueDate)}</p>
            </div>
            {showOwner ? (
              <div className="sm:col-span-2">
                <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Owner</p>
                <p className="mt-1 text-[13px] font-medium text-slate-800 dark:text-slate-100">{assignment.createdBy?.name || "-"}</p>
              </div>
            ) : null}
          </div>

          {showActions ? <div className="mt-4">{renderAssignmentActions(assignment, onEdit, onDelete)}</div> : null}
        </article>
      ))}

      {assignments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-[13px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {emptyMessage}
        </div>
      ) : null}
    </div>

    <div className="mt-6 hidden overflow-x-auto xl:block">
      <table className="w-full min-w-[900px] text-left text-[13px]">
        <thead className="border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-3 py-3">Title</th>
            <th className="px-3 py-3">Subject</th>
            {showOwner ? <th className="px-3 py-3">Owner</th> : null}
            <th className="px-3 py-3">Batch</th>
            <th className="px-3 py-3">Due</th>
            <th className="px-3 py-3">Status</th>
            {showActions ? <th className="px-3 py-3">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment._id} className="border-b border-slate-100 dark:border-slate-800">
              <td className="px-3 py-4 font-medium text-slate-800 dark:text-slate-100">{assignment.title}</td>
              <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{assignment.subject?.name || "-"}</td>
              {showOwner ? <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{assignment.createdBy?.name || "-"}</td> : null}
              <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{assignment.batch?.name || "-"}</td>
              <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{formatDateTime(assignment.dueDate)}</td>
              <td className="px-3 py-4">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[assignment.status] || statusStyles.Open}`}>
                  {assignment.status}
                </span>
              </td>
              {showActions ? <td className="px-3 py-4">{renderAssignmentActions(assignment, onEdit, onDelete)}</td> : null}
            </tr>
          ))}
          {assignments.length === 0 ? (
            <tr>
              <td className="px-3 py-8 text-center text-slate-500 dark:text-slate-400" colSpan={showOwner && showActions ? 7 : showOwner || showActions ? 6 : 5}>
                {emptyMessage}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  </section>
);

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
  const [submissionFilter, setSubmissionFilter] = useState("all");
  const [submissionQuery, setSubmissionQuery] = useState("");
  const [myAssignmentQuery, setMyAssignmentQuery] = useState("");
  const [departmentAssignmentQuery, setDepartmentAssignmentQuery] = useState("");
  const [myAssignmentFilter, setMyAssignmentFilter] = useState("all");
  const [departmentAssignmentFilter, setDepartmentAssignmentFilter] = useState("all");
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
    const nextSubmissions = subRes.data.submissions || [];
    const nextSubjects = subjectRes.data.subjects || [];
    const nextBatches = batchRes.data.batches || [];

    setSubmissions(nextSubmissions);
    setSubjects(nextSubjects);
    setBatches(nextBatches);
    setMyAssignments(myAssignmentRes.data.assignments || []);
    setDepartmentAssignments(departmentAssignmentRes.data.assignments || []);

    if (!selected && nextSubmissions.length) {
      setSelected(nextSubmissions[0]._id);
    }
    if (!assignmentForm.subject && nextSubjects.length) {
      setAssignmentForm((prev) => ({ ...prev, subject: nextSubjects[0]._id }));
    }
    if (!assignmentForm.batch && nextBatches.length) {
      setAssignmentForm((prev) => ({ ...prev, batch: nextBatches[0]._id }));
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

  useEffect(() => {
    if (!submissions.length) {
      if (selected) setSelected("");
      return;
    }

    const exists = submissions.some((submission) => submission._id === selected);
    if (!exists) {
      setSelected(submissions[0]._id);
    }
  }, [submissions, selected]);

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

    const editor = document.getElementById("assignment-editor");
    if (editor) {
      editor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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

  const filteredSubmissions = useMemo(() => {
    const query = submissionQuery.trim().toLowerCase();

    return submissions.filter((submission) => {
      const statusMatch =
        submissionFilter === "all"
          ? true
          : submissionFilter === "review"
            ? submission.status !== "Graded"
            : submission.status === submissionFilter;

      if (!statusMatch) return false;
      if (!query) return true;

      const haystack = [submission.student?.name, submission.assignment?.title, submission.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [submissions, submissionFilter, submissionQuery]);

  const filterAssignments = (assignments, query, statusFilter) => {
    const normalizedQuery = query.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const statusMatch = statusFilter === "all" ? true : assignment.status === statusFilter;
      if (!statusMatch) return false;
      if (!normalizedQuery) return true;

      const haystack = [assignment.title, assignment.subject?.name, assignment.batch?.name, assignment.createdBy?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  };

  const filteredMyAssignments = useMemo(
    () => filterAssignments(myAssignments, myAssignmentQuery, myAssignmentFilter),
    [myAssignments, myAssignmentQuery, myAssignmentFilter]
  );

  const filteredDepartmentAssignments = useMemo(
    () => filterAssignments(departmentAssignments, departmentAssignmentQuery, departmentAssignmentFilter),
    [departmentAssignments, departmentAssignmentQuery, departmentAssignmentFilter]
  );

  const summary = useMemo(() => {
    const pendingReview = submissions.filter((submission) => submission.status !== "Graded").length;
    const graded = submissions.filter((submission) => submission.status === "Graded").length;
    const activeAssignments = myAssignments.filter((assignment) => assignment.status === "Open").length;
    const lateSubmissions = submissions.filter((submission) => submission.status === "Late").length;

    return {
      submissions: submissions.length,
      pendingReview,
      graded,
      activeAssignments,
      departmentAssignments: departmentAssignments.length,
      lateSubmissions,
    };
  }, [submissions, myAssignments, departmentAssignments]);

  const nextDeadline = useMemo(() => {
    const now = Date.now();

    return myAssignments
      .filter((assignment) => assignment.dueDate && new Date(assignment.dueDate).getTime() >= now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
  }, [myAssignments]);

  const latestSubmission = useMemo(() => {
    return [...submissions].sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    })[0];
  }, [submissions]);

  return (
    <DashboardLayout title="Department Dashboard">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        <SummaryCard label="Submissions" value={summary.submissions} description="Student uploads currently visible to your workspace." tone="slate" />
        <SummaryCard label="Need review" value={summary.pendingReview} description="Submissions still waiting for grading or feedback." tone="amber" />
        <SummaryCard label="Graded" value={summary.graded} description="Completed reviews already returned to students." tone="cyan" />
        <SummaryCard label="My assignments" value={myAssignments.length} description="Assignments created directly by your account." tone="emerald" />
        <SummaryCard label="Late items" value={summary.lateSubmissions} description="Submissions already marked late in the current queue." tone="rose" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
        <div className="contents">
          <article className={`${panelClass} order-1 sm:col-start-1 sm:row-start-1`}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className={`${eyebrowClass} text-emerald-700 dark:text-emerald-400`}>Review queue</p>
                <h2 className={sectionTitleClass}>Student submissions</h2>
                <p className={`mt-2 max-w-2xl text-slate-600 dark:text-slate-300 ${bodyTextClass}`}>
                  Filter the queue, select a submission, and move into grading without leaving the page.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className={insetCardClass}>
                  <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Latest activity</p>
                  <p className="mt-2 text-[13px] font-semibold text-slate-900 dark:text-slate-100">{latestSubmission?.student?.name || "No submissions yet"}</p>
                  <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{latestSubmission?.assignment?.title || "New uploads will appear here."}</p>
                </div>
                <div className={insetCardClass}>
                  <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Next deadline</p>
                  <p className="mt-2 text-[13px] font-semibold text-slate-900 dark:text-slate-100">{nextDeadline?.title || "No open deadline"}</p>
                  <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{nextDeadline ? formatDateTime(nextDeadline.dueDate) : "Create or update an assignment to fill the schedule."}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <input
                value={submissionQuery}
                onChange={(e) => setSubmissionQuery(e.target.value)}
                placeholder="Search by student, assignment, or status"
                className={fieldClass}
              />
              <div className="flex flex-wrap gap-2">
                {submissionFilterOptions.map((option) => (
                  <FilterChip key={option.id} active={submissionFilter === option.id} onClick={() => setSubmissionFilter(option.id)}>
                    {option.label}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <SubmissionTable rows={filteredSubmissions} selectedId={selected} onSelect={setSelected} />
            </div>
          </article>

          <article id="grading-panel" className={`${panelClass} order-3 sm:col-start-1 sm:row-start-2`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className={`${eyebrowClass} text-cyan-700 dark:text-cyan-400`}>Grading panel</p>
                <h2 className={sectionTitleClass}>Grade selected submission</h2>
                <p className={`mt-2 text-slate-600 dark:text-slate-300 ${bodyTextClass}`}>
                  Use the mobile cards or desktop table above to choose the work you want to review.
                </p>
              </div>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className={`${fieldClass} lg:max-w-sm`}
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
              <div className={`mt-6 ${insetCardClass}`}>
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
                    <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Assignment</p>
                    <p className="mt-2 text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                      {selectedSubmission.assignment?.title || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Current marks</p>
                    <p className="mt-2 text-[13px] font-semibold text-slate-800 dark:text-slate-100">{selectedSubmission.marks ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Student note</p>
                    <p className="mt-2 text-[13px] text-slate-600 dark:text-slate-300">{selectedSubmission.notes || "No note shared."}</p>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Submitted</p>
                    <p className="mt-2 text-[13px] text-slate-600 dark:text-slate-300">{formatDateTime(selectedSubmission.updatedAt || selectedSubmission.createdAt)}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {selectedSubmission.fileUrl ? (
                    <div className="flex min-w-0 flex-col gap-1">
                      <a
                        href={resolveAssetUrl(selectedSubmission.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-emerald-50 px-4 py-2 text-[13px] font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300"
                      >
                        {getAssetActionLabel({
                          type: selectedSubmission.fileType,
                          url: selectedSubmission.fileUrl,
                          defaultLabel: "Open student file"
                        })}
                      </a>
                      <p className="truncate text-[13px] text-slate-500 dark:text-slate-400">
                        {getAssetDisplayName({ name: selectedSubmission.fileName, url: selectedSubmission.fileUrl })}
                      </p>
                    </div>
                  ) : null}
                  <span className="rounded-lg border border-slate-200 px-4 py-2 text-[13px] text-slate-500 dark:border-slate-700 dark:text-slate-300">
                    Max marks: {selectedSubmission.assignment?.maxMarks ?? "-"}
                  </span>
                </div>
              </div>
            ) : (
              <div className={`mt-6 ${insetCardClass} text-[13px] text-slate-500 dark:text-slate-400`}>
                Select a submission to see details and grade it.
              </div>
            )}

            <div className="mt-6">
              <GradeForm onSubmit={onGrade} />
            </div>
          </article>
        </div>

        <div className="contents">
          <article className={`${panelClass} order-2 sm:col-start-2 sm:row-start-1`}>
            <p className={`${eyebrowClass} text-cyan-700 dark:text-cyan-400`}>Quick actions</p>
            <h2 className={sectionTitleClass}>Department control panel</h2>
            <p className={`mt-2 text-slate-600 dark:text-slate-300 ${bodyTextClass}`}>
              Jump straight into assignment creation or the grading area from any device size.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href="#assignment-editor"
                className="relative rounded-lg bg-gradient-to-br from-emerald-600 to-cyan-600 p-4 text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5"
              >
                <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-white/75">Create work</p>
                <p className="mt-2 text-lg font-black">Open assignment editor</p>
                <p className="mt-2 text-[13px] text-white/85">Publish a new assignment or update an existing one.</p>
              </a>
              <a
                href="#grading-panel"
                className={`${insetCardClass} transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white dark:hover:border-cyan-800`}
              >
                <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Review flow</p>
                <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">Jump to grading</p>
                <p className="mt-2 text-[13px] text-slate-600 dark:text-slate-300">{summary.pendingReview} submissions are waiting for feedback.</p>
              </a>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className={insetCardClass}>
                  <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Department reach</p>
                  <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400">{summary.departmentAssignments} assignments are visible across {user?.department || "your"} workspace.</p>
                </div>
                <div className={insetCardClass}>
                  <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Open work</p>
                  <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400">{summary.activeAssignments} of your assignments are still open for submissions.</p>
                </div>
              </div>
          </article>

          <article id="assignment-editor" className={`${panelClass} order-4 sm:col-start-2 sm:row-start-2`}>
            <p className={`${eyebrowClass} text-emerald-700 dark:text-emerald-400`}>Assignment editor</p>
            <h2 className={sectionTitleClass}>
              {editingAssignmentId ? "Update assignment" : "Create assignment"}
            </h2>
            <p className={`mt-2 text-slate-600 dark:text-slate-300 ${bodyTextClass}`}>
              Publish work for your department, set marks, and attach reference files if needed.
            </p>

            <form onSubmit={createOrUpdateAssignment} className="mt-6 space-y-4">
              <input
                className={fieldClass}
                placeholder="Title"
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
              <textarea
                className={`${fieldClass} min-h-28`}
                placeholder="Description"
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm((prev) => ({ ...prev, description: e.target.value }))}
                required
              />
              <select
                className={fieldClass}
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
                className={fieldClass}
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
                  className={fieldClass}
                  type="datetime-local"
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
                <input
                  className={fieldClass}
                  type="number"
                  min="1"
                  value={assignmentForm.maxMarks}
                  onChange={(e) => setAssignmentForm((prev) => ({ ...prev, maxMarks: e.target.value }))}
                  required
                />
              </div>
              <div className={`${insetCardClass} border-dashed`}>
                <label className="block text-[14px] font-bold uppercase tracking-[0.18em] text-slate-700 dark:text-slate-200">Reference attachment</label>
                <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,.docx,.zip" onChange={(e) => setAttachment(e.target.files?.[0] || null)} className="mt-3 w-full text-[13px]" />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button className="w-full rounded-lg bg-emerald-600 py-3 text-[13px] font-semibold text-white transition hover:bg-emerald-500">
                  {editingAssignmentId ? "Update Assignment" : "Create Assignment"}
                </button>
                {editingAssignmentId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-[13px] font-semibold dark:border-slate-700 sm:w-auto"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </article>
        </div>
      </section>

      <section className="grid gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
        <AssignmentSection
          title="My assignments"
          eyebrow="Owned by you"
          subtitle={`${summary.activeAssignments} currently open for students.`}
          assignments={filteredMyAssignments}
          query={myAssignmentQuery}
          onQueryChange={setMyAssignmentQuery}
          statusFilter={myAssignmentFilter}
          onStatusFilterChange={setMyAssignmentFilter}
          emptyMessage="No assignments created yet."
          showActions
          onEdit={startEdit}
          onDelete={removeAssignment}
        />

        <AssignmentSection
          title={`Assignments in ${user?.department || "your department"}`}
          eyebrow="Shared workspace"
          subtitle={`${summary.departmentAssignments} visible across the department workspace.`}
          assignments={filteredDepartmentAssignments}
          query={departmentAssignmentQuery}
          onQueryChange={setDepartmentAssignmentQuery}
          statusFilter={departmentAssignmentFilter}
          onStatusFilterChange={setDepartmentAssignmentFilter}
          emptyMessage="No assignments found for your department."
          showOwner
        />
      </section>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
