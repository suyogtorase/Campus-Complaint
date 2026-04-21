import { useState, useContext } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // If already logged in, go straight to dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-slate-900 border border-slate-700 text-slate-50 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors";

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-indigo-500">Sign In</h2>
          <p className="text-slate-400 text-sm mt-1">Welcome back to SmartCampus</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block font-medium mb-2 text-slate-400 text-sm">Email Address</label>
            <input
              type="email"
              className={inputClass}
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-2 text-slate-400 text-sm">Password</label>
            <input
              type="password"
              className={inputClass}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="mt-6 text-center text-slate-400 text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-indigo-400 font-medium hover:underline">
            Register here
          </Link>
        </p>
        <p className="mt-2 text-center text-slate-500 text-sm">
          <Link to="/landing" className="hover:text-slate-400 transition-colors">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
