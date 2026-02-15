import { 
  LayoutDashboard, 
  MessageSquare, 
  Target, 
  TrendingUp, 
  LineChart, 
  ShoppingCart, 
  Users, 
  Lightbulb, 
  FileText, 
  Settings,
  Coffee
} from "lucide-react";
import { NavLink } from "react-router";

const menuItems = [
  { path: "/dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
  { path: "/dashboard/sentiment", label: "Sentiment Analysis", icon: MessageSquare },
  { path: "/dashboard/aspect", label: "Aspect Analysis", icon: Target },
  { path: "/dashboard/sales", label: "Sales Analytics", icon: TrendingUp },
  { path: "/dashboard/forecasting", label: "Sales Forecasting", icon: LineChart },
  { path: "/dashboard/market-basket", label: "Market Basket Analysis", icon: ShoppingCart },
  { path: "/dashboard/competitor", label: "Competitor Benchmarking", icon: Users },
  { path: "/dashboard/recommendations", label: "Recommendations", icon: Lightbulb },
  { path: "/dashboard/reports", label: "Reports", icon: FileText },
  { path: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#6F4E37] rounded-lg flex items-center justify-center">
            <Coffee className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#6F4E37]">BrewAnalytics</h1>
            <p className="text-xs text-gray-500">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/dashboard"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? "bg-[#6F4E37] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-br from-[#F5E6D3] to-[#F9FAFB] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-[#6F4E37]" />
            <span className="text-xs font-semibold text-[#6F4E37]">Pro Tip</span>
          </div>
          <p className="text-xs text-gray-600">
            Check the Recommendations tab for AI-powered insights.
          </p>
        </div>
      </div>
    </aside>
  );
}
