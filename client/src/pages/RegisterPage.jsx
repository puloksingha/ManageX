import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../layouts/AuthShell";
import PasswordField from "../components/PasswordField";
import { api } from "../api/client";

const passwordRules = [
  { test: (v) => v.length >= 8, label: "At least 8 characters" },
  { test: (v) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { test: (v) => /[a-z]/.test(v), label: "One lowercase letter" },
  { test: (v) => /[0-9]/.test(v), label: "One number" },
  { test: (v) => /[^A-Za-z0-9]/.test(v), label: "One special character" }
];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const roleFromQuery = params.get("role");
  const initialRole = roleFromQuery === "teacher" ? "department" : ["student", "department", "admin"].includes(roleFromQuery) ? roleFromQuery : "student";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role: initialRole,
    adminSecurityKey: ""
  });
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const requiresDepartment = form.role !== "admin";

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const { data } = await api.get("/meta/departments");
        setDepartments(data.departments || []);
      } catch {
        setDepartments([]);
      } finally {
        setDepartmentsLoading(false);
      }
    };

    loadDepartments();
  }, []);

  useEffect(() => {
    if (!requiresDepartment) {
      setForm((prev) => ({ ...prev, department: "" }));
      return;
    }

    if (form.department || !departments.length) return;
    setForm((prev) => ({ ...prev, department: departments[0].name }));
  }, [requiresDepartment, form.department, departments]);

  const roleLabel = useMemo(() => {
    if (form.role === "department") return "Teacher";
    return form.role[0].toUpperCase() + form.role.slice(1);
  }, [form.role]);

  const getErrorMessage = (error) => {
    const payload = error?.response?.data;
    if (payload?.errors?.length) return payload.errors[0].msg;
    return payload?.message || "Registration failed";
  };

  const validateForm = () => {
    if (form.name.trim().length < 2) return "Name must be at least 2 characters";
    if (requiresDepartment && !form.department) return "Please select a department";
    const failedRule = passwordRules.find((rule) => !rule.test(form.password));
    if (failedRule) return `Password rule failed: ${failedRule.label}`;
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const localValidation = validateForm();
    if (localValidation) {
      toast.error(localValidation);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      };

      if (requiresDepartment) {
        payload.department = form.department;
      }

      if (form.role === "admin" && form.adminSecurityKey.trim()) {
        payload.adminSecurityKey = form.adminSecurityKey.trim();
      }

      await register(payload);
      navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={`${roleLabel} Registration`}
      subtitle="Use your real email address. Verification is mandatory."
    >
      <form onSubmit={submit} className="mt-6 space-y-3">
        <select
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          value={form.role}
          onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
        >
          <option value="student">Student Register</option>
          <option value="department">Teacher Register</option>
          <option value="admin">Admin Register</option>
        </select>
        {form.role === "admin" ? (
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            placeholder="Admin Security Key"
            type="password"
            value={form.adminSecurityKey}
            onChange={(e) => setForm((prev) => ({ ...prev, adminSecurityKey: e.target.value }))}
            required
          />
        ) : null}

        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
        {requiresDepartment ? (
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            value={form.department}
            onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
            disabled={departmentsLoading || departments.length === 0}
            required
          >
            <option value="">Select Department</option>
            {departments.map((department) => (
              <option key={department._id} value={department.name}>
                {department.name}
              </option>
            ))}
          </select>
        ) : null}
        {requiresDepartment && !departmentsLoading && departments.length === 0 ? (
          <p className="text-xs text-rose-600">No active departments available. Contact admin.</p>
        ) : null}

        <PasswordField
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          placeholder="Password"
        />

        <ul className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {passwordRules.map((rule) => {
            const ok = rule.test(form.password);
            return (
              <li key={rule.label} className={ok ? "text-emerald-600" : ""}>
                {ok ? "OK" : "-"} {rule.label}
              </li>
            );
          })}
        </ul>

        <button
          className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white"
          disabled={submitting || (requiresDepartment && (departmentsLoading || departments.length === 0))}
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-500 dark:text-slate-300">
        Already have an account?{" "}
        <Link className="font-semibold text-emerald-700" to={`/login?role=${form.role}`}>
          Login
        </Link>
      </p>
    </AuthShell>
  );
};

export default RegisterPage;
