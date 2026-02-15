import { Filter, Download } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const sentimentTrendData = [
  { date: "Jan", positive: 58, neutral: 30, negative: 12 },
  { date: "Feb", positive: 62, neutral: 28, negative: 10 },
  { date: "Mar", positive: 60, neutral: 27, negative: 13 },
  { date: "Apr", positive: 65, neutral: 25, negative: 10 },
  { date: "May", positive: 63, neutral: 26, negative: 11 },
  { date: "Jun", positive: 67, neutral: 24, negative: 9 },
  { date: "Jul", positive: 65, neutral: 25, negative: 10 },
];

const aspectSentimentData = [
  { aspect: "Food Quality", positive: 85, negative: 15 },
  { aspect: "Service", positive: 72, negative: 28 },
  { aspect: "Ambiance", positive: 78, negative: 22 },
  { aspect: "Price", positive: 58, negative: 42 },
  { aspect: "Cleanliness", positive: 88, negative: 12 },
];

const recentReviews = [
  {
    id: 1,
    customer: "Sarah Johnson",
    rating: 5,
    sentiment: "Positive",
    text: "Amazing coffee and wonderful atmosphere! The barista was very friendly.",
    date: "2 hours ago",
  },
  {
    id: 2,
    customer: "Mike Chen",
    rating: 4,
    sentiment: "Positive",
    text: "Great croissants, but the wait time was a bit long during lunch rush.",
    date: "5 hours ago",
  },
  {
    id: 3,
    customer: "Emily Davis",
    rating: 3,
    sentiment: "Neutral",
    text: "Coffee was good but prices are slightly higher than competitors.",
    date: "1 day ago",
  },
  {
    id: 4,
    customer: "James Wilson",
    rating: 5,
    sentiment: "Positive",
    text: "Best cappuccino in town! Love the cozy ambiance and fast service.",
    date: "1 day ago",
  },
  {
    id: 5,
    customer: "Lisa Anderson",
    rating: 2,
    sentiment: "Negative",
    text: "Service was slow and coffee was lukewarm. Expected better quality.",
    date: "2 days ago",
  },
];

const wordCloudWords = [
  { text: "Coffee", size: 48 },
  { text: "Friendly", size: 36 },
  { text: "Quality", size: 42 },
  { text: "Cozy", size: 32 },
  { text: "Fresh", size: 38 },
  { text: "Delicious", size: 44 },
  { text: "Service", size: 34 },
  { text: "Ambiance", size: 30 },
  { text: "Amazing", size: 36 },
  { text: "Great", size: 40 },
];

export function SentimentAnalysis() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sentiment Analysis</h1>
          <p className="text-gray-600">Analyze customer feedback and sentiment trends</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#6F4E37] text-white rounded-lg hover:bg-[#5d4230] transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Sentiment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-800">Positive Sentiment</h3>
            <span className="text-2xl">😊</span>
          </div>
          <p className="text-3xl font-bold text-green-900 mb-1">65%</p>
          <p className="text-sm text-green-700">+8% from last month</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-yellow-800">Neutral Sentiment</h3>
            <span className="text-2xl">😐</span>
          </div>
          <p className="text-3xl font-bold text-yellow-900 mb-1">25%</p>
          <p className="text-sm text-yellow-700">-2% from last month</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-red-800">Negative Sentiment</h3>
            <span className="text-2xl">😞</span>
          </div>
          <p className="text-3xl font-bold text-red-900 mb-1">10%</p>
          <p className="text-sm text-red-700">-6% from last month</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sentiment Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Trend Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sentimentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="positive"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="neutral"
                stackId="1"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="negative"
                stackId="1"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Aspect-Based Sentiment */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aspect-Based Sentiment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={aspectSentimentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" />
              <YAxis type="category" dataKey="aspect" stroke="#6B7280" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="positive" fill="#10B981" radius={[0, 4, 4, 0]} />
              <Bar dataKey="negative" fill="#EF4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Word Cloud Simulation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Frequent Words in Reviews</h3>
        <div className="flex flex-wrap gap-4 justify-center items-center min-h-[200px] bg-gradient-to-br from-[#F5E6D3]/30 to-[#F9FAFB] rounded-lg p-8">
          {wordCloudWords.map((word, index) => (
            <span
              key={index}
              className="font-semibold text-[#6F4E37] hover:text-[#1ABC9C] transition-colors cursor-pointer"
              style={{ fontSize: `${word.size}px` }}
            >
              {word.text}
            </span>
          ))}
        </div>
      </div>

      {/* Recent Reviews Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Customer Reviews</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rating</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sentiment</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Review</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentReviews.map((review) => (
                <tr key={review.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-900">{review.customer}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        review.sentiment === "Positive"
                          ? "bg-green-100 text-green-800"
                          : review.sentiment === "Neutral"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {review.sentiment}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 max-w-md">{review.text}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{review.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
