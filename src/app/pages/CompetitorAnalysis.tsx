import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const ratingComparisonData = [
  { name: "Your Cafe", rating: 4.6, color: "#6F4E37" },
  { name: "Coffee Corner", rating: 4.2, color: "#94A3B8" },
  { name: "Brew & Bean", rating: 4.4, color: "#94A3B8" },
  { name: "Java Junction", rating: 4.1, color: "#94A3B8" },
  { name: "Cafe Mocha", rating: 4.3, color: "#94A3B8" },
];

const sentimentRadarData = [
  { category: "Food Quality", yourCafe: 85, avgCompetitor: 72 },
  { category: "Service", yourCafe: 78, avgCompetitor: 75 },
  { category: "Ambiance", yourCafe: 82, avgCompetitor: 68 },
  { category: "Price", yourCafe: 65, avgCompetitor: 70 },
  { category: "Cleanliness", yourCafe: 88, avgCompetitor: 74 },
  { category: "Speed", yourCafe: 72, avgCompetitor: 76 },
];

const pricePositioningData = [
  { name: "Your Cafe", price: 4.2, quality: 4.6, size: 800 },
  { name: "Coffee Corner", price: 3.8, quality: 4.2, size: 600 },
  { name: "Brew & Bean", price: 4.5, quality: 4.4, size: 700 },
  { name: "Java Junction", price: 3.5, quality: 4.1, size: 500 },
  { name: "Cafe Mocha", price: 4.0, quality: 4.3, size: 650 },
];

const competitorMetrics = [
  {
    name: "Coffee Corner",
    rating: 4.2,
    sentiment: 68,
    avgPrice: "$3.80",
    marketShare: 18,
    trend: "stable",
  },
  {
    name: "Brew & Bean",
    rating: 4.4,
    sentiment: 72,
    avgPrice: "$4.50",
    marketShare: 22,
    trend: "up",
  },
  {
    name: "Java Junction",
    rating: 4.1,
    sentiment: 65,
    avgPrice: "$3.50",
    marketShare: 15,
    trend: "down",
  },
  {
    name: "Cafe Mocha",
    rating: 4.3,
    sentiment: 70,
    avgPrice: "$4.00",
    marketShare: 20,
    trend: "up",
  },
];

const strengthsWeaknesses = {
  strengths: [
    { label: "Food Quality", score: 85, advantage: "+13 vs avg" },
    { label: "Cleanliness", score: 88, advantage: "+14 vs avg" },
    { label: "Ambiance", score: 82, advantage: "+14 vs avg" },
  ],
  weaknesses: [
    { label: "Pricing", score: 65, disadvantage: "-5 vs avg" },
    { label: "Service Speed", score: 72, disadvantage: "-4 vs avg" },
  ],
};

export function CompetitorAnalysis() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Competitor Benchmarking</h1>
        <p className="text-gray-600">Compare your performance against key competitors</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#6F4E37] to-[#5d4230] rounded-xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90 mb-1">Your Market Position</p>
          <p className="text-3xl font-bold mb-1">#2</p>
          <p className="text-sm opacity-80">Out of 5 competitors</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Rating vs Avg</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">4.6</p>
          <p className="text-xs text-green-600">+0.4 above average</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Market Share</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">25%</p>
          <p className="text-xs text-green-600">+3% this quarter</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Price Index</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">108</p>
          <p className="text-xs text-gray-600">8% above avg</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Rating Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Rating Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" angle={-15} textAnchor="end" height={80} />
              <YAxis domain={[0, 5]} stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="rating" radius={[8, 8, 0, 0]}>
                {ratingComparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Radar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Multi-Aspect Sentiment Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={sentimentRadarData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="category" stroke="#6B7280" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6B7280" />
              <Radar name="Your Cafe" dataKey="yourCafe" stroke="#6F4E37" fill="#6F4E37" fillOpacity={0.6} />
              <Radar
                name="Avg Competitor"
                dataKey="avgCompetitor"
                stroke="#94A3B8"
                fill="#94A3B8"
                fillOpacity={0.4}
              />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Price Positioning */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price vs Quality Positioning</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" dataKey="price" name="Avg Price ($)" domain={[3, 5]} stroke="#6B7280" />
            <YAxis type="number" dataKey="quality" name="Rating" domain={[3.8, 4.8]} stroke="#6B7280" />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
              }}
            />
            <Scatter name="Competitors" data={pricePositioningData}>
              {pricePositioningData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.name === "Your Cafe" ? "#6F4E37" : "#94A3B8"}
                  fillOpacity={entry.name === "Your Cafe" ? 1 : 0.6}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-[#6F4E37]">Insight:</span> Your cafe is positioned in the premium
            segment with high quality ratings. Consider maintaining premium pricing strategy while highlighting value
            propositions.
          </p>
        </div>
      </div>

      {/* Competitor Metrics Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Competitor Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Competitor</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Rating</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Sentiment %</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Avg Price</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Market Share</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Trend</th>
              </tr>
            </thead>
            <tbody>
              {competitorMetrics.map((competitor, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{competitor.name}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-semibold text-gray-900">{competitor.rating}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {competitor.sentiment}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-sm font-medium text-gray-900">{competitor.avgPrice}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex-1 max-w-[60px] h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1ABC9C]"
                          style={{ width: `${(competitor.marketShare / 25) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{competitor.marketShare}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        competitor.trend === "up"
                          ? "bg-green-100 text-green-800"
                          : competitor.trend === "down"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {competitor.trend === "up" && "↑ Growing"}
                      {competitor.trend === "down" && "↓ Declining"}
                      {competitor.trend === "stable" && "→ Stable"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitive Strengths */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">💪</span>
            Competitive Strengths
          </h3>
          <div className="space-y-3">
            {strengthsWeaknesses.strengths.map((strength, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{strength.label}</span>
                  <span className="text-sm font-semibold text-green-600">{strength.advantage}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${strength.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            Areas for Improvement
          </h3>
          <div className="space-y-3">
            {strengthsWeaknesses.weaknesses.map((weakness, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-yellow-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{weakness.label}</span>
                  <span className="text-sm font-semibold text-yellow-700">{weakness.disadvantage}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: `${weakness.score}%` }} />
                </div>
              </div>
            ))}
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Recommendation:</span> Focus on improving service speed and offering
                value-based promotions to compete on pricing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
