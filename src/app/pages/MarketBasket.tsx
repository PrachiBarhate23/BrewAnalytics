import { useState, useEffect, useCallback } from "react";
import {
  ArrowRight, TrendingUp, ShoppingCart, Layers,
  Users, RefreshCw, Package
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:8000";

const COLORS = [
  "#6F4E37","#1ABC9C","#3B82F6","#F59E0B","#EF4444",
  "#8B5CF6","#EC4899","#10B981","#F97316","#64748B",
  "#06B6D4","#84CC16",
];

export function MarketBasket() {
  const { authHeader, user } = useAuth();
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetch(`${API}/api/basket/analysis`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => {
        if (d?.error) { setError(d.error); setLoading(false); return; }
        if (d?.detail) { setError(d.detail); setLoading(false); return; }
        setData(d);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [user?.shop]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="p-8 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#6F4E37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Running Market Basket Analysis…</p>
        <p className="text-gray-400 text-sm mt-1">Co-occurrence mining · {user?.shop}</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <p className="text-amber-700 font-semibold mb-1">Data not ready</p>
        <p className="text-amber-600 text-sm mb-4">{error}</p>
        <button onClick={load} className="px-4 py-2 bg-[#6F4E37] text-white rounded-lg hover:bg-[#5d4230] transition-colors text-sm">
          Retry
        </button>
      </div>
    </div>
  );

  const kpis      = data || {};
  const topItems  = data?.top_items   || [];
  const topPairs  = data?.top_pairs   || [];
  const rules     = data?.rules       || [];
  const bundles   = data?.bundles     || [];

  return (
    <div className="p-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Market Basket Analysis</h1>
          <p className="text-gray-500 text-sm">
            {user?.shop} · Item co-occurrence mining · {kpis.total_transactions?.toLocaleString("en-IN")} transactions analysed
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Total Transactions",    value: (kpis.total_transactions || 0).toLocaleString("en-IN"),       icon: ShoppingCart, bg: "bg-emerald-50", col: "text-emerald-600" },
          { label: "Unique Items",           value: kpis.unique_items || 0,                                        icon: Package,      bg: "bg-blue-50",    col: "text-blue-600"    },
          { label: "Avg Items / Order",      value: kpis.avg_items_per_txn || 0,                                   icon: Layers,       bg: "bg-purple-50",  col: "text-purple-600"  },
          { label: "Cross-Sell Rate",        value: `${kpis.cross_sell_rate || 0}%`,                               icon: Users,        bg: "bg-amber-50",   col: "text-amber-600"   },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{card.label}</span>
              <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.col}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Frequently Bought Together ──────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Bought Together</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rules.slice(0, 3).map((rule: any, i: number) => (
            <div key={i}
              className="bg-gradient-to-br from-white to-[#F5E6D3]/30 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="px-3 py-1.5 bg-[#6F4E37]/10 text-[#6F4E37] rounded-lg text-sm font-semibold">
                  {rule.antecedent}
                </span>
                <ArrowRight className="w-5 h-5 text-[#6F4E37] flex-shrink-0" />
                <span className="px-3 py-1.5 bg-[#1ABC9C]/10 text-[#1ABC9C] rounded-lg text-sm font-semibold">
                  {rule.consequent}
                </span>
              </div>
              <p className="text-xs text-gray-500 text-center mb-4">
                {rule.confidence}% of customers who buy <strong>{rule.antecedent}</strong> also buy <strong>{rule.consequent}</strong>
              </p>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Support</p>
                  <p className="text-sm font-bold text-gray-800">{rule.support}%</p>
                </div>
                <div className="text-center border-x border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Confidence</p>
                  <p className="text-sm font-bold text-gray-800">{rule.confidence}%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Lift</p>
                  <p className="text-sm font-bold text-[#1ABC9C]">{rule.lift}x</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Item Frequency Chart + Top Pairs ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Item frequency bar chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Item Purchase Frequency</h3>
          <p className="text-xs text-gray-400 mb-4">% of transactions containing each item · {user?.shop}</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topItems} layout="vertical" margin={{ left: 0, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="#9CA3AF"
                tickFormatter={v => `${v}%`} domain={[0, 'auto']} />
              <YAxis dataKey="item" type="category" tick={{ fontSize: 10 }} stroke="#9CA3AF" width={100} />
              <Tooltip formatter={(v: any) => [`${v}%`, "In Transactions"]}
                contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }} />
              <Bar dataKey="pct" radius={[0, 4, 4, 0]} name="% Transactions">
                {topItems.map((_: any, idx: number) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Pairs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Top Item Pairs</h3>
          <p className="text-xs text-gray-400 mb-4">Most commonly purchased together</p>
          <div className="space-y-3">
            {topPairs.map((pair: any, i: number) => {
              const maxCnt = topPairs[0]?.count || 1;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 truncate">
                        {pair.item_a} + {pair.item_b}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">
                        {pair.support}% support
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(pair.count / maxCnt) * 100}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right flex-shrink-0">
                    {pair.count.toLocaleString("en-IN")} txns
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Association Rules Table ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Association Rules</h3>
        <p className="text-xs text-gray-400 mb-4">Sorted by Lift × Confidence (highest quality first)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["If Bought", "", "Then Also", "Support", "Confidence", "Lift", "Strength"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.map((rule: any, i: number) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-1 bg-[#6F4E37]/10 text-[#6F4E37] rounded text-xs font-medium">
                      {rule.antecedent}
                    </span>
                  </td>
                  <td className="py-2.5 px-1 text-center">
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 mx-auto" />
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-1 bg-[#1ABC9C]/10 text-[#1ABC9C] rounded text-xs font-medium">
                      {rule.consequent}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                      {rule.support}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {rule.confidence}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
                      {rule.lift}x
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <div key={si}
                          className={`w-1.5 h-4 rounded ${si < Math.min(Math.floor(rule.lift * 1.5), 5) ? "bg-[#1ABC9C]" : "bg-gray-100"}`} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Bundle Suggestions ───────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Bundle Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {bundles.map((b: any, i: number) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">{b.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                  ${b.confidence >= 40 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {b.confidence >= 40 ? "High" : "Medium"} Confidence
                </span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                {b.items.map((item: string, ii: number) => (
                  <span key={ii} className="flex items-center gap-1">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                      {item}
                    </span>
                    {ii < b.items.length - 1 && <span className="text-gray-400 text-xs">+</span>}
                  </span>
                ))}
              </div>
              <div className="space-y-2 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Confidence</span>
                  <span className="font-semibold text-gray-800">{b.confidence}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Lift Score</span>
                  <span className="font-semibold text-[#1ABC9C]">{b.lift}x</span>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">
                    {b.lift >= 2 ? "Strong" : "Good"} association — consider bundling!
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
