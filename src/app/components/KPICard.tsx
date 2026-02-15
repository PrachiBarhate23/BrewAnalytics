import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function KPICard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  iconColor = "text-[#6F4E37]",
  iconBg = "bg-[#F5E6D3]"
}: KPICardProps) {
  const changeColors = {
    increase: "text-green-600 bg-green-50",
    decrease: "text-red-600 bg-red-50",
    neutral: "text-gray-600 bg-gray-50"
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
          {change && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${changeColors[changeType]}`}>
              {changeType === "increase" && "↑ "}
              {changeType === "decrease" && "↓ "}
              {change}
            </span>
          )}
        </div>
        <div className={`${iconBg} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
