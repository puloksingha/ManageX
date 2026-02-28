import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../layouts/AuthShell";
import PasswordField from "../components/PasswordField";

const ResetPasswordPage = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const initialEmail = useMemo(() => params.get("email") || "", [params]);
  const initialToken = useMemo(() => params.get("token") || "", [params]);

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword({ email, token, newPassword });
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset Password" subtitle="Use the token from your email and set a new password.">
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          placeholder="Reset token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        <PasswordField
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
        />
        <button className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white" disabled={loading}>
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-500 dark:text-slate-300">
        Back to <Link className="font-semibold text-emerald-700" to="/login">login</Link>
      </p>
    </AuthShell>
  );
};

export default ResetPasswordPage;
