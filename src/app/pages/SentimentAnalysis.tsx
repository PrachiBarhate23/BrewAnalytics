import { useState, useEffect } from "react";
import { Filter, Download, Send, Activity } from "lucide-react";
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

const COLOR_PALETTE = [
  "text-blue-600",
  "text-emerald-600",
  "text-amber-600",
  "text-rose-600",
  "text-indigo-600",
  "text-teal-600",
  "text-orange-600",
];

export function SentimentAnalysis() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [filterWord, setFilterWord] = useState<string | null>(null);

  // Live prediction state
  const [liveReview, setLiveReview] = useState("");
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [predicting, setPredicting] = useState(false);
  const [predictError, setPredictError] = useState("");

  const handlePredict = async () => {
    if (!liveReview.trim()) return;
    setPredicting(true);
    setPredictError("");
    setPredictionResult(null);
    try {
      const res = await fetch("/api/sentiment/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: liveReview }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setPredictionResult(json);
    } catch (err: any) {
      setPredictError(err.message || "Failed to predict");
    } finally {
      setPredicting(false);
    }
  };

  useEffect(() => {
    // We keep loading true during filter changes to show fresh state
    setLoading(true);
    const summaryUrl = filterWord 
      ? `/api/sentiment/summary?word=${encodeURIComponent(filterWord)}` 
      : "/api/sentiment/summary";

    Promise.all([
      fetch(summaryUrl).then((res) => res.json()),
      fetch("/api/sentiment/aspects").then((res) => res.json())
    ])
      .then(([summaryJson, aspectsJson]) => {
        setData({
          ...summaryJson,
          aspectData: aspectsJson.aspectData
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching sentiment data:", err);
        setLoading(false);
      });
  }, [filterWord]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  // Fallbacks if data fails
  const overview = data?.overview || { positive: 0, neutral: 0, negative: 0, positive_change: 0, neutral_change: 0, negative_change: 0 };
  const trendData = data?.trendData || [];
  const recentReviews = data?.recentReviews || [];
  const aspectSentimentData = data?.aspectData || [];
  const wordCloud = data?.wordCloud || [];

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
          <p className="text-3xl font-bold text-green-900 mb-1">{overview.positive}%</p>
          <p className="text-sm text-green-700">{overview.positive_change >= 0 ? '+' : ''}{overview.positive_change}% from last month</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-yellow-800">Neutral Sentiment</h3>
            <span className="text-2xl">😐</span>
          </div>
          <p className="text-3xl font-bold text-yellow-900 mb-1">{overview.neutral}%</p>
          <p className="text-sm text-yellow-700">{overview.neutral_change >= 0 ? '+' : ''}{overview.neutral_change}% from last month</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-red-800">Negative Sentiment</h3>
            <span className="text-2xl">😞</span>
          </div>
          <p className="text-3xl font-bold text-red-900 mb-1">{overview.negative}%</p>
          <p className="text-sm text-red-700">{overview.negative_change >= 0 ? '+' : ''}{overview.negative_change}% from last month</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sentiment Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Trend Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
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

      {/* Live AI Prediction */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#6F4E37]" />
          Live AI Sentiment Prediction (BERT Model)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Type or paste a customer review below to test the fine-tuned BERT sentiment model in real-time.
        </p>
        
        <div className="flex gap-3 mb-4">
          <textarea
            className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#1ABC9C] focus:border-[#1ABC9C] outline-none"
            rows={3}
            placeholder="E.g., The coffee was amazing, but the service was a bit slow."
            value={liveReview}
            onChange={(e) => setLiveReview(e.target.value)}
          />
          <button
            onClick={handlePredict}
            disabled={predicting || !liveReview.trim()}
            className="self-end flex items-center gap-2 px-6 py-3 bg-[#6F4E37] text-white rounded-lg hover:bg-[#5d4230] transition-colors disabled:opacity-50"
          >
            {predicting ? "Analyzing..." : (
              <>
                Analyze <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {predictError && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg mb-4">
            {predictError}
          </div>
        )}

        {predictionResult && (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 mt-4 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sentiment Result */}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Predicted Sentiment</p>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl shadow-sm rounded-full bg-white p-2 border border-gray-200">
                    {predictionResult.sentiment === "Positive" ? "😊" : predictionResult.sentiment === "Negative" ? "😞" : "😐"}
                  </span>
                  <div>
                    <p className={`text-2xl font-bold ${
                      predictionResult.sentiment === "Positive" ? "text-green-600" :
                      predictionResult.sentiment === "Negative" ? "text-red-600" : "text-yellow-600"
                    }`}>
                      {predictionResult.sentiment}
                    </p>
                    <p className="text-sm font-medium text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full inline-block mt-1">
                      Confidence: {(predictionResult.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                {/* Score breakdown */}
                <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">Raw Scores</p>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <span className="w-16">Positive</span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${predictionResult.scores.Positive * 100}%` }}></div>
                    </div>
                    <span className="w-12 text-right">{(predictionResult.scores.Positive * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <span className="w-16">Neutral</span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${predictionResult.scores.Neutral * 100}%` }}></div>
                    </div>
                    <span className="w-12 text-right">{(predictionResult.scores.Neutral * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <span className="w-16">Negative</span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${predictionResult.scores.Negative * 100}%` }}></div>
                    </div>
                    <span className="w-12 text-right">{(predictionResult.scores.Negative * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Detected Aspects */}
              <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-8">
                <p className="text-sm font-medium text-gray-600 mb-3">Detected Focus Areas (Aspects)</p>
                {predictionResult.aspects && predictionResult.aspects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {predictionResult.aspects.map((aspect: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 text-sm font-semibold rounded-lg shadow-sm">
                        {aspect}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No specific aspects detected.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Word Cloud */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Most Frequent Words in Reviews</h3>
          {filterWord && (
            <button 
              onClick={() => setFilterWord(null)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Reset View
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-6 italic">Click a word to filter the entire dashboard by that keyword.</p>
        <div className="flex flex-wrap gap-4 justify-center items-center min-h-[220px] bg-gradient-to-br from-gray-50 to-white rounded-lg p-8 border border-gray-100 shadow-inner">
          {wordCloud.length > 0 ? wordCloud.map((word: any, index: number) => {
            const colorClass = COLOR_PALETTE[index % COLOR_PALETTE.length];
            const isSelected = filterWord === word.text;
            return (
              <span
                key={index}
                onClick={() => setFilterWord(isSelected ? null : word.text)}
                className={`font-bold transition-all duration-300 cursor-pointer hover:scale-110 px-3 py-1 rounded-lg ${colorClass} ${
                  isSelected ? "bg-blue-50 ring-2 ring-blue-200 scale-110 shadow-sm" : "hover:bg-gray-50"
                }`}
                style={{ fontSize: `${word.size}px` }}
              >
                {word.text}
              </span>
            );
          }) : (
            <p className="text-gray-500 italic">No significant words extracted yet.</p>
          )}
        </div>
      </div>

      {/* Customer Reviews Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {filterWord ? (
              <span className="flex items-center gap-2">
                Reviews containing <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">"{filterWord}"</span>
              </span>
            ) : "Recent Customer Reviews"}
          </h3>
          {filterWord && (
            <button 
              onClick={() => setFilterWord(null)}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Clear Filter
            </button>
          )}
        </div>
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
