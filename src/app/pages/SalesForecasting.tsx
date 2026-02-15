import { TrendingUp, Calendar } from "lucide-react";
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
  Area,
  AreaChart,
} from "recharts";

const revenueForecastData = [
  { month: "Jan", actual: 45000, forecast: null },
  { month: "Feb", actual: 52000, forecast: null },
  { month: "Mar", actual: 48000, forecast: null },
  { month: "Apr", actual: 61000, forecast: null },
  { month: "May", actual: 55000, forecast: null },
  { month: "Jun", actual: 67000, forecast: null },
  { month: "Jul", actual: 72000, forecast: null },
  { month: "Aug", actual: 68000, forecast: null },
  { month: "Sep", actual: null, forecast: 74000, lower: 70000, upper: 78000 },
  { month: "Oct", actual: null, forecast: 78000, lower: 73000, upper: 83000 },
  { month: "Nov", actual: null, forecast: 82000, lower: 76000, upper: 88000 },
  { month: "Dec", actual: null, forecast: 95000, lower: 88000, upper: 102000 },
];

const itemDemandForecast = [
  { item: "Cappuccino", current: 2845, forecast: 3120, change: "+9.7%" },
  { item: "Croissant", current: 2145, forecast: 2380, change: "+11.0%" },
  { item: "Latte", current: 1980, forecast: 2140, change: "+8.1%" },
  { item: "Espresso", current: 1756, forecast: 1890, change: "+7.6%" },
  { item: "Muffin", current: 1432, forecast: 1545, change: "+7.9%" },
];

const seasonalityData = [
  { day: "Mon", morning: 65, afternoon: 45, evening: 30 },
  { day: "Tue", morning: 68, afternoon: 48, evening: 32 },
  { day: "Wed", morning: 72, afternoon: 52, evening: 35 },
  { day: "Thu", morning: 70, afternoon: 55, evening: 38 },
  { day: "Fri", morning: 75, afternoon: 60, evening: 50 },
  { day: "Sat", morning: 85, afternoon: 70, evening: 55 },
  { day: "Sun", morning: 80, afternoon: 65, evening: 45 },
];

export function SalesForecasting() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Forecasting</h1>
        <p className="text-gray-600">Predict future revenue and demand using AI-powered analytics</p>
      </div>

      {/* Forecast Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#6F4E37] to-[#5d4230] rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="text-sm font-medium opacity-90">Next Month Forecast</h3>
          </div>
          <p className="text-3xl font-bold mb-1">$74,000</p>
          <p className="text-sm opacity-80">+8.8% from current month</p>
        </div>

        <div className="bg-gradient-to-br from-[#1ABC9C] to-[#17a085] rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5" />
            <h3 className="text-sm font-medium opacity-90">Q4 Projection</h3>
          </div>
          <p className="text-3xl font-bold mb-1">$249,000</p>
          <p className="text-sm opacity-80">Confidence: 87%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="text-sm font-medium opacity-90">YoY Growth Rate</h3>
          </div>
          <p className="text-3xl font-bold mb-1">+18.5%</p>
          <p className="text-sm opacity-80">Projected annual increase</p>
        </div>
      </div>

      {/* Revenue Forecast Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Forecast with Confidence Interval</h3>
            <p className="text-sm text-gray-600 mt-1">Historical data (solid) vs predicted values (dashed)</p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#6F4E37] text-white">
              Actual
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#1ABC9C] text-white">
              Forecast
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={revenueForecastData}>
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
            <Legend />
            {/* Confidence Interval */}
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="#1ABC9C"
              fillOpacity={0.2}
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="#1ABC9C"
              fillOpacity={0.2}
            />
            {/* Actual Revenue */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#6F4E37"
              strokeWidth={3}
              dot={{ fill: "#6F4E37", r: 5 }}
              name="Actual Revenue"
            />
            {/* Forecast Revenue */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#1ABC9C"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: "#1ABC9C", r: 5 }}
              name="Forecast Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Item Demand & Seasonality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Item-Level Demand Forecast */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Item-Level Demand Forecast</h3>
          <div className="space-y-4">
            {itemDemandForecast.map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{item.item}</span>
                  <span className="text-sm font-semibold text-green-600">{item.change}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Current: {item.current}</span>
                      <span>Forecast: {item.forecast}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#6F4E37] to-[#1ABC9C]"
                        style={{ width: `${(item.current / item.forecast) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonality Heatmap */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Sales Pattern</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={seasonalityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="morning" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Morning" />
              <Bar dataKey="afternoon" fill="#1ABC9C" radius={[4, 4, 0, 0]} name="Afternoon" />
              <Bar dataKey="evening" fill="#6F4E37" radius={[4, 4, 0, 0]} name="Evening" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Forecast Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📈</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Strong Q4 Growth Expected</h4>
                <p className="text-sm text-gray-600">
                  December shows 40% increase vs August. Prepare additional inventory for holiday season.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">☕</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Cappuccino Demand Rising</h4>
                <p className="text-sm text-gray-600">
                  Forecast shows 9.7% increase in demand. Consider running promotional campaigns.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Weekend Peak Performance</h4>
                <p className="text-sm text-gray-600">
                  Saturdays show highest sales. Optimize staffing and inventory for weekend rush.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Morning Rush Opportunity</h4>
                <p className="text-sm text-gray-600">
                  Peak morning sales 8-10 AM. Consider breakfast combo offers to boost revenue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
