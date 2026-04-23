import { useState, useEffect } from "react";
import { ArrowRight, TrendingUp } from "lucide-react";

export function MarketBasket() {
  const [marketBasketRules, setMarketBasketRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/basket/rules")
      .then(res => res.json())
      .then(json => {
        if (json.rules) {
          // ensure icons are mapped if the backend doesn't send them
          const rulesWithIcons = json.rules.map((rule: any) => ({
            ...rule,
            icon: rule.icon || "☕",
            iconPair: rule.iconPair || "🥐"
          }));
          setMarketBasketRules(rulesWithIcons);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching rules:", err);
        setLoading(false);
      });
  }, []);

  const frequentItemsets = [
    { items: ["Cappuccino", "Croissant", "Orange Juice"], support: 0.18, count: 425 },
    { items: ["Latte", "Muffin"], support: 0.28, count: 658 },
    { items: ["Espresso", "Biscotti"], support: 0.22, count: 518 },
    { items: ["Sandwich", "Iced Coffee", "Chips"], support: 0.15, count: 353 },
    { items: ["Cappuccino", "Cake"], support: 0.20, count: 471 },
  ];

  const bundleOpportunities = [
    {
      name: "Morning Starter",
      items: ["Cappuccino", "Croissant"],
      currentRevenue: "$12.50",
      bundlePrice: "$10.99",
      potentialIncrease: "+24%",
      confidence: "High",
    },
    {
      name: "Afternoon Delight",
      items: ["Latte", "Muffin"],
      currentRevenue: "$11.00",
      bundlePrice: "$9.49",
      potentialIncrease: "+18%",
      confidence: "High",
    },
    {
      name: "Quick Lunch",
      items: ["Sandwich", "Iced Coffee"],
      currentRevenue: "$14.00",
      bundlePrice: "$12.49",
      potentialIncrease: "+21%",
      confidence: "Medium",
    },
  ];

  if (loading) {
    return <div className="p-8">Loading Market Basket Rules...</div>;
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Basket Analysis</h1>
        <p className="text-gray-600">Discover product associations and cross-selling opportunities</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
          <p className="text-3xl font-bold text-gray-900">2,352</p>
          <p className="text-xs text-green-600 mt-1">↑ +12% this month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Avg Items/Transaction</p>
          <p className="text-3xl font-bold text-gray-900">2.4</p>
          <p className="text-xs text-green-600 mt-1">↑ +0.3 increase</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Cross-Sell Rate</p>
          <p className="text-3xl font-bold text-gray-900">68%</p>
          <p className="text-xs text-green-600 mt-1">↑ +5% this month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Bundle Revenue</p>
          <p className="text-3xl font-bold text-gray-900">$8.2K</p>
          <p className="text-xs text-green-600 mt-1">↑ +18% potential</p>
        </div>
      </div>

      {/* Frequently Bought Together Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Bought Together</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketBasketRules.slice(0, 3).map((rule, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-[#F5E6D3]/30 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="text-5xl">{rule.icon}</div>
                <ArrowRight className="w-6 h-6 text-[#6F4E37]" />
                <div className="text-5xl">{rule.iconPair}</div>
              </div>
              <div className="text-center mb-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {rule.antecedent} → {rule.consequent}
                </h3>
                <p className="text-sm text-gray-600">
                  {(rule.confidence * 100).toFixed(0)}% of customers who buy {rule.antecedent} also buy {rule.consequent}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-600">Support</p>
                  <p className="text-sm font-semibold text-gray-900">{(rule.support * 100).toFixed(0)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Confidence</p>
                  <p className="text-sm font-semibold text-gray-900">{(rule.confidence * 100).toFixed(0)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Lift</p>
                  <p className="text-sm font-semibold text-[#1ABC9C]">{rule.lift.toFixed(1)}x</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Association Rules Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Association Rules</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">If Customer Buys</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700"></th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">They Also Buy</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Support</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Confidence</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Lift</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Strength</th>
              </tr>
            </thead>
            <tbody>
              {marketBasketRules.map((rule, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{rule.icon}</span>
                      {rule.antecedent}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <ArrowRight className="w-4 h-4 text-[#6F4E37] mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{rule.iconPair}</span>
                      {rule.consequent}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {(rule.support * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {(rule.confidence * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {rule.lift.toFixed(1)}x
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center gap-1 justify-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-4 rounded ${
                            i < Math.floor(rule.lift * 2) ? "bg-[#1ABC9C]" : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bundle Opportunities */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Bundle Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bundleOpportunities.map((bundle, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{bundle.name}</h3>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    bundle.confidence === "High" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {bundle.confidence}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {bundle.items.map((item, i) => (
                  <span key={i}>
                    {item}
                    {i < bundle.items.length - 1 ? " + " : ""}
                  </span>
                ))}
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Price:</span>
                  <span className="font-medium text-gray-900 line-through">{bundle.currentRevenue}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bundle Price:</span>
                  <span className="font-semibold text-[#1ABC9C]">{bundle.bundlePrice}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Revenue Potential</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-600">{bundle.potentialIncrease}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Frequent Itemsets */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequent Itemsets</h2>
        <div className="space-y-3">
          {frequentItemsets.map((itemset, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {itemset.items.map((item, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-900">
                      {item}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-600">{itemset.count} transactions</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{(itemset.support * 100).toFixed(0)}%</p>
                <p className="text-xs text-gray-600">Support</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
