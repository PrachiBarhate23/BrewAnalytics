import { ThumbsUp, ThumbsDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const aspectData = [
  { aspect: "Coffee Quality", positive: 420, negative: 45, neutral: 85 },
  { aspect: "Food Freshness", positive: 385, negative: 52, neutral: 93 },
  { aspect: "Service Speed", positive: 298, negative: 112, neutral: 140 },
  { aspect: "Staff Friendliness", positive: 445, negative: 38, neutral: 67 },
  { aspect: "Ambiance", positive: 372, negative: 48, neutral: 130 },
  { aspect: "Cleanliness", positive: 465, negative: 28, neutral: 57 },
  { aspect: "Value for Money", positive: 285, negative: 135, neutral: 130 },
  { aspect: "Portion Size", positive: 340, negative: 72, neutral: 138 },
];

const topPhrases = {
  positive: [
    { phrase: "excellent coffee", count: 142 },
    { phrase: "friendly staff", count: 128 },
    { phrase: "cozy atmosphere", count: 115 },
    { phrase: "fresh pastries", count: 98 },
    { phrase: "great service", count: 87 },
  ],
  negative: [
    { phrase: "slow service", count: 45 },
    { phrase: "expensive prices", count: 38 },
    { phrase: "long wait", count: 32 },
    { phrase: "small portions", count: 28 },
    { phrase: "noisy environment", count: 22 },
  ],
};

export function AspectAnalysis() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Aspect-Based Analysis</h1>
        <p className="text-gray-600">Deep dive into specific aspects of customer feedback</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Most Praised Aspect</p>
          <p className="text-2xl font-bold text-green-600 mb-1">Cleanliness</p>
          <p className="text-xs text-gray-600">465 positive mentions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Needs Improvement</p>
          <p className="text-2xl font-bold text-red-600 mb-1">Value for Money</p>
          <p className="text-xs text-gray-600">135 negative mentions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Total Aspects Analyzed</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">8</p>
          <p className="text-xs text-gray-600">Across 2,350 reviews</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Overall Satisfaction</p>
          <p className="text-2xl font-bold text-[#1ABC9C] mb-1">73%</p>
          <p className="text-xs text-gray-600">Average positive rate</p>
        </div>
      </div>

      {/* Aspect Sentiment Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment by Aspect</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={aspectData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" stroke="#6B7280" />
            <YAxis type="category" dataKey="aspect" stroke="#6B7280" width={150} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="positive" fill="#10B981" name="Positive" radius={[0, 4, 4, 0]} />
            <Bar dataKey="neutral" fill="#F59E0B" name="Neutral" radius={[0, 4, 4, 0]} />
            <Bar dataKey="negative" fill="#EF4444" name="Negative" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Phrases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Positive Phrases */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Top Positive Phrases</h3>
          </div>
          <div className="space-y-3">
            {topPhrases.positive.map((phrase, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-100">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-green-600">#{index + 1}</span>
                  <span className="text-sm font-medium text-gray-900">{phrase.phrase}</span>
                </div>
                <span className="text-sm font-semibold text-gray-600">{phrase.count} mentions</span>
              </div>
            ))}
          </div>
        </div>

        {/* Negative Phrases */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsDown className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Top Negative Phrases</h3>
          </div>
          <div className="space-y-3">
            {topPhrases.negative.map((phrase, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-100">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-red-600">#{index + 1}</span>
                  <span className="text-sm font-medium text-gray-900">{phrase.phrase}</span>
                </div>
                <span className="text-sm font-semibold text-gray-600">{phrase.count} mentions</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
