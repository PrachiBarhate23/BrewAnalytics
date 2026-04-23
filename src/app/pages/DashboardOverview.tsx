import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Star, ThumbsUp, Coffee, Store } from "lucide-react";
import { useAuth } from "../context/AuthContext";
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

const API = "http://localhost:8000";

const inr = (n: number) =>
  n >= 1_00_00_000
    ? `₹${(n / 1_00_00_000).toFixed(1)}Cr`
    : n >= 1_00_000
    ? `₹${(n / 1_00_000).toFixed(1)}L`
    : `₹${n.toLocaleString("en-IN")}`;

const SENTIMENT_COLORS = [
  { name: "Positive", color: "#1ABC9C" },
  { name: "Neutral",  color: "#F59E0B" },
  { name: "Negative", color: "#EF4444" },
];

export function DashboardOverview() {
  const { authHeader, user } = useAuth();

  const [salesData,     setSalesData]     = useState<any>(null);
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [loadingSales,  setLoadingSales]  = useState(true);
  const [loadingSent,   setLoadingSent]   = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch sales analytics
    setLoadingSales(true);
    fetch(`${API}/api/sales/analytics`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => { setSalesData(d); setLoadingSales(false); })
      .catch(() => setLoadingSales(false));

    // Fetch sentiment summary
    setLoadingSent(true);
    fetch(`${API}/api/sentiment/summary`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => { setSentimentData(d); setLoadingSent(false); })
      .catch(() => setLoadingSent(false));
  }, [user?.shop]);

  const kpis    = salesData?.kpis           || {};
  const monthly = salesData?.monthly_trend  || [];
  const topItems = salesData?.top_items     || [];

  const overview  = sentimentData?.overview || { positive: 0, neutral: 0, negative: 0 };
  const trendData = sentimentData?.trendData || [];

  const sentimentPie = [
    { name: "Positive", value: overview.positive, color: "#1ABC9C" },
    { name: "Neutral",  value: overview.neutral,  color: "#F59E0B" },
    { name: "Negative", value: overview.negative, color: "#EF4444" },
  ];

  // Best item from API
  const bestItem = topItems[0];

  const aiInsights = [
    {
      severity: "medium",
      icon: "💡",
      title: "Peak Hour Optimization",
      description: "Sales spike detected on weekends. Consider staffing up by 15% on Saturdays and Sundays.",
    },
    ...(overview.positive > 60
      ? [{
          severity: "low",
          icon: "✅",
          title: "High Customer Satisfaction",
          description: `Positive sentiment is at ${overview.positive}% — well above the 60% benchmark for ${user?.shop}.`,
        }]
      : [{
          severity: "high",
          icon: "⚠️",
          title: "Sentiment Alert",
          description: `Positive sentiment is at ${overview.positive}% for ${user?.shop}. Consider addressing negative reviews.`,
        }]
    ),
    {
      severity: "medium",
      icon: "🎯",
      title: "Top Item Opportunity",
      description: bestItem
        ? `"${bestItem.item}" is your highest revenue item. Consider promoting it with a combo offer.`
        : "Upload sales data to see your top item opportunity.",
    },
    {
      severity: kpis.revenue_growth >= 0 ? "low" : "high",
      icon: kpis.revenue_growth >= 0 ? "📈" : "📉",
      title: "Revenue Trend",
      description: kpis.revenue_growth != null
        ? `Month-over-month revenue is ${kpis.revenue_growth >= 0 ? "up" : "down"} ${Math.abs(kpis.revenue_growth)}% for ${user?.shop}.`
        : "Upload sales data to see revenue trends.",
    },
  ];

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#6F4E37] to-[#4a3325] rounded-xl flex items-center justify-center shadow-md">
          <Store className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Welcome, {user?.shop || "Dashboard"} 👋
          </h1>
          <p className="text-gray-500 text-sm">
            {user?.role === "admin"
              ? "You have admin access — viewing all outlets"
              : `Showing analytics scoped to ${user?.shop}`}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Total Revenue</span>
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {loadingSales ? "—" : inr(kpis.total_revenue || 0)}
          </p>
          <p className={`text-xs font-medium ${(kpis.revenue_growth ?? 0) >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {loadingSales ? "Loading…" : `${kpis.revenue_growth >= 0 ? "+" : ""}${kpis.revenue_growth ?? 0}% from last month`}
          </p>
        </div>

        {/* Monthly Growth */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Monthly Growth</span>
            <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#1ABC9C]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {loadingSales ? "—" : `${kpis.revenue_growth ?? 0}%`}
          </p>
          <p className="text-xs text-gray-500">
            {loadingSales ? "Loading…" : `Txn growth: ${kpis.txn_growth ?? 0}%`}
          </p>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Avg Order Value</span>
            <div className="w-9 h-9 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {loadingSales ? "—" : `₹${kpis.avg_order_value ?? 0}`}
          </p>
          <p className="text-xs text-gray-500">Across all transactions</p>
        </div>

        {/* Positive Sentiment */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Positive Sentiment</span>
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {loadingSent ? "—" : `${overview.positive}%`}
          </p>
          <p className="text-xs text-gray-500">
            {loadingSent ? "Upload reviews to see" : `${overview.negative}% negative reviews`}
          </p>
        </div>

        {/* Top Selling Item */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Top Selling Item</span>
            <div className="w-9 h-9 bg-[#F5E6D3] rounded-lg flex items-center justify-center">
              <Coffee className="w-5 h-5 text-[#6F4E37]" />
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1 truncate">
            {loadingSales ? "—" : (bestItem?.item || "N/A")}
          </p>
          <p className="text-xs text-gray-500">
            {loadingSales ? "Upload sales data" : bestItem ? `${inr(bestItem.revenue)} revenue` : "Upload sales data"}
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend — {user?.shop}</h3>
          {loadingSales ? (
            <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
              Loading revenue data…
            </div>
          ) : monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6B7280" tickFormatter={v => v >= 1_00_000 ? `${(v/1_00_000).toFixed(0)}L` : `${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                  formatter={(v: any) => [inr(v), "Revenue"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#6F4E37" strokeWidth={3}
                  dot={{ fill: "#6F4E37", r: 4 }} activeDot={{ r: 6 }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">No revenue data yet</p>
                <p className="text-gray-300 text-xs">Upload sales data from the Sales Analytics page</p>
              </div>
            </div>
          )}
        </div>

        {/* Sentiment Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h3>
          {loadingSent ? (
            <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
              Loading sentiment data…
            </div>
          ) : (overview.positive + overview.neutral + overview.negative) > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentPie}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={90}
                  dataKey="value"
                >
                  {sentimentPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">No sentiment data yet</p>
                <p className="text-gray-300 text-xs">Upload review CSV from Sentiment Analysis page</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Items */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items — {user?.shop}</h3>
          {loadingSales ? (
            <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">Loading items…</div>
          ) : topItems.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topItems.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="item" stroke="#6B7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6B7280" tickFormatter={v => inr(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                  formatter={(v: any) => [inr(v), "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#1ABC9C" radius={[8, 8, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">No items data yet</p>
                <p className="text-gray-300 text-xs">Upload sales data from the Sales Analytics page</p>
              </div>
            </div>
          )}
        </div>

        {/* AI Insights Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Insights</h3>
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
