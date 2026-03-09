import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api/client";
import PasswordField from "../components/PasswordField";

const toneStyles = {
  emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/20",
  cyan: "from-cyan-500 to-cyan-600 shadow-cyan-500/20",
  amber: "from-amber-500 to-amber-600 shadow-amber-500/20",
  slate: "from-slate-700 to-slate-900 shadow-slate-500/20",
  rose: "from-rose-500 to-rose-600 shadow-rose-500/20",
};

const StatCard = ({ title, value, description, tone = "slate" }) => (
  <article className={`rounded-[1.75rem] bg-gradient-to-br ${toneStyles[tone]} p-5 text-white shadow-lg`}>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{title}</p>
    <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
    <p className="mt-3 text-sm leading-6 text-white/80">{description}</p>
  </article>
);

const creationPanelClass =
  "space-y-4 rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85";

const sectionPanelClass =
  "min-w-0 max-w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85";

const initialUserForm = {
  name: "",
  email: "",
  password: "",
  role: "student",
  department: "",
  phone: "",
  bio: "",
  avatarUrl: "",
  batch: "",
  adminSecurityKey: ""
};

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState({
    totalUsers: 0,
    teachers: 0,
    students: 0,
    activeAssignments: 0,
    overdueSubmissions: 0
  });
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [userForm, setUserForm] = useState(initialUserForm);
  const [departmentForm, setDepartmentForm] = useState({ name: "", active: true });
  const [batchForm, setBatchForm] = useState({ name: "", department: "" });
  const [subjectForm, setSubjectForm] = useState({ name: "", department: "", teacher: "" });
  const [departmentDrafts, setDepartmentDrafts] = useState({});
  const [userDrafts, setUserDrafts] = useState({});
  const [batchDrafts, setBatchDrafts] = useState({});
  const [subjectDrafts, setSubjectDrafts] = useState({});
  const batchesForCreateUser = useMemo(
    () => batches.filter((batch) => batch.department === userForm.department),
    [batches, userForm.department]
  );

  const loadDashboard = async () => {
    const { data } = await api.get("/admin/dashboard");
    setDashboard(data);
  };

  const loadUsers = async (page = 1, nextSearch = search, nextRole = roleFilter) => {
    const { data } = await api.get("/admin/users", {
      params: {
        page,
        limit: pagination.limit,
        search: nextSearch || undefined,
        role: nextRole || undefined,
        excludeAdmin: true
      }
    });

    const list = data.users || [];
    setUsers(list);
    setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });

    const drafts = {};
    for (const u of list) {
      drafts[u._id] = {
        name: u.name || "",
        email: u.email || "",
        department: u.department || "",
        role: u.role || "student",
        batch: u.batch?._id || "",
        approved: Boolean(u.approved !== false),
        emailVerified: Boolean(u.emailVerified),
        phone: u.phone || "",
        bio: u.bio || "",
        avatarUrl: u.avatarUrl || "",
        adminSecurityKey: ""
      };
    }
    setUserDrafts(drafts);
  };

  const loadDepartments = async () => {
    const { data } = await api.get("/admin/departments");
    const list = data.departments || [];
    setDepartments(list);

    const drafts = {};
    for (const department of list) {
      drafts[department._id] = {
        name: department.name || "",
        active: Boolean(department.active)
      };
    }
    setDepartmentDrafts(drafts);
  };

  const loadBatches = async () => {
    const { data } = await api.get("/admin/batches");
    const list = data.batches || [];
    setBatches(list);

    const drafts = {};
    for (const b of list) {
      drafts[b._id] = { name: b.name || "", department: b.department || "" };
    }
    setBatchDrafts(drafts);
  };

  const loadSubjects = async () => {
    const { data } = await api.get("/admin/subjects");
    const list = data.subjects || [];
    setSubjects(list);

    const drafts = {};
    for (const s of list) {
      drafts[s._id] = {
        name: s.name || "",
        department: s.department || "",
        teacher: s.teacher?._id || ""
      };
    }
    setSubjectDrafts(drafts);
  };

  const loadTeachers = async () => {
    const { data } = await api.get("/admin/users", { params: { role: "department", limit: 100 } });
    setTeachers(data.users || []);
  };

  const reloadAll = async () => {
    await Promise.all([loadDashboard(), loadUsers(1), loadDepartments(), loadBatches(), loadSubjects(), loadTeachers()]);
  };

  useEffect(() => {
    reloadAll().catch(() => {
      setDashboard({ totalUsers: 0, teachers: 0, students: 0, activeAssignments: 0, overdueSubmissions: 0 });
      setUsers([]);
      setDepartments([]);
      setBatches([]);
      setSubjects([]);
      setTeachers([]);
    });
  }, []);

  useEffect(() => {
    if (!departments.length) return;
    const defaultDepartment = departments[0].name;

    setUserForm((prev) => {
      if (prev.department) return prev;
      return { ...prev, department: defaultDepartment };
    });
    setBatchForm((prev) => {
      if (prev.department) return prev;
      return { ...prev, department: defaultDepartment };
    });
    setSubjectForm((prev) => {
      if (prev.department) return prev;
      return { ...prev, department: defaultDepartment };
    });
  }, [departments]);

  useEffect(() => {
    setUserForm((prev) => {
      if (prev.role !== "student") {
        return prev.batch ? { ...prev, batch: "" } : prev;
      }
      const filtered = batches.filter((batch) => batch.department === prev.department);
      if (!filtered.length) {
        return prev.batch ? { ...prev, batch: "" } : prev;
      }
      const exists = filtered.some((batch) => batch._id === prev.batch);
      return exists ? prev : { ...prev, batch: filtered[0]._id };
    });
  }, [batches, userForm.role, userForm.department]);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...userForm };
      if (payload.role !== "student") delete payload.batch;
      if (!payload.batch) delete payload.batch;
      if (payload.role !== "admin") delete payload.adminSecurityKey;
      if (payload.role === "admin") payload.department = "";

      await api.post("/admin/users", payload);
      setUserForm({ ...initialUserForm, department: departments[0]?.name || "" });
      toast.success("User created");
      await Promise.all([loadDashboard(), loadUsers(1), loadTeachers()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  const saveUser = async (id) => {
    try {
      const payload = { ...userDrafts[id] };
      if (payload.role !== "student") payload.batch = "";
      if (!payload.batch) payload.batch = "";
      if (payload.role !== "admin") delete payload.adminSecurityKey;

      await api.patch(`/admin/users/${id}`, payload);
      toast.success("User updated");
      await Promise.all([loadUsers(pagination.page), loadDashboard(), loadTeachers()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await api.delete(`/admin/users/${id}`);
      const nextPage = users.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      await Promise.all([loadUsers(nextPage), loadDashboard(), loadTeachers()]);
      toast.success("User removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const createDepartment = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/departments", departmentForm);
      setDepartmentForm({ name: "", active: true });
      toast.success("Department created");
      await Promise.all([loadDepartments(), loadUsers(pagination.page), loadBatches(), loadSubjects()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create department");
    }
  };

  const saveDepartment = async (id) => {
    try {
      await api.patch(`/admin/departments/${id}`, departmentDrafts[id]);
      toast.success("Department updated");
      await Promise.all([loadDepartments(), loadUsers(pagination.page), loadBatches(), loadSubjects()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update department");
    }
  };

  const removeDepartment = async (id) => {
    if (!window.confirm("Delete this department?")) return;

    try {
      await api.delete(`/admin/departments/${id}`);
      toast.success("Department deleted");
      await Promise.all([loadDepartments(), loadUsers(pagination.page), loadBatches(), loadSubjects()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete department");
    }
  };

  const createBatch = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/batches", batchForm);
      setBatchForm({ name: "", department: departments[0]?.name || "" });
      toast.success("Batch created");
      await loadBatches();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create batch");
    }
  };

  const saveBatch = async (id) => {
    try {
      await api.patch(`/admin/batches/${id}`, batchDrafts[id]);
      toast.success("Batch updated");
      await loadBatches();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update batch");
    }
  };

  const removeBatch = async (id) => {
    if (!window.confirm("Delete this batch?")) return;

    try {
      await api.delete(`/admin/batches/${id}`);
      toast.success("Batch deleted");
      await Promise.all([loadBatches(), loadUsers(pagination.page)]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete batch");
    }
  };

  const createSubject = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...subjectForm };
      if (!payload.teacher) delete payload.teacher;
      await api.post("/admin/subjects", payload);
      setSubjectForm({ name: "", department: departments[0]?.name || "", teacher: "" });
      toast.success("Subject created");
      await loadSubjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create subject");
    }
  };

  const saveSubject = async (id) => {
    try {
      const payload = { ...subjectDrafts[id] };
      if (!payload.teacher) payload.teacher = "";
      await api.patch(`/admin/subjects/${id}`, payload);
      toast.success("Subject updated");
      await loadSubjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update subject");
    }
  };

  const removeSubject = async (id) => {
    if (!window.confirm("Delete this subject?")) return;

    try {
      await api.delete(`/admin/subjects/${id}`);
      toast.success("Subject deleted");
      await loadSubjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete subject");
    }
  };

  const applyFilters = async (e) => {
    e.preventDefault();
    await loadUsers(1, search, roleFilter);
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Users" value={dashboard.totalUsers} description="All non-admin records currently managed by the system." tone="slate" />
        <StatCard title="Departments" value={departments.length} description="Academic units configured for onboarding and assignment flow." tone="emerald" />
        <StatCard title="Students" value={dashboard.students} description="Student accounts available for submissions and profile tracking." tone="cyan" />
        <StatCard title="Active Assignments" value={dashboard.activeAssignments} description="Assignments currently open across the platform." tone="amber" />
        <StatCard title="Overdue" value={dashboard.overdueSubmissions} description="Submissions that are already beyond the expected schedule." tone="rose" />
      </section>

      <section className={`${sectionPanelClass} mt-6`}>
        <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr] xl:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Operations center</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Manage users, departments, batches, and subjects from one admin view.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Keep academic structure, user access, and configuration records aligned through one central administrative workflow.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-3xl bg-slate-50/90 p-4 dark:bg-slate-950/70">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Teachers</p>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{dashboard.teachers}</p>
            </article>
            <article className="rounded-3xl bg-slate-50/90 p-4 dark:bg-slate-950/70">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Subjects</p>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{subjects.length}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-4">
        <form onSubmit={createUser} className={creationPanelClass}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Create user</p>
            <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">User account setup</h2>
          </div>
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Name" value={userForm.name} onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))} required />
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Email" type="email" value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} required />
          <PasswordField value={userForm.password} onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))} placeholder="Password" />
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" value={userForm.role} onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value, department: e.target.value === "admin" ? "" : p.department || departments[0]?.name || "", batch: e.target.value === "student" ? p.batch : "" }))}>
            <option value="student">student</option>
            <option value="department">department</option>
            <option value="admin">admin</option>
          </select>
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" value={userForm.department} onChange={(e) => setUserForm((p) => ({ ...p, department: e.target.value }))} disabled={userForm.role === "admin"}>
            <option value="">{departments.length ? "Select department" : "No departments available"}</option>
            {departments.map((department) => (
              <option key={department._id} value={department.name}>{department.name}</option>
            ))}
          </select>
          {userForm.role === "student" ? (
            <select className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" value={userForm.batch} onChange={(e) => setUserForm((p) => ({ ...p, batch: e.target.value }))} disabled={batchesForCreateUser.length === 0} required>
              <option value="">{batchesForCreateUser.length ? "Select batch" : "No batches for selected department"}</option>
              {batchesForCreateUser.map((batch) => (
                <option key={batch._id} value={batch._id}>{batch.name}</option>
              ))}
            </select>
          ) : null}
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Phone" value={userForm.phone} onChange={(e) => setUserForm((p) => ({ ...p, phone: e.target.value }))} />
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Avatar URL" value={userForm.avatarUrl} onChange={(e) => setUserForm((p) => ({ ...p, avatarUrl: e.target.value }))} />
          <textarea className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Bio" rows={2} value={userForm.bio} onChange={(e) => setUserForm((p) => ({ ...p, bio: e.target.value }))} />
          {userForm.role === "admin" ? (
            <input className="w-full rounded-lg border border-amber-400 px-3 py-2 dark:bg-slate-800" placeholder="Admin Security Key" type="password" value={userForm.adminSecurityKey} onChange={(e) => setUserForm((p) => ({ ...p, adminSecurityKey: e.target.value }))} required />
          ) : null}
          <button className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500">Create</button>
        </form>

        <form onSubmit={createBatch} className={creationPanelClass}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-400">Create batch</p>
            <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">Batch configuration</h2>
          </div>
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Batch Name" value={batchForm.name} onChange={(e) => setBatchForm((p) => ({ ...p, name: e.target.value }))} required />
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" value={batchForm.department} onChange={(e) => setBatchForm((p) => ({ ...p, department: e.target.value }))} required>
            <option value="">{departments.length ? "Select department" : "No departments available"}</option>
            {departments.map((department) => (
              <option key={department._id} value={department.name}>{department.name}</option>
            ))}
          </select>
          <button className="w-full rounded-xl bg-cyan-600 py-3 font-semibold text-white transition hover:bg-cyan-500">Create Batch</button>
        </form>

        <form onSubmit={createSubject} className={creationPanelClass}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Create subject</p>
            <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">Subject assignment</h2>
          </div>
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Subject Name" value={subjectForm.name} onChange={(e) => setSubjectForm((p) => ({ ...p, name: e.target.value }))} required />
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" value={subjectForm.department} onChange={(e) => setSubjectForm((p) => ({ ...p, department: e.target.value }))} required>
            <option value="">{departments.length ? "Select department" : "No departments available"}</option>
            {departments.map((department) => (
              <option key={department._id} value={department.name}>{department.name}</option>
            ))}
          </select>
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" value={subjectForm.teacher} onChange={(e) => setSubjectForm((p) => ({ ...p, teacher: e.target.value }))}>
            <option value="">No department</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
            ))}
          </select>
          <button className="w-full rounded-xl bg-amber-600 py-3 font-semibold text-white transition hover:bg-amber-500">Create Subject</button>
        </form>

        <form onSubmit={createDepartment} className={creationPanelClass}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Create department</p>
            <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">Department structure</h2>
          </div>
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Department Name" value={departmentForm.name} onChange={(e) => setDepartmentForm((p) => ({ ...p, name: e.target.value }))} required />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(departmentForm.active)} onChange={(e) => setDepartmentForm((p) => ({ ...p, active: e.target.checked }))} />
            Active
          </label>
          <button className="w-full rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">Create Department</button>
        </form>
      </section>

      <section className={`${sectionPanelClass} mt-6`}>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">User directory</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Student and department information</h2>
          </div>
          <form onSubmit={applyFilters} className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap">
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 sm:w-64" placeholder="Search name/email/department" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 sm:w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All roles</option>
              <option value="student">student</option>
              <option value="department">department</option>
            </select>
            <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 sm:w-auto">Apply</button>
          </form>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Role</th>
                <th className="px-2 py-2">Department</th>
                <th className="px-2 py-2">Batch</th>
                <th className="px-2 py-2">Phone</th>
                <th className="px-2 py-2">Bio</th>
                <th className="px-2 py-2">Avatar URL</th>
                <th className="px-2 py-2">Approved</th>
                <th className="px-2 py-2">Verified</th>
                <th className="px-2 py-2">Admin Key</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-2 py-2"><input className="w-36 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={userDrafts[u._id]?.name || ""} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], name: e.target.value } }))} /></td>
                  <td className="px-2 py-2"><input className="w-48 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={userDrafts[u._id]?.email || ""} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], email: e.target.value } }))} /></td>
                  <td className="px-2 py-2">
                    <select className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={userDrafts[u._id]?.role || "student"} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], role: e.target.value, department: e.target.value === "admin" ? "" : p[u._id]?.department || departments[0]?.name || "", batch: "" } }))}>
                      <option value="student">student</option>
                      <option value="department">department</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select className="w-32 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={userDrafts[u._id]?.department || ""} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], department: e.target.value, batch: "" } }))} disabled={userDrafts[u._id]?.role === "admin"}>
                      <option value="">{departments.length ? "Select" : "No departments"}</option>
                      {departments.map((department) => (
                        <option key={department._id} value={department.name}>{department.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select className="w-32 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={userDrafts[u._id]?.batch || ""} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], batch: e.target.value } }))} disabled={(userDrafts[u._id]?.role || "student") !== "student"}>
                      <option value="">{(userDrafts[u._id]?.role || "student") === "student" ? "Select batch" : "No batch"}</option>
                      {batches
                        .filter((batch) => batch.department === (userDrafts[u._id]?.department || ""))
                        .map((batch) => (
                          <option key={batch._id} value={batch._id}>{batch.name}</option>
                        ))}
                    </select>
                  </td>
                  <td className="px-2 py-2"><input className="w-28 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={userDrafts[u._id]?.phone || ""} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], phone: e.target.value } }))} /></td>
                  <td className="px-2 py-2"><input className="w-40 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={userDrafts[u._id]?.bio || ""} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], bio: e.target.value } }))} /></td>
                  <td className="px-2 py-2"><input className="w-40 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={userDrafts[u._id]?.avatarUrl || ""} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], avatarUrl: e.target.value } }))} /></td>
                  <td className="px-2 py-2"><input type="checkbox" checked={Boolean(userDrafts[u._id]?.approved)} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], approved: e.target.checked } }))} /></td>
                  <td className="px-2 py-2"><input type="checkbox" checked={Boolean(userDrafts[u._id]?.emailVerified)} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], emailVerified: e.target.checked } }))} /></td>
                  <td className="px-2 py-2">
                    <input className="w-28 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" type="password" value={userDrafts[u._id]?.adminSecurityKey || ""} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], adminSecurityKey: e.target.value } }))} placeholder="if admin" />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => saveUser(u._id)} className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">Save</button>
                      <button onClick={() => removeUser(u._id)} className="rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td className="px-3 py-5 text-center text-slate-500" colSpan={12}>No users found</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-300">Page {pagination.page} of {pagination.totalPages} | Total {pagination.total}</p>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1} onClick={() => loadUsers(pagination.page - 1)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-slate-700">Previous</button>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => loadUsers(pagination.page + 1)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-slate-700">Next</button>
          </div>
        </div>
      </section>

      <section className={`${sectionPanelClass} mt-6`}>
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Departments</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Department management</h2>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">Active</th>
                <th className="px-2 py-2">Users</th>
                <th className="px-2 py-2">Batches</th>
                <th className="px-2 py-2">Subjects</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-2 py-2"><input className="w-48 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={departmentDrafts[department._id]?.name || ""} onChange={(e) => setDepartmentDrafts((p) => ({ ...p, [department._id]: { ...p[department._id], name: e.target.value } }))} /></td>
                  <td className="px-2 py-2"><input type="checkbox" checked={Boolean(departmentDrafts[department._id]?.active)} onChange={(e) => setDepartmentDrafts((p) => ({ ...p, [department._id]: { ...p[department._id], active: e.target.checked } }))} /></td>
                  <td className="px-2 py-2">{department.userCount || 0}</td>
                  <td className="px-2 py-2">{department.batchCount || 0}</td>
                  <td className="px-2 py-2">{department.subjectCount || 0}</td>
                  <td className="px-2 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => saveDepartment(department._id)} className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">Save</button>
                      <button onClick={() => removeDepartment(department._id)} className="rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {departments.length === 0 ? (
                <tr>
                  <td className="px-3 py-5 text-center text-slate-500" colSpan={6}>No departments found</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className={sectionPanelClass}>
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Batches</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Batch management</h2>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Department</th>
                  <th className="px-2 py-2">Students</th>
                  <th className="px-2 py-2">Departments</th>
                  <th className="px-2 py-2">Assignments</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch._id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-2"><input className="w-32 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={batchDrafts[batch._id]?.name || ""} onChange={(e) => setBatchDrafts((p) => ({ ...p, [batch._id]: { ...p[batch._id], name: e.target.value } }))} /></td>
                    <td className="px-2 py-2">
                      <select className="w-36 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={batchDrafts[batch._id]?.department || ""} onChange={(e) => setBatchDrafts((p) => ({ ...p, [batch._id]: { ...p[batch._id], department: e.target.value } }))}>
                        <option value="">Select department</option>
                        {departments.map((department) => (
                          <option key={department._id} value={department.name}>{department.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">{batch.studentCount || 0}</td>
                    <td className="px-2 py-2">{batch.teacherCount || 0}</td>
                    <td className="px-2 py-2">{batch.assignmentCount || 0}</td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => saveBatch(batch._id)} className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">Save</button>
                        <button onClick={() => removeBatch(batch._id)} className="rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {batches.length === 0 ? (
                  <tr>
                    <td className="px-3 py-5 text-center text-slate-500" colSpan={6}>No batches found</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className={sectionPanelClass}>
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Subjects</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Subject management</h2>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Department</th>
                  <th className="px-2 py-2">Teacher</th>
                  <th className="px-2 py-2">Assignments</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject._id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-2"><input className="w-32 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={subjectDrafts[subject._id]?.name || ""} onChange={(e) => setSubjectDrafts((p) => ({ ...p, [subject._id]: { ...p[subject._id], name: e.target.value } }))} /></td>
                    <td className="px-2 py-2">
                      <select className="w-36 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={subjectDrafts[subject._id]?.department || ""} onChange={(e) => setSubjectDrafts((p) => ({ ...p, [subject._id]: { ...p[subject._id], department: e.target.value } }))}>
                        <option value="">Select department</option>
                        {departments.map((department) => (
                          <option key={department._id} value={department.name}>{department.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select className="w-36 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={subjectDrafts[subject._id]?.teacher || ""} onChange={(e) => setSubjectDrafts((p) => ({ ...p, [subject._id]: { ...p[subject._id], teacher: e.target.value } }))}>
                        <option value="">No department</option>
                        {teachers.map((teacher) => (
                          <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">{subject.assignmentCount || 0}</td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => saveSubject(subject._id)} className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">Save</button>
                        <button onClick={() => removeSubject(subject._id)} className="rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {subjects.length === 0 ? (
                  <tr>
                    <td className="px-3 py-5 text-center text-slate-500" colSpan={5}>No subjects found</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
};

export default AdminDashboard;


