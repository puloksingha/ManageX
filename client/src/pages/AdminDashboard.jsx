import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api/client";
import PasswordField from "../components/PasswordField";

const StatCard = ({ title, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
    <p className="text-sm text-slate-500 dark:text-slate-300">{title}</p>
    <p className="mt-2 text-2xl font-bold">{value}</p>
  </div>
);

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
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [userForm, setUserForm] = useState(initialUserForm);
  const [batchForm, setBatchForm] = useState({ name: "", department: "" });
  const [subjectForm, setSubjectForm] = useState({ name: "", department: "", teacher: "" });
  const [userDrafts, setUserDrafts] = useState({});
  const [batchDrafts, setBatchDrafts] = useState({});
  const [subjectDrafts, setSubjectDrafts] = useState({});

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
        role: nextRole || undefined
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
        emailVerified: Boolean(u.emailVerified),
        phone: u.phone || "",
        bio: u.bio || "",
        avatarUrl: u.avatarUrl || "",
        adminSecurityKey: ""
      };
    }
    setUserDrafts(drafts);
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
    const { data } = await api.get("/admin/users", { params: { role: "teacher", limit: 100 } });
    setTeachers(data.users || []);
  };

  const reloadAll = async () => {
    await Promise.all([loadDashboard(), loadUsers(1), loadBatches(), loadSubjects(), loadTeachers()]);
  };

  useEffect(() => {
    reloadAll().catch(() => {
      setDashboard({ totalUsers: 0, teachers: 0, students: 0, activeAssignments: 0, overdueSubmissions: 0 });
      setUsers([]);
      setBatches([]);
      setSubjects([]);
      setTeachers([]);
    });
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...userForm };
      if (!payload.batch) delete payload.batch;
      if (payload.role !== "admin") delete payload.adminSecurityKey;

      await api.post("/admin/users", payload);
      setUserForm(initialUserForm);
      toast.success("User created");
      await Promise.all([loadDashboard(), loadUsers(1), loadTeachers()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  const saveUser = async (id) => {
    try {
      const payload = { ...userDrafts[id] };
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

  const createBatch = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/batches", batchForm);
      setBatchForm({ name: "", department: "" });
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
      setSubjectForm({ name: "", department: "", teacher: "" });
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
      <section className="grid gap-4 md:grid-cols-5">
        <StatCard title="Total Users" value={dashboard.totalUsers} />
        <StatCard title="Teachers" value={dashboard.teachers} />
        <StatCard title="Students" value={dashboard.students} />
        <StatCard title="Active Assignments" value={dashboard.activeAssignments} />
        <StatCard title="Overdue Submissions" value={dashboard.overdueSubmissions} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <form onSubmit={createUser} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Create User</h2>
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Name" value={userForm.name} onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))} required />
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Email" type="email" value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} required />
          <PasswordField value={userForm.password} onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))} placeholder="Password" />
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" value={userForm.role} onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))}>
            <option value="student">student</option>
            <option value="teacher">teacher</option>
            <option value="admin">admin</option>
          </select>
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" value={userForm.batch} onChange={(e) => setUserForm((p) => ({ ...p, batch: e.target.value }))}>
            <option value="">No batch</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch._id}>{batch.name}</option>
            ))}
          </select>
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Department" value={userForm.department} onChange={(e) => setUserForm((p) => ({ ...p, department: e.target.value }))} />
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Phone" value={userForm.phone} onChange={(e) => setUserForm((p) => ({ ...p, phone: e.target.value }))} />
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Avatar URL" value={userForm.avatarUrl} onChange={(e) => setUserForm((p) => ({ ...p, avatarUrl: e.target.value }))} />
          <textarea className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Bio" rows={2} value={userForm.bio} onChange={(e) => setUserForm((p) => ({ ...p, bio: e.target.value }))} />
          {userForm.role === "admin" ? (
            <input className="w-full rounded-lg border border-amber-400 px-3 py-2 dark:bg-slate-800" placeholder="Admin Security Key" type="password" value={userForm.adminSecurityKey} onChange={(e) => setUserForm((p) => ({ ...p, adminSecurityKey: e.target.value }))} required />
          ) : null}
          <button className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white">Create</button>
        </form>

        <form onSubmit={createBatch} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Create Batch</h2>
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Batch Name" value={batchForm.name} onChange={(e) => setBatchForm((p) => ({ ...p, name: e.target.value }))} required />
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Department" value={batchForm.department} onChange={(e) => setBatchForm((p) => ({ ...p, department: e.target.value }))} required />
          <button className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white">Create Batch</button>
        </form>

        <form onSubmit={createSubject} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Create Subject</h2>
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Subject Name" value={subjectForm.name} onChange={(e) => setSubjectForm((p) => ({ ...p, name: e.target.value }))} required />
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Department" value={subjectForm.department} onChange={(e) => setSubjectForm((p) => ({ ...p, department: e.target.value }))} required />
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" value={subjectForm.teacher} onChange={(e) => setSubjectForm((p) => ({ ...p, teacher: e.target.value }))}>
            <option value="">No teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
            ))}
          </select>
          <button className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white">Create Subject</button>
        </form>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Student and Teacher Information</h2>
          <form onSubmit={applyFilters} className="flex flex-wrap gap-2">
            <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" placeholder="Search name/email/department" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All roles</option>
              <option value="student">student</option>
              <option value="teacher">teacher</option>
              <option value="admin">admin</option>
            </select>
            <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Apply</button>
          </form>
        </div>

        <div className="overflow-x-auto">
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
                    <select className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={userDrafts[u._id]?.role || "student"} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], role: e.target.value } }))}>
                      <option value="student">student</option>
                      <option value="teacher">teacher</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-2 py-2"><input className="w-32 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={userDrafts[u._id]?.department || ""} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], department: e.target.value } }))} /></td>
                  <td className="px-2 py-2">
                    <select className="w-32 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={userDrafts[u._id]?.batch || ""} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], batch: e.target.value } }))}>
                      <option value="">No batch</option>
                      {batches.map((batch) => (
                        <option key={batch._id} value={batch._id}>{batch.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2"><input className="w-28 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={userDrafts[u._id]?.phone || ""} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], phone: e.target.value } }))} /></td>
                  <td className="px-2 py-2"><input className="w-40 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={userDrafts[u._id]?.bio || ""} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], bio: e.target.value } }))} /></td>
                  <td className="px-2 py-2"><input className="w-40 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={userDrafts[u._id]?.avatarUrl || ""} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], avatarUrl: e.target.value } }))} /></td>
                  <td className="px-2 py-2"><input type="checkbox" checked={Boolean(userDrafts[u._id]?.emailVerified)} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], emailVerified: e.target.checked } }))} /></td>
                  <td className="px-2 py-2">
                    <input className="w-28 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" type="password" value={userDrafts[u._id]?.adminSecurityKey || ""} onChange={(e) => setUserDrafts((p) => ({ ...p, [u._id]: { ...p[u._id], adminSecurityKey: e.target.value } }))} placeholder="if admin" />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex gap-2">
                      <button onClick={() => saveUser(u._id)} className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">Save</button>
                      <button onClick={() => removeUser(u._id)} className="rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td className="px-3 py-5 text-center text-slate-500" colSpan={11}>No users found</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-300">Page {pagination.page} of {pagination.totalPages} | Total {pagination.total}</p>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1} onClick={() => loadUsers(pagination.page - 1)} className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-slate-700">Previous</button>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => loadUsers(pagination.page + 1)} className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-slate-700">Next</button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-lg font-semibold">Batch Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Department</th>
                  <th className="px-2 py-2">Students</th>
                  <th className="px-2 py-2">Teachers</th>
                  <th className="px-2 py-2">Assignments</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch._id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-2"><input className="w-32 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={batchDrafts[batch._id]?.name || ""} onChange={(e) => setBatchDrafts((p) => ({ ...p, [batch._id]: { ...p[batch._id], name: e.target.value } }))} /></td>
                    <td className="px-2 py-2"><input className="w-36 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={batchDrafts[batch._id]?.department || ""} onChange={(e) => setBatchDrafts((p) => ({ ...p, [batch._id]: { ...p[batch._id], department: e.target.value } }))} /></td>
                    <td className="px-2 py-2">{batch.studentCount || 0}</td>
                    <td className="px-2 py-2">{batch.teacherCount || 0}</td>
                    <td className="px-2 py-2">{batch.assignmentCount || 0}</td>
                    <td className="px-2 py-2">
                      <div className="flex gap-2">
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

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-lg font-semibold">Subject Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
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
                    <td className="px-2 py-2"><input className="w-36 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={subjectDrafts[subject._id]?.department || ""} onChange={(e) => setSubjectDrafts((p) => ({ ...p, [subject._id]: { ...p[subject._id], department: e.target.value } }))} /></td>
                    <td className="px-2 py-2">
                      <select className="w-36 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={subjectDrafts[subject._id]?.teacher || ""} onChange={(e) => setSubjectDrafts((p) => ({ ...p, [subject._id]: { ...p[subject._id], teacher: e.target.value } }))}>
                        <option value="">No teacher</option>
                        {teachers.map((teacher) => (
                          <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">{subject.assignmentCount || 0}</td>
                    <td className="px-2 py-2">
                      <div className="flex gap-2">
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
