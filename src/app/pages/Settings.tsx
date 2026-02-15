import { User, Bell, Lock, Database, Mail, Palette } from "lucide-react";

export function Settings() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and application preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#F5E6D3] rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-[#6F4E37]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue="Admin User"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue="admin@brewanalytics.com"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
              <input
                type="text"
                defaultValue="Your Cafe"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                defaultValue="+1 (555) 123-4567"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: "Email notifications for new insights", checked: true },
              { label: "Weekly performance reports", checked: true },
              { label: "Inventory alerts", checked: true },
              { label: "Competitor updates", checked: false },
              { label: "Revenue milestones", checked: true },
            ].map((item, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={item.checked}
                  className="w-4 h-4 text-[#6F4E37] border-gray-300 rounded focus:ring-[#1ABC9C]"
                />
                <span className="text-sm text-gray-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Data & Privacy</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <p className="font-medium text-gray-900">Export Your Data</p>
              <p className="text-sm text-gray-600">Download all your analytics data in CSV format</p>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <p className="font-medium text-gray-900">Data Retention Policy</p>
              <p className="text-sm text-gray-600">Manage how long we keep your data</p>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button className="px-6 py-2 bg-[#6F4E37] text-white rounded-lg hover:bg-[#5d4230] transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
