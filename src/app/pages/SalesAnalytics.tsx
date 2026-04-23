import { useState, useEffect, useCallback } from "react";
import {
  DollarSign, TrendingUp, ShoppingCart, Store,
  ArrowUpRight, ArrowDownRight, RefreshCw
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, Sector
} from "recharts";

// ─── Colour palette ───────────────────────────────────────────────────────────
const OUTLET_COLORS = [
  "#6F4E37","#1ABC9C","#3B82F6","#F59E0B","#EF4444",
  "#8B5CF6","#EC4899","#10B981","#F97316",
];

// ─── Helper: Indian rupee formatter ──────────────────────────────────────────
const inr = (n: number) =>
  n >= 1_00_00_000
    ? `₹${(n / 1_00_00_000).toFixed(1)}Cr`
    : n >= 1_00_000
    ? `₹${(n / 1_00_000).toFixed(1)}L`
    : `₹${n.toLocaleString("en-IN")}`;

// ─── Active PieChart slice renderer ──────────────────────────────────────────
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#111827" className="text-sm font-bold">
        {payload.item}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#6B7280" className="text-xs">
        {inr(value)} · {(percent * 100).toFixed(1)}%
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 16}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

export function SalesAnalytics() {
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [activeIdx, setActiveIdx] = useState(0); // for pie chart

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetch("/api/sales/analytics")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Loading / Error states ───────────────────────────────────────────────
  if (loading) return (
    <div className="p-8 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#6F4E37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading Sales Analytics…</p>
        <p className="text-gray-400 text-sm mt-1">Running analytics engine on 2-year dataset</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-semibold mb-2">Failed to load analytics</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <button onClick={load}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Retry
        </button>
      </div>
    </div>
  );

  const kpis    = data?.kpis            || {};
  const monthly = data?.monthly_trend   || [];
  const outlets = data?.outlet_performance || [];
  const topItems = data?.top_items      || [];
  const dow     = data?.dow_pattern     || [];
  const itemMix = data?.item_mix        || [];

  return (
    <div className="p-8">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Sales Analytics</h1>
          <p className="text-gray-500 text-sm">
            Model-driven insights across {kpis.active_outlets} outlets · 2-year dataset
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          {
            label: "Total Revenue (2 yr)",
            value: inr(kpis.total_revenue || 0),
            sub: `Current month ${inr(kpis.current_month_rev || 0)}`,
            change: kpis.revenue_growth,
            icon: DollarSign, bg: "bg-emerald-50", iconCol: "text-emerald-600",
          },
          {
            label: "Current Month Revenue",
            value: inr(kpis.current_month_rev || 0),
            sub: `Prev month ${inr(kpis.prev_month_rev || 0)}`,
            change: kpis.revenue_growth,
            icon: TrendingUp, bg: "bg-blue-50", iconCol: "text-blue-600",
          },
          {
            label: "Total Transactions",
            value: (kpis.total_transactions || 0).toLocaleString("en-IN"),
            sub: `This month growth ${kpis.txn_growth ?? 0}%`,
            change: kpis.txn_growth,
            icon: ShoppingCart, bg: "bg-purple-50", iconCol: "text-purple-600",
          },
          {
            label: "Avg Order Value",
            value: `₹${kpis.avg_order_value || 0}`,
            sub: "Across all outlets",
            change: null,
            icon: Store, bg: "bg-amber-50", iconCol: "text-amber-600",
          },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{card.label}</span>
              <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.iconCol}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
            <div className="flex items-center gap-1">
              {card.change !== null && card.change !== undefined ? (
                <>
                  {card.change >= 0
                    ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                    : <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />}
                  <span className={`text-xs font-semibold ${card.change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {card.change >= 0 ? "+" : ""}{card.change}% MoM
                  </span>
                </>
              ) : null}
              <span className="text-xs text-gray-400 ml-1">{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue & Transaction Monthly Trend ──────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Revenue & Transaction Trend</h3>
          <p className="text-xs text-gray-400 mt-0.5">Monthly aggregation across all 9 outlets</p>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={monthly} margin={{ left: 10, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="l" stroke="#9CA3AF" tick={{ fontSize: 11 }}
              tickFormatter={v => v >= 1_00_000 ? `${(v/1_00_000).toFixed(0)}L` : `${v}`} />
            <YAxis yAxisId="r" orientation="right" stroke="#9CA3AF" tick={{ fontSize: 11 }}
              tickFormatter={v => v.toLocaleString("en-IN")} />
            <Tooltip
              contentStyle={{ backgroundColor:"#fff", border:"1px solid #E5E7EB", borderRadius:10 }}
              formatter={(val: any, name: string) =>
                name === "Revenue (₹)" ? [inr(val), name] : [val.toLocaleString("en-IN"), name]}
            />
            <Legend />
            <Line yAxisId="l" type="monotone" dataKey="revenue" stroke="#6F4E37"
              strokeWidth={3} dot={{ fill:"#6F4E37", r:4 }} name="Revenue (₹)" />
            <Line yAxisId="r" type="monotone" dataKey="transactions" stroke="#1ABC9C"
              strokeWidth={2.5} dot={{ fill:"#1ABC9C", r:3 }} strokeDasharray="6 3" name="Transactions" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Outlet Performance Table + Day-of-Week Pattern ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Outlet table (spans 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Outlet Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Outlet","Demand Idx","Monthly Rev","MoM Growth","Transactions","AOV"].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {outlets.map((o: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: OUTLET_COLORS[i % OUTLET_COLORS.length] }} />
                        <span className="font-medium text-gray-800">{o.outlet}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-[#6F4E37]">{o.demand_index}</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-800">{inr(o.monthly_revenue)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold
                        ${o.mom_growth >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                        {o.mom_growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {o.mom_growth >= 0 ? "+" : ""}{o.mom_growth}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">{o.total_txn.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 font-medium text-gray-700">₹{o.avg_order_value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Day-of-week traffic bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Daily Traffic Pattern</h3>
          <p className="text-xs text-gray-400 mb-4">Avg daily revenue by weekday</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dow} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="#9CA3AF"
                tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <YAxis dataKey="day" type="category" tick={{ fontSize: 11 }} stroke="#9CA3AF" width={28} />
              <Tooltip formatter={(v: any) => [inr(v), "Avg Revenue"]}
                contentStyle={{ backgroundColor:"#fff", border:"1px solid #E5E7EB", borderRadius:8 }} />
              <Bar dataKey="avg_revenue" radius={[0,4,4,0]}
                fill="url(#barGrad)" name="Avg Revenue" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6F4E37" />
                  <stop offset="100%" stopColor="#1ABC9C" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Top Items + Item Mix Pie ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top 10 items by revenue */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Revenue Items</h3>
          <div className="space-y-3">
            {topItems.slice(0,8).map((item: any, i: number) => {
              const maxRev = topItems[0]?.revenue || 1;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-gray-400">#{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-800 truncate">{item.item}</span>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{inr(item.revenue)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(item.revenue / maxRev) * 100}%`,
                          background: OUTLET_COLORS[i % OUTLET_COLORS.length]
                        }} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-14 text-right flex-shrink-0">
                    {(item.quantity || 0).toLocaleString("en-IN")} units
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Item Revenue Mix — interactive pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Revenue Mix by Item</h3>
          <p className="text-xs text-gray-400 mb-2">Click a slice to inspect</p>
          <ResponsiveContainer width="100%" height={290}>
            <PieChart>
              <Pie
                data={itemMix} dataKey="revenue" nameKey="item"
                cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                activeIndex={activeIdx} activeShape={renderActiveShape}
                onMouseEnter={(_, idx) => setActiveIdx(idx)}
              >
                {itemMix.map((_: any, i: number) => (
                  <Cell key={i} fill={OUTLET_COLORS[i % OUTLET_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [inr(v), "Revenue"]}
                contentStyle={{ borderRadius:8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {itemMix.map((it: any, i: number) => (
              <span key={i} className="flex items-center gap-1 text-[11px] text-gray-600 cursor-pointer"
                onClick={() => setActiveIdx(i)}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: OUTLET_COLORS[i % OUTLET_COLORS.length] }} />
                {it.item} {it.percentage}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
