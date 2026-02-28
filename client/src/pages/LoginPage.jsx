import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../layouts/AuthShell";
import PasswordField from "../components/PasswordField";

const LoginPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();
  const roleFromQuery = params.get("role");
  const initialRole = ["student", "teacher", "admin"].includes(roleFromQuery) ? roleFromQuery : "student";
  const [form, setForm] = useState({ email: "", password: "" });
  const [role, setRole] = useState(initialRole);
  const [submitting, setSubmitting] = useState(false);

  const hint = useMemo(
    () => [
      "Admin: admin@college.edu / Admin@123",
      "Teacher: teacher@college.edu / Teacher@123",
      "Student: student@college.edu / Student@123"
    ],
    []
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const user = await login(form.email, form.password);
      if (user.role === "student") navigate("/student");
      else if (user.role === "teacher") navigate("/teacher");
      else navigate("/admin");
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      if (message.toLowerCase().includes("verify")) {
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="ManageX Login" subtitle="Select your portal and sign in">
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Portal</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student login</option>
            <option value="teacher">Teacher login</option>
            <option value="admin">Admin login</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>
          <div className="mt-1">
            <PasswordField
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        New {role}?{" "}
        <Link className="font-semibold text-emerald-700" to={`/register?role=${role}`}>
          Create account
        </Link>
      </p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Forgot password? <Link className="font-semibold text-emerald-700" to="/forgot-password">Reset it</Link>
      </p>

      <ul className="mt-6 space-y-1 text-xs text-slate-500 dark:text-slate-300">
        {hint.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </AuthShell>
  );
};

export default LoginPage;
