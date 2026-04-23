import { Coffee, Eye, EyeOff, Store } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:8000";

export function Login() {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shop, setShop] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<string[]>([]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  // Fetch shop list for signup dropdown
  useEffect(() => {
    fetch(`${API_BASE}/api/auth/shops`)
      .then((r) => r.json())
      .then((d) => setShops(d.shops || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        if (!shop) throw new Error("Please select your shop");
        await signup(email, password, shop);
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (qEmail: string) => {
    setError("");
    setLoading(true);
    try {
      await login(qEmail, "brew123");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Quick login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E6D3] via-[#FDF6EF] to-[#F9FAFB] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6F4E37] rounded-2xl mb-4 shadow-lg">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#6F4E37] mb-1">BrewAnalytics</h1>
          <p className="text-gray-500 text-sm">Restaurant Analytics & Decision Support</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              id="tab-login"
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                tab === "login"
                  ? "text-[#6F4E37] border-b-2 border-[#6F4E37] bg-[#FDF6EF]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-signup"
              onClick={() => { setTab("signup"); setError(""); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                tab === "signup"
                  ? "text-[#6F4E37] border-b-2 border-[#6F4E37] bg-[#FDF6EF]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="p-8">
            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F4E37]/30 focus:border-[#6F4E37] transition-all text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F4E37]/30 focus:border-[#6F4E37] transition-all text-sm pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {tab === "signup" && (
                <div>
                  <label htmlFor="shop" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your Shop / Restaurant
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      id="shop"
                      value={shop}
                      onChange={(e) => setShop(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F4E37]/30 focus:border-[#6F4E37] transition-all text-sm appearance-none"
                      required={tab === "signup"}
                    >
                      <option value="">-- Select your shop --</option>
                      {shops.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    You'll only see analytics for this shop after login.
                  </p>
                </div>
              )}

              <button
                id="btn-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-[#6F4E37] text-white py-2.5 rounded-lg hover:bg-[#5d4230] transition-all font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Please wait…" : tab === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            {/* Quick login buttons */}
            {tab === "login" && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center mb-3">Quick Demo Login</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Vrindavan", email: "vrindavan@brew.com" },
                    { label: "Cluckins", email: "cluckins@brew.com" },
                    { label: "Juice Center", email: "juicecenter@brew.com" },
                  ].map((q) => (
                    <button
                      key={q.email}
                      id={`quick-${q.label.toLowerCase()}`}
                      onClick={() => quickLogin(q.email)}
                      disabled={loading}
                      className="py-2 px-2 text-xs bg-[#F5E6D3] text-[#6F4E37] rounded-lg hover:bg-[#e8d5be] transition-colors font-medium disabled:opacity-60"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Password: <span className="font-mono font-semibold">brew123</span>
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          New shops can register via "Create Account" — accounts persist across sessions.
        </p>
      </div>
    </div>
  );
}
