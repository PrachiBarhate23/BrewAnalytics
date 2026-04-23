import { Search, Bell, Calendar, ChevronDown, LogOut, Store } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const [dateRange] = useState("Last 30 days");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials = user?.shop
    ? user.shop.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search analytics, reports, insights..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F4E37]/30 focus:border-[#6F4E37] transition-all text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-8">
          {/* Shop Badge */}
          {user?.shop && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5E6D3] rounded-lg">
              <Store className="w-3.5 h-3.5 text-[#6F4E37]" />
              <span className="text-xs font-semibold text-[#6F4E37]">{user.shop}</span>
            </div>
          )}

          {/* Date Range */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{dateRange}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#6F4E37] rounded-full"></span>
          </button>

          {/* Profile + Logout */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.shop || "User"}</p>
              <p className="text-xs text-gray-500">{user?.email || ""}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-[#6F4E37] to-[#5d4230] rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {initials}
            </div>
            <button
              id="btn-logout"
              onClick={handleLogout}
              title="Logout"
              className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-gray-500"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
