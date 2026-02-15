import { DollarSign, TrendingUp, Star, ThumbsUp, Coffee } from "lucide-react";
import { KPICard } from "../components/KPICard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 },
  { month: "Jun", revenue: 67000 },
  { month: "Jul", revenue: 72000 },
  { month: "Aug", revenue: 68000 },
];

const sentimentData = [
  { name: "Positive", value: 65, color: "#1ABC9C" },
  { name: "Neutral", value: 25, color: "#F59E0B" },
  { name: "Negative", value: 10, color: "#EF4444" },
];

const topItemsData = [
  { item: "Cappuccino", sales: 2845 },
  { item: "Croissant", sales: 2145 },
  { item: "Latte", sales: 1980 },
  { item: "Espresso", sales: 1756 },
  { item: "Muffin", sales: 1432 },
];

const aiInsights = [
  {
    type: "opportunity",
    title: "Peak Hour Optimization",
    description: "Sales spike detected between 2-4 PM. Consider adding 15% more staff during this window.",
    severity: "medium",
    icon: "💡",
  },
  {
    type: "alert",
    title: "Inventory Alert",
    description: "Croissant inventory running low. Restock recommended within 48 hours based on demand forecast.",
    severity: "high",
    icon: "⚠️",
  },
  {
    type: "success",
    title: "Customer Satisfaction",
    description: "Positive sentiment increased by 8% this month. Coffee quality mentions up 12%.",
    severity: "low",
    icon: "✅",
  },
  {
    type: "opportunity",
    title: "Menu Optimization",
    description: "Customers frequently order Cappuccino with Croissants. Create a combo offer for 10% boost.",
    severity: "medium",
    icon: "🎯",
  },
];

export function DashboardOverview() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your restaurant.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <KPICard
          title="Total Revenue"
          value="$468K"
          change="+12.5% from last month"
          changeType="increase"
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <KPICard
          title="Monthly Growth"
          value="12.5%"
          change="+2.3% vs avg"
          changeType="increase"
          icon={TrendingUp}
          iconColor="text-[#1ABC9C]"
          iconBg="bg-teal-50"
        />
        <KPICard
          title="Average Rating"
          value="4.6"
          change="0.2 points up"
          changeType="increase"
          icon={Star}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-50"
        />
        <KPICard
          title="Positive Sentiment"
          value="65%"
          change="+8% this month"
          changeType="increase"
          icon={ThumbsUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <KPICard
          title="Top Selling Item"
          value="Cappuccino"
          change="2,845 sold"
          changeType="neutral"
          icon={Coffee}
          iconColor="text-[#6F4E37]"
          iconBg="bg-[#F5E6D3]"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6F4E37"
                strokeWidth={3}
                dot={{ fill: "#6F4E37", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Items */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Selling Items</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topItemsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="item" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="sales" fill="#1ABC9C" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  insight.severity === "high"
                    ? "border-red-500 bg-red-50"
                    : insight.severity === "medium"
                    ? "border-yellow-500 bg-yellow-50"
                    : "border-green-500 bg-green-50"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{insight.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">{insight.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
