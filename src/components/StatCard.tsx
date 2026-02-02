interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  icon: React.ReactNode;
  color: "blue" | "green" | "red" | "yellow" | "purple";
}

const colorMap = {
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  green: "bg-green-50 text-green-600 border-green-100",
  red: "bg-red-50 text-red-600 border-red-100",
  yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
};

const iconBgMap = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  red: "bg-red-100 text-red-600",
  yellow: "bg-yellow-100 text-yellow-600",
  purple: "bg-purple-100 text-purple-600",
};

export default function StatCard({ title, value, subtitle, trend, icon, color }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-6 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgMap[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      {trend && (
        <p className={`text-sm mt-2 font-medium ${trend.positive ? "text-green-600" : "text-red-600"}`}>
          {trend.positive ? "+" : ""}{trend.value} vs last month
        </p>
      )}
    </div>
  );
}
