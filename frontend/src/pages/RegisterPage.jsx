import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { register } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "TOURIST", phone: "", university: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await register(form);
      loginSuccess(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-8">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-green-700 to-green-500 flex items-center justify-center">
            <Compass size={22} className="text-green-100" />
          </div>
          <span className="text-xl font-bold text-gray-900">Explore<span className="text-green-600">BD</span></span>
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-4 text-center">Create an account</h1>

        {error && <p className="text-sm bg-red-100 text-red-700 px-3 py-2 rounded-lg mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="password" placeholder="Password (min 8 characters)" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Phone (e.g. +8801700000000)" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />

          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="TOURIST">Tourist</option>
            <option value="GUIDE">Student Guide</option>
          </select>

          {form.role === "GUIDE" && (
            <input placeholder="University" required value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          )}

          <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60">
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-4">
          Already have an account? <Link to="/login" className="text-green-700 font-semibold">Log in</Link>
        </p>
      </div>
    </div>
  );
}
