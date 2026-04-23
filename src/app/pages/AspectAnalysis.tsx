import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, X } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function AspectAnalysis() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);
  const [phraseReviews, setPhraseReviews] = useState<any[]>([]);
  const [fetchingReviews, setFetchingReviews] = useState(false);

  useEffect(() => {
    fetch("/api/sentiment/aspects")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching aspect data:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedPhrase) {
      setFetchingReviews(true);
      fetch(`/api/sentiment/reviews?query=${encodeURIComponent(selectedPhrase)}`)
        .then((res) => res.json())
        .then((json) => {
          setPhraseReviews(json);
          setFetchingReviews(false);
        })
        .catch((err) => {
          console.error("Error fetching phrase reviews:", err);
          setFetchingReviews(false);
        });
    } else {
      setPhraseReviews([]);
    }
  }, [selectedPhrase]);

  if (loading) {
    return <div className="p-8">Loading aspect data...</div>;
  }

  const aspectData = data?.aspectData || [];
  const topPhrases = data?.topPhrases || { positive: [], negative: [] };
  const overallSatisfaction = data?.overallSatisfaction || 0;
  const totalAspects = data?.totalAspects || 0;

  // Let's find the most praised and most complained aspects from our data
  let mostPraised = { aspect: "N/A", count: 0 };
  let mostComplained = { aspect: "N/A", count: 0 };

  aspectData.forEach((item: any) => {
    if (item.positive > mostPraised.count) {
      mostPraised = { aspect: item.aspect, count: item.positive };
    }
    if (item.negative > mostComplained.count) {
      mostComplained = { aspect: item.aspect, count: item.negative };
    }
  });

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
          <p className="text-xl font-bold text-green-600 mb-1">{mostPraised.aspect}</p>
          <p className="text-xs text-gray-600">{mostPraised.count} positive mentions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Needs Improvement</p>
          <p className="text-xl font-bold text-red-600 mb-1">{mostComplained.aspect}</p>
          <p className="text-xs text-gray-600">{mostComplained.count} negative mentions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Total Aspects Analyzed</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{totalAspects}</p>
          <p className="text-xs text-gray-600">Across reviews</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Overall Satisfaction</p>
          <p className="text-2xl font-bold text-[#1ABC9C] mb-1">{overallSatisfaction}%</p>
          <p className="text-xs text-gray-600">Average positive rate</p>
        </div>
      </div>

      {/* Aspect Sentiment Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment by Aspect</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={aspectData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="category" dataKey="aspect" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="positive" fill="#10B981" name="Positive" radius={[4, 4, 0, 0]} />
            <Bar dataKey="neutral" fill="#F59E0B" name="Neutral" radius={[4, 4, 0, 0]} />
            <Bar dataKey="negative" fill="#EF4444" name="Negative" radius={[4, 4, 0, 0]} />
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
            {topPhrases.positive.map((phrase: any, index: number) => (
              <div 
                key={index} 
                onClick={() => setSelectedPhrase(selectedPhrase === phrase.phrase ? null : phrase.phrase)}
                className={`flex items-center justify-between bg-white rounded-lg p-3 border cursor-pointer transition-all hover:shadow-md ${
                  selectedPhrase === phrase.phrase ? "border-green-500 ring-2 ring-green-200" : "border-green-100"
                }`}
              >
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
            {topPhrases.negative.map((phrase: any, index: number) => (
              <div 
                key={index} 
                onClick={() => setSelectedPhrase(selectedPhrase === phrase.phrase ? null : phrase.phrase)}
                className={`flex items-center justify-between bg-white rounded-lg p-3 border cursor-pointer transition-all hover:shadow-md ${
                  selectedPhrase === phrase.phrase ? "border-red-500 ring-2 ring-red-200" : "border-red-100"
                }`}
              >
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

      {/* Phrase-Specific Reviews */}
      {selectedPhrase && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">
                Reviews for "{selectedPhrase}"
              </h3>
            </div>
            <button 
              onClick={() => setSelectedPhrase(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {fetchingReviews ? (
            <div className="py-12 text-center text-gray-500">Loading relevant reviews...</div>
          ) : phraseReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {phraseReviews.map((review) => (
                <div key={review.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-gray-800">{review.customer}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      review.sentiment === "Positive" ? "bg-green-100 text-green-700" :
                      review.sentiment === "Negative" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {review.sentiment}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed italic">"{review.text}"</p>
                  <div className="mt-2 text-[10px] text-gray-400">{review.date}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500 italic">No reviews found for this phrase.</div>
          )}
        </div>
      )}
    </div>
  );
}
