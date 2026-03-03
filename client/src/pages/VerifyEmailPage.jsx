import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../layouts/AuthShell";

const VerifyEmailPage = () => {
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialEmail = useMemo(() => params.get("email") || "", [params]);

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyEmail(email, code);
      toast.success("Verified. You can login now.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    try {
      await resendVerification(email);
    } catch (error) {
      toast.error(error.response?.data?.message || "Resend failed");
    }
  };

  return (
    <AuthShell title="Verify Email" subtitle="Enter the 6-digit code sent to your email.">
      <form onSubmit={onVerify} className="mt-6 space-y-3">
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="6-digit code"
          required
        />
        <button className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      <button onClick={onResend} className="mt-3 text-sm font-semibold text-emerald-700">
        Resend code
      </button>

      <p className="mt-5 text-sm text-slate-500 dark:text-slate-300">
        Done? <Link className="font-semibold text-emerald-700" to="/login">Go to login</Link>
      </p>
    </AuthShell>
  );
};

export default VerifyEmailPage;
