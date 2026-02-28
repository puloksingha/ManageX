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
  department: ""
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
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [userForm, setUserForm] = useState(initialUserForm);
  const [batchForm, setBatchForm] = useState({ name: "", department: "" });
  const [subjectForm, setSubjectForm] = useState({ name: "", department: "" });

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
    setUsers(data.users || []);
    setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
  };

  const reloadAll = async () => {
    await Promise.all([loadDashboard(), loadUsers(1)]);
  };

  useEffect(() => {
    reloadAll().catch(() => {
      setDashboard({ totalUsers: 0, teachers: 0, students: 0, activeAssignments: 0, overdueSubmissions: 0 });
      setUsers([]);
    });
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/users", userForm);
      setUserForm(initialUserForm);
      toast.success("User created");
      await reloadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  const updateRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}`, { role });
      await loadUsers(pagination.page);
      toast.success("Role updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const removeUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      const nextPage = users.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      await loadUsers(nextPage);
      await loadDashboard();
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create batch");
    }
  };

  const createSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/subjects", subjectForm);
      setSubjectForm({ name: "", department: "" });
      toast.success("Subject created");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create subject");
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
          <PasswordField
            value={userForm.password}
            onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="Password"
          />
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" value={userForm.role} onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))}>
            <option value="student">student</option>
            <option value="teacher">teacher</option>
            <option value="admin">admin</option>
          </select>
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Department" value={userForm.department} onChange={(e) => setUserForm((p) => ({ ...p, department: e.target.value }))} />
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
          <button className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white">Create Subject</button>
        </form>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">User Control</h2>
          <form onSubmit={applyFilters} className="flex flex-wrap gap-2">
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              placeholder="Search name/email/department"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All roles</option>
              <option value="student">student</option>
              <option value="teacher">teacher</option>
              <option value="admin">admin</option>
            </select>
            <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Apply</button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Verified</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2">{u.name}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">
                    <select className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" value={u.role} onChange={(e) => updateRole(u._id, e.target.value)}>
                      <option value="student">student</option>
                      <option value="teacher">teacher</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">{u.emailVerified ? "Yes" : "No"}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => removeUser(u._id)} className="rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white">Delete</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="px-3 py-5 text-center text-slate-500" colSpan={5}>No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Page {pagination.page} of {pagination.totalPages} | Total {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => loadUsers(pagination.page - 1)}
              className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-slate-700"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadUsers(pagination.page + 1)}
              className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
};

export default AdminDashboard;
