import { useState, useEffect } from "react";
import {
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Target,
  Zap,
  Clock,
  ChevronRight,
} from "lucide-react";

// Map string icon names from API to Lucide components
const IconMap: Record<string, any> = {
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Target,
  Zap,
  Clock,
};

const priorityScore = (rec: any) => {
  const severityScore = rec.severity === "high" ? 3 : rec.severity === "medium" ? 2 : 1;
  const impactScore = rec.impact === "High" ? 3 : rec.impact === "Medium" ? 2 : 1;
  return severityScore * 10 + impactScore;
};

export function Recommendations() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recommendations")
      .then((res) => res.json())
      .then((json) => {
        if (json.recommendations) {
          setRecommendations(json.recommendations);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching recommendations:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8">Loading recommendations...</div>;
  }

  const sortedRecommendations = [...recommendations].sort((a, b) => priorityScore(b) - priorityScore(a));

  const highPriority = recommendations.filter(r => r.severity === "high").length;
  const mediumPriority = recommendations.filter(r => r.severity === "medium").length;
  const lowPriority = recommendations.filter(r => r.severity === "low").length;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Recommendations</h1>
        <p className="text-gray-600">Actionable insights to optimize your restaurant performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">High Priority</h3>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">{highPriority}</p>
          <p className="text-sm opacity-80">Require immediate action</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Medium Priority</h3>
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">{mediumPriority}</p>
          <p className="text-sm opacity-80">Act within this week</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Low Priority</h3>
            <Target className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">{lowPriority}</p>
          <p className="text-sm opacity-80">Plan for next month</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Potential ROI</h3>
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">$6.4K</p>
          <p className="text-sm opacity-80">Monthly revenue impact</p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-6">
        {sortedRecommendations.map((rec) => {
          const Icon = IconMap[rec.icon] || Zap;
          return (
            <div
              key={rec.id}
              className={`bg-white rounded-xl border-2 shadow-md hover:shadow-xl transition-all ${
                rec.severity === "high"
                  ? "border-red-200 hover:border-red-300"
                  : rec.severity === "medium"
                  ? "border-yellow-200 hover:border-yellow-300"
                  : "border-blue-200 hover:border-blue-300"
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`${rec.iconBg} p-3 rounded-lg flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${rec.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {rec.category}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mt-1">{rec.title}</h3>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          rec.severity === "high"
                            ? "bg-red-100 text-red-800"
                            : rec.severity === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {rec.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    Problem Analysis
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{rec.description}</p>
                </div>

                {/* Recommendation */}
                <div className="mb-4 p-4 bg-gradient-to-r from-[#F5E6D3]/50 to-[#F9FAFB] rounded-lg border border-[#6F4E37]/20">
                  <h4 className="text-sm font-semibold text-[#6F4E37] mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Recommended Action
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{rec.recommendation}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Impact</p>
                    <p className="text-sm font-bold text-gray-900">{rec.impact}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Effort</p>
                    <p className="text-sm font-bold text-gray-900">{rec.effort}</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-[#1ABC9C] to-[#17a085] text-white rounded-lg">
                    <p className="text-xs opacity-90 mb-1">Expected ROI</p>
                    <p className="text-sm font-bold">{rec.roi}</p>
                  </div>
                </div>

                {/* Action Steps */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Action Steps:</h4>
                  <div className="space-y-2">
                    {rec.actions.map((action: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 bg-[#6F4E37] text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#6F4E37] text-white rounded-lg hover:bg-[#5d4230] transition-colors text-sm font-medium">
                    Implement Recommendation
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
