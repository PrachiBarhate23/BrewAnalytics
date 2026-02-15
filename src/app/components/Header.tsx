import { Search, Bell, Calendar, ChevronDown } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [dateRange, setDateRange] = useState("Last 30 days");

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
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-8">
          {/* Date Range Filter */}
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
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#1ABC9C] rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@brewanalytics.com</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-[#6F4E37] to-[#5d4230] rounded-full flex items-center justify-center text-white font-semibold">
              AU
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
