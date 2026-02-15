import { FileText, Download, Calendar, Filter } from "lucide-react";

const reports = [
  {
    name: "Monthly Sales Report",
    description: "Comprehensive sales analysis with revenue breakdown and trends",
    date: "August 2026",
    type: "Sales",
    size: "2.4 MB",
  },
  {
    name: "Customer Sentiment Analysis",
    description: "Detailed sentiment breakdown with aspect analysis and insights",
    date: "August 2026",
    type: "Sentiment",
    size: "1.8 MB",
  },
  {
    name: "Inventory & Demand Forecast",
    description: "Stock levels, demand predictions, and reorder recommendations",
    date: "August 2026",
    type: "Inventory",
    size: "1.2 MB",
  },
  {
    name: "Competitor Benchmarking",
    description: "Market position analysis and competitive landscape overview",
    date: "Q2 2026",
    type: "Market",
    size: "3.1 MB",
  },
  {
    name: "Financial Performance Summary",
    description: "Revenue, costs, profit margins, and financial KPIs",
    date: "July 2026",
    type: "Financial",
    size: "890 KB",
  },
];

export function Reports() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">Generate and download analytics reports</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#6F4E37] text-white rounded-lg hover:bg-[#5d4230] transition-colors">
          <FileText className="w-4 h-4" />
          Generate New Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]">
              <option>All Types</option>
              <option>Sales</option>
              <option>Sentiment</option>
              <option>Inventory</option>
              <option>Market</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]">
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]">
              <option>PDF</option>
              <option>Excel</option>
              <option>CSV</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-[#F5E6D3] rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-[#6F4E37]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {report.date}
                    </span>
                    <span className="inline-flex px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                      {report.type}
                    </span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
