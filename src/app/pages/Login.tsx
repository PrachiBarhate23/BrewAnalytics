import { Coffee } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication - just navigate to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E6D3] via-[#F9FAFB] to-[#F9FAFB] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6F4E37] rounded-2xl mb-4 shadow-lg">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#6F4E37] mb-2">BrewAnalytics</h1>
          <p className="text-gray-600">Restaurant Analytics & Decision Support</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent transition-all"
                placeholder="admin@brewanalytics.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-[#6F4E37] border-gray-300 rounded focus:ring-[#1ABC9C]" />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-[#1ABC9C] hover:text-[#17a085] font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#6F4E37] text-white py-2.5 rounded-lg hover:bg-[#5d4230] transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Login as Admin
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Login as Manager
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Demo credentials: Use any email/password or quick login buttons
        </p>
      </div>
    </div>
  );
}
