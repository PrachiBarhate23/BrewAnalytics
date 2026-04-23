import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, Calendar, BarChart2, Cpu,
  ArrowUpRight, ArrowDownRight, RefreshCw, Info
} from "lucide-react";
import {
  ComposedChart, Line, Area,
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from "recharts";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:8000";

// ─── INR formatter ────────────────────────────────────────────────────────────
const inr = (n: number) =>
  n >= 1_00_00_000
    ? `₹${(n / 1_00_00_000).toFixed(1)}Cr`
    : n >= 1_00_000
    ? `₹${(n / 1_00_000).toFixed(1)}L`
    : `₹${n.toLocaleString("en-IN")}`;

// ─── Outlet colours ────────────────────────────────────────────────────────────
const COLORS = [
  "#6F4E37","#1ABC9C","#3B82F6","#F59E0B","#EF4444",
  "#8B5CF6","#EC4899","#10B981","#F97316",
];

// ─── Custom Tooltip for forecast chart ────────────────────────────────────────
const ForecastTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-gray-800 mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-semibold text-gray-900">
            {p.value != null ? inr(p.value) : "—"}
          </span>
        </div>
      ))}
    </div>
  );
};

export function SalesForecasting() {
  const { authHeader, user } = useAuth();
  const [data, setData]         = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [horizon, setHorizon]   = useState(90);
  const [fetching, setFetching] = useState(false);

  const load = useCallback((h: number) => {
    setFetching(true);
    setError("");
    fetch(`${API}/api/sales/forecast?horizon=${h}`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => { setData(d); setFetching(false); setLoading(false); })
      .catch(e => { setError(e.message); setFetching(false); setLoading(false); });
  }, [user?.shop]);

  useEffect(() => { load(horizon); }, [load]);

  const changeHorizon = (h: number) => { setHorizon(h); load(h); };

  // ── Loading / Error ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="p-8 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#1ABC9C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Running Forecast Model…</p>
        <p className="text-gray-400 text-sm mt-1">STL Decomposition + ARIMA(1,1,1) · {user?.shop}</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-semibold mb-2">Forecast model error</p>
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <button onClick={() => load(horizon)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Retry
        </button>
      </div>
    </div>
  );

  const kpis          = data?.kpis                || {};
  const chartData     = data?.chart_data          || [];
  const weekSeason    = data?.weekly_seasonality  || [];
  const monthSeason   = data?.monthly_seasonality || [];
  const outletFC      = data?.outlet_forecasts    || [];
  const itemDemand    = data?.item_demand_forecast || [];
  const modelInfo     = data?.model_info          || {};

  // Detect FastAPI error response (e.g. {"detail": "..."})
  if (data?.detail && !data?.chart_data) return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-semibold mb-2">Forecast model error</p>
        <p className="text-red-400 text-sm mb-4">{data.detail}</p>
        <button onClick={() => load(horizon)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Retry
        </button>
      </div>
    </div>
  );

  // Blank guard — data loaded but empty
  if (!data || chartData.length === 0) return (
    <div className="p-8 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#1ABC9C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Running Forecast Model...</p>
        <p className="text-gray-400 text-sm mt-1">STL Decomposition + ARIMA(1,1,1) · {user?.shop}</p>
      </div>
    </div>
  );

  // Confidence colour
  const confColor = kpis.model_confidence >= 80
    ? "text-emerald-600" : kpis.model_confidence >= 60
    ? "text-amber-500"   : "text-red-500";

  return (
    <div className="p-8">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Sales Forecasting</h1>
          <p className="text-gray-500 text-sm flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            {user?.shop} · {modelInfo.method || "STL + ARIMA"} · Trained on {modelInfo.fitted_on_days} days
          </p>
        </div>

        {/* Horizon picker */}
        <div className="flex items-center gap-2">
          {[30,60,90,180].map(h => (
            <button key={h} onClick={() => changeHorizon(h)}
              disabled={fetching}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${horizon === h
                  ? "bg-[#6F4E37] text-white shadow"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {h}d
            </button>
          ))}
          <button onClick={() => load(horizon)} disabled={fetching}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className={`w-4 h-4 text-gray-500 ${fetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Next period forecast */}
        <div className="bg-gradient-to-br from-[#6F4E37] to-[#4a3325] rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 opacity-80" />
            <span className="text-xs font-medium opacity-80">Next {horizon}d Forecast</span>
          </div>
          <p className="text-3xl font-bold mb-1">{inr(kpis.next_30_forecast || 0)}</p>
          <p className="text-xs opacity-70">Current period: {inr(kpis.current_30_actual || 0)}</p>
        </div>

        {/* Growth rate */}
        <div className="bg-gradient-to-br from-[#1ABC9C] to-[#0e8a6e] rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 opacity-80" />
            <span className="text-xs font-medium opacity-80">Projected Growth</span>
          </div>
          <p className="text-3xl font-bold mb-1">
            {kpis.growth_rate >= 0 ? "+" : ""}{kpis.growth_rate}%
          </p>
          <p className="text-xs opacity-70">vs current period</p>
        </div>

        {/* YoY growth */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-4 h-4 opacity-80" />
            <span className="text-xs font-medium opacity-80">YoY Growth</span>
          </div>
          <p className="text-3xl font-bold mb-1">
            {kpis.yoy_growth >= 0 ? "+" : ""}{kpis.yoy_growth}%
          </p>
          <p className="text-xs opacity-70">2024 → 2025 comparison</p>
        </div>

        {/* Model confidence */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">Model Confidence</span>
          </div>
          <p className={`text-3xl font-bold mb-1 ${confColor}`}>{kpis.model_confidence}%</p>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${kpis.model_confidence >= 80 ? "bg-emerald-500" : "bg-amber-400"}`}
              style={{ width: `${kpis.model_confidence}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">Based on residual MAPE</p>
        </div>
      </div>

      {/* ── Forecast Chart: Actual + CI Band + Forecast ──────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Forecast with 95% Confidence Interval</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Historical actuals (solid brown) · STL+ARIMA forecast (dashed teal) · Shaded band = 95% CI · {user?.shop}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#6F4E37]/10 text-[#6F4E37]">
              ─ Actual
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#1ABC9C]/10 text-[#1ABC9C]">
              ╌ Forecast
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={chartData} margin={{ left: 10, right: 20 }}>
            <defs>
              <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1ABC9C" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#1ABC9C" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 10 }} interval={0}
              angle={-30} textAnchor="end" height={45} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }}
              tickFormatter={v => v >= 1_00_000 ? `${(v/1_00_000).toFixed(1)}L` : `${v}`} />
            <Tooltip content={<ForecastTooltip />} />
            <Legend />
            {/* 95% CI band */}
            <Area type="monotone" dataKey="upper" fill="url(#ciGrad)" stroke="none"
              name="CI Upper" legendType="none" />
            <Area type="monotone" dataKey="lower" fill="#fff" stroke="none"
              name="CI Lower" legendType="none" />
            {/* Actual */}
            <Line type="monotone" dataKey="actual" stroke="#6F4E37" strokeWidth={3}
              dot={{ fill:"#6F4E37", r:5 }} name="Actual Revenue"
              connectNulls={false} />
            {/* Forecast */}
            <Line type="monotone" dataKey="forecast" stroke="#1ABC9C" strokeWidth={2.5}
              strokeDasharray="8 4" dot={{ fill:"#1ABC9C", r:4 }} name="Forecast"
              connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Weekly + Monthly Seasonality side-by-side ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Weekly seasonality index */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-2 mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Weekly Seasonality Index</h3>
              <p className="text-xs text-gray-400 mt-0.5">100 = average weekday. Higher = busier day.</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekSeason} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="day" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <YAxis domain={[60, 140]} stroke="#9CA3AF" tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: any) => [`${v}`, "Seasonality Index"]}
                contentStyle={{ borderRadius:8 }} />
              <ReferenceLine y={100} stroke="#D1D5DB" strokeDasharray="4 2" label={{ value:"Avg", fill:"#9CA3AF", fontSize:10 }} />
              <Bar dataKey="index" radius={[6,6,0,0]} name="Seasonality Index">
                {weekSeason.map((d: any, i: number) => (
                  <Cell key={i} fill={d.index >= 110 ? "#1ABC9C" : d.index <= 90 ? "#EF4444" : "#6F4E37"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 text-xs justify-center">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#1ABC9C] rounded-sm" /> Peak (&gt;110)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#6F4E37] rounded-sm" /> Average</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-400 rounded-sm" /> Low (&lt;90)</span>
          </div>
        </div>

        {/* Monthly seasonality */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Monthly Seasonality</h3>
          <p className="text-xs text-gray-400 mb-4">Seasonal demand index per month (100 = baseline)</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {monthSeason.map((m: any, i: number) => (
              <div key={i} className={`rounded-lg p-2.5 text-center border
                ${m.is_peak ? "bg-emerald-50 border-emerald-200" :
                  m.is_low  ? "bg-red-50 border-red-200" :
                  "bg-gray-50 border-gray-100"}`}>
                <p className="text-xs font-semibold text-gray-600">{m.month_short}</p>
                <p className={`text-base font-bold mt-0.5
                  ${m.is_peak ? "text-emerald-700" : m.is_low ? "text-red-500" : "text-gray-800"}`}>
                  {m.index}
                </p>
                {m.is_peak && <span className="text-[9px] text-emerald-600 font-bold">PEAK</span>}
                {m.is_low  && <span className="text-[9px] text-red-500 font-bold">LOW</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Outlet-Level Forecasts ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Outlet-Level 30-Day Revenue Forecast</h3>
        <p className="text-xs text-gray-400 mb-5">ARIMA(1,1,0) per outlet · shaded bar = 95% confidence band</p>
        <div className="space-y-4">
          {outletFC.map((o: any, i: number) => {
            const maxRev = outletFC[0]?.next_30_rev || 1;
            const growthPositive = o.growth >= 0;
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="w-36 text-xs font-medium text-gray-700 truncate flex-shrink-0">{o.outlet}</span>
                <div className="flex-1 relative h-7">
                  {/* Background (confidence upper bound) */}
                  <div className="absolute inset-y-1 rounded-full bg-gray-100"
                    style={{ width: `${(o.upper / maxRev) * 100}%` }} />
                  {/* Forecast bar */}
                  <div className="absolute inset-y-1 rounded-full transition-all duration-700"
                    style={{
                      width: `${(o.next_30_rev / maxRev) * 100}%`,
                      background: COLORS[i % COLORS.length],
                    }} />
                  {/* Lower CI */}
                  <div className="absolute inset-y-1.5 rounded-full opacity-20"
                    style={{
                      width: `${(o.lower / maxRev) * 100}%`,
                      background: COLORS[i % COLORS.length],
                    }} />
                </div>
                <span className="text-xs font-bold text-gray-800 w-20 text-right flex-shrink-0">
                  {inr(o.next_30_rev)}
                </span>
                <span className={`text-[11px] font-bold w-14 text-right flex-shrink-0 flex items-center justify-end gap-0.5
                  ${growthPositive ? "text-emerald-600" : "text-red-500"}`}>
                  {growthPositive
                    ? <ArrowUpRight className="w-3 h-3" />
                    : <ArrowDownRight className="w-3 h-3" />}
                  {o.growth >= 0 ? "+" : ""}{o.growth}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Item Demand Forecast ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Item-Level Demand Forecast</h3>
        <p className="text-xs text-gray-400 mb-5">
          Momentum-based projection: last 30 days vs prior 30 days, extrapolated forward · {user?.shop}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {itemDemand.map((item: any, i: number) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800 text-sm">{item.item}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                  ${item.is_growing ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-500"}`}>
                  {item.change}
                </span>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 mb-1">Current</p>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 rounded-full"
                      style={{ width: `${(item.current / Math.max(item.current, item.forecast)) * 100}%` }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{item.current.toLocaleString()} units</p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 mb-1">Forecast</p>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{
                        width: `${(item.forecast / Math.max(item.current, item.forecast)) * 100}%`,
                        background: item.is_growing ? "#1ABC9C" : "#EF4444"
                      }} />
                  </div>
                  <p className="text-xs font-semibold mt-1"
                    style={{ color: item.is_growing ? "#1ABC9C" : "#EF4444" }}>
                    {item.forecast.toLocaleString()} units
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Model Info Badge ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Forecasting Methodology</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>STL (Seasonal-Trend Decomposition via LOESS)</strong> separates the 2-year
              daily revenue series into trend, weekly seasonal, and residual components.
              An <strong>ARIMA(1,1,1)</strong> model is then fitted on the trend component
              to project future values while the last observed seasonal cycle is re-added.
              Confidence intervals are computed from the 1.96σ residual standard deviation.
              Outlet-level forecasts use independent <strong>ARIMA(1,1,0)</strong> models fitted
              on each outlet's last 90 days.
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              {[
                ["Method", modelInfo.method],
                ["Seasonal Period", `${modelInfo.seasonal_period} days`],
                ["Horizon", `${modelInfo.horizon_days} days`],
                ["Training Data", `${modelInfo.fitted_on_days} days`],
                ["Residual Std", `₹${modelInfo.residual_std?.toLocaleString("en-IN") ?? "—"}`],
              ].map(([k, v]) => (
                <div key={k} className="bg-white border border-blue-100 rounded-lg px-3 py-1.5 text-xs">
                  <span className="text-gray-400">{k}: </span>
                  <span className="font-semibold text-gray-800">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
