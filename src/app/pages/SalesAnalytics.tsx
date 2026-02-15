import { DollarSign, TrendingUp, ShoppingCart, Users } from "lucide-react";
import { KPICard } from "../components/KPICard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const monthlySales = [
  { month: "Jan", revenue: 45000, transactions: 1850 },
  { month: "Feb", revenue: 52000, transactions: 2100 },
  { month: "Mar", revenue: 48000, transactions: 1920 },
  { month: "Apr", revenue: 61000, transactions: 2380 },
  { month: "May", revenue: 55000, transactions: 2150 },
  { month: "Jun", revenue: 67000, transactions: 2520 },
  { month: "Jul", revenue: 72000, transactions: 2680 },
  { month: "Aug", revenue: 68000, transactions: 2540 },
];

const categoryBreakdown = [
  { category: "Coffee", revenue: 28500, percentage: 42 },
  { category: "Pastries", revenue: 17000, percentage: 25 },
  { category: "Sandwiches", revenue: 13600, percentage: 20 },
  { category: "Beverages", revenue: 6800, percentage: 10 },
  { category: "Other", revenue: 2100, percentage: 3 },
];

export function SalesAnalytics() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Analytics</h1>
        <p className="text-gray-600">Comprehensive sales performance and trends</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Revenue"
          value="$468K"
          change="+12.5% vs last period"
          changeType="increase"
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <KPICard
          title="Avg Transaction Value"
          value="$26.75"
          change="+$2.30 increase"
          changeType="increase"
          icon={ShoppingCart}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <KPICard
          title="Total Transactions"
          value="17,140"
          change="+8.2% vs last period"
          changeType="increase"
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <KPICard
          title="Growth Rate"
          value="12.5%"
          change="Month over month"
          changeType="increase"
          icon={TrendingUp}
          iconColor="text-[#1ABC9C]"
          iconBg="bg-teal-50"
        />
      </div>

      {/* Revenue Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Transaction Trend</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlySales}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" stroke="#6B7280" />
            <YAxis yAxisId="left" stroke="#6B7280" />
            <YAxis yAxisId="right" orientation="right" stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#6F4E37"
              strokeWidth={3}
              dot={{ fill: "#6F4E37", r: 5 }}
              name="Revenue ($)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="transactions"
              stroke="#1ABC9C"
              strokeWidth={3}
              dot={{ fill: "#1ABC9C", r: 5 }}
              name="Transactions"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryBreakdown}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="category" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="revenue" fill="#6F4E37" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          {categoryBreakdown.map((cat, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{cat.category}</p>
              <p className="text-lg font-bold text-gray-900">{cat.percentage}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
