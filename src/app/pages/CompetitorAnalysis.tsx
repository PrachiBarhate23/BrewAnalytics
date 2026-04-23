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

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// Data is now fetched dynamically from the API

export function CompetitorAnalysis() {
  const { authHeader, user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fallback to a placeholder if user context isn't ready
  const activeShop = user?.shop || "Vrindavan Restaurant";

  useEffect(() => {
    fetch("/api/sales/competitors", { headers: authHeader() })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load competitor data");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch competitor data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-600">Loading competitor analysis...</div>;
  }

  if (!data || data.detail) {
    return <div className="p-8 text-red-600">Error loading competitor data: {data?.detail || 'Unknown error'}</div>;
  }

  const {
    ratingComparisonData,
    sentimentRadarData,
    pricePositioningData,
    competitorMetrics,
    strengthsWeaknesses
  } = data;

  // Calculate dynamic header values from current user position
  const userMetric = competitorMetrics.find((m: any) => m.color === "#6F4E37") || competitorMetrics[0];
  const userRank = competitorMetrics.findIndex((m: any) => m.name === userMetric?.name) + 1;

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
          <p className="text-3xl font-bold mb-1">#{userRank}</p>
          <p className="text-sm opacity-80">Out of {competitorMetrics.length} competitors</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Rating vs Avg</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{userMetric?.rating?.toFixed(1) || "4.6"}</p>
          <p className="text-xs text-green-600">Based on demand</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Market Share</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{userMetric?.marketShare || "25"}%</p>
          <p className="text-xs text-green-600">Trending {userMetric?.trend || "up"}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Avg Price</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{userMetric?.avgPrice || "$4.20"}</p>
          <p className="text-xs text-gray-600">Premium pricing</p>
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
