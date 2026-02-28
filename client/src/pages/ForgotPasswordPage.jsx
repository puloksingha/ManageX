import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../layouts/AuthShell";

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Forgot Password" subtitle="Enter your registered email to receive a reset link.">
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-500 dark:text-slate-300">
        Back to <Link className="font-semibold text-emerald-700" to="/login">login</Link>
      </p>
    </AuthShell>
  );
};

export default ForgotPasswordPage;
