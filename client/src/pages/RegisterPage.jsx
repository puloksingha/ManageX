import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../layouts/AuthShell";
import PasswordField from "../components/PasswordField";

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
  const initialRole = ["student", "teacher", "admin"].includes(roleFromQuery) ? roleFromQuery : "student";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role: initialRole
  });
  const [submitting, setSubmitting] = useState(false);

  const getErrorMessage = (error) => {
    const payload = error?.response?.data;
    if (payload?.errors?.length) return payload.errors[0].msg;
    return payload?.message || "Registration failed";
  };

  const validateForm = () => {
    if (form.name.trim().length < 2) return "Name must be at least 2 characters";
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
      await register(form);
      navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={`${form.role[0].toUpperCase()}${form.role.slice(1)} Registration`}
      subtitle="Use your real email address. Verification is mandatory."
    >
      <form onSubmit={submit} className="mt-6 space-y-3">
        <select
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          value={form.role}
          onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
        >
          <option value="student">Student Register</option>
          <option value="teacher">Teacher Register</option>
          <option value="admin">Admin Register</option>
        </select>

        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          required
        />
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          placeholder="Department"
          value={form.department}
          onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
        />
        <PasswordField
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
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

        <button className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white" disabled={submitting}>
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
