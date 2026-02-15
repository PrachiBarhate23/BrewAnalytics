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

const recommendations = [
  {
    id: 1,
    category: "Revenue Optimization",
    severity: "high",
    icon: AlertTriangle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    title: "Weekday Evening Revenue Drop Alert",
    description:
      "Sales data shows a 12% decline in weekday evening revenue (5-8 PM) compared to last month. Customer traffic decreased by 18% during this period.",
    recommendation:
      "Implement a 'Happy Hour' promotion offering 10% discount on beverages during 5-7 PM weekdays. Expected revenue increase: +$2,400/month.",
    impact: "High",
    effort: "Low",
    roi: "+$2.4K/month",
    actions: ["Create promotion campaign", "Update menu boards", "Train staff on new offers"],
  },
  {
    id: 2,
    category: "Inventory Management",
    severity: "high",
    icon: Package,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    title: "Croissant Inventory Running Low",
    description:
      "Current inventory levels are critically low. Based on demand forecast, stockout risk is 85% within 48 hours. High demand expected this weekend.",
    recommendation:
      "Immediate restock of 200 units recommended. Consider increasing safety stock levels by 25% to prevent future stockouts.",
    impact: "High",
    effort: "Low",
    roi: "Prevent $800 lost revenue",
    actions: ["Contact supplier immediately", "Place emergency order", "Adjust reorder points"],
  },
  {
    id: 3,
    category: "Menu Optimization",
    severity: "medium",
    icon: TrendingUp,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Create Coffee + Croissant Combo",
    description:
      "Market basket analysis reveals 68% of customers who buy Cappuccino also purchase Croissants. This is the strongest product association in your menu.",
    recommendation:
      "Launch a 'Morning Starter' combo bundling Cappuccino + Croissant at $10.99 (vs $12.50 separate). Projected to increase combo sales by 24%.",
    impact: "Medium",
    effort: "Low",
    roi: "+$1.8K/month",
    actions: ["Design combo offer", "Update POS system", "Create marketing materials"],
  },
  {
    id: 4,
    category: "Pricing Strategy",
    severity: "medium",
    icon: DollarSign,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: "Espresso Underpriced vs Market",
    description:
      "Competitor analysis shows your Espresso is priced 15% below market average despite receiving the highest quality ratings (4.8/5).",
    recommendation:
      "Increase Espresso price from $3.50 to $3.99 (14% increase). Quality perception supports premium pricing. Minimal impact on demand expected.",
    impact: "Medium",
    effort: "Low",
    roi: "+$980/month",
    actions: ["Update pricing", "Emphasize quality in marketing", "Monitor customer response"],
  },
  {
    id: 5,
    category: "Customer Experience",
    severity: "medium",
    icon: Users,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    title: "Service Speed Improvement Needed",
    description:
      "Sentiment analysis shows 18% of recent reviews mention slow service during lunch rush (12-2 PM). Average wait time: 8.5 minutes vs target 5 minutes.",
    recommendation:
      "Add 1 additional staff member during peak lunch hours. Implement mobile order-ahead system to reduce in-store wait times.",
    impact: "High",
    effort: "Medium",
    roi: "Improve satisfaction +12%",
    actions: ["Hire part-time staff", "Implement mobile ordering", "Optimize workflow"],
  },
  {
    id: 6,
    category: "Marketing Opportunity",
    severity: "low",
    icon: Target,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    title: "Leverage Positive Food Quality Reviews",
    description:
      "85% positive sentiment on food quality - significantly higher than competitors (avg 72%). This is your strongest differentiator.",
    recommendation:
      "Launch a social media campaign highlighting fresh ingredients and customer testimonials. Focus on Instagram and local food blogs.",
    impact: "Medium",
    effort: "Medium",
    roi: "Increase awareness +20%",
    actions: ["Create content calendar", "Collect customer testimonials", "Partner with food influencers"],
  },
  {
    id: 7,
    category: "Operational Efficiency",
    severity: "low",
    icon: Zap,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    title: "Peak Hour Staffing Optimization",
    description:
      "Sales forecasting shows Saturday mornings (8-11 AM) generate 35% of weekend revenue but are understaffed by 20%.",
    recommendation:
      "Increase Saturday morning staff from 4 to 5 employees. Predictive model shows this will reduce wait times by 40% and increase revenue by 8%.",
    impact: "Medium",
    effort: "Low",
    roi: "+$1.2K/month",
    actions: ["Adjust staff schedule", "Recruit weekend staff", "Monitor performance metrics"],
  },
  {
    id: 8,
    category: "Risk Alert",
    severity: "high",
    icon: AlertTriangle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    title: "Negative Review Spike Detected",
    description:
      "Negative sentiment increased by 45% in the past week. Primary complaints: coffee temperature (12 mentions) and slow service (8 mentions).",
    recommendation:
      "Immediate action required: Check espresso machine calibration, retrain baristas on temperature standards, and increase lunch staff.",
    impact: "High",
    effort: "Low",
    roi: "Prevent reputation damage",
    actions: ["Equipment check", "Staff retraining", "Respond to reviews"],
  },
];

const priorityScore = (rec: typeof recommendations[0]) => {
  const severityScore = rec.severity === "high" ? 3 : rec.severity === "medium" ? 2 : 1;
  const impactScore = rec.impact === "High" ? 3 : rec.impact === "Medium" ? 2 : 1;
  return severityScore * 10 + impactScore;
};

const sortedRecommendations = [...recommendations].sort((a, b) => priorityScore(b) - priorityScore(a));

export function Recommendations() {
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
          <p className="text-3xl font-bold">3</p>
          <p className="text-sm opacity-80">Require immediate action</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Medium Priority</h3>
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">4</p>
          <p className="text-sm opacity-80">Act within this week</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Low Priority</h3>
            <Target className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">1</p>
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
          const Icon = rec.icon;
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
                    {rec.actions.map((action, index) => (
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
