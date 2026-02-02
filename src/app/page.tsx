import StatCard from "@/components/StatCard";
import Link from "next/link";
import {
  formatCurrency,
  getTotalRevenue,
  getTotalExpenses,
  getProfit,
  getUnreadCount,
  getActiveJobsCount,
  messages,
  jobs,
  crews,
} from "@/lib/data";

export default function DashboardHome() {
  const revenue = getTotalRevenue();
  const expenses = getTotalExpenses();
  const profit = getProfit();
  const unreadCount = getUnreadCount();
  const activeJobs = getActiveJobsCount();
  const recentMessages = messages.slice(0, 4);
  const upcomingJobs = jobs.filter((j) => j.status === "scheduled").slice(0, 4);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back. Here&apos;s your business overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(revenue)}
          trend={{ value: "12%", positive: true }}
          color="green"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(expenses)}
          trend={{ value: "3%", positive: false }}
          color="red"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          }
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(profit)}
          subtitle={`${((profit / revenue) * 100).toFixed(1)}% margin`}
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <StatCard
          title="Active Jobs"
          value={String(activeJobs)}
          subtitle={`${unreadCount} unread messages`}
          color="yellow"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Messages */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Messages</h2>
            <Link href="/communications" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentMessages.map((msg) => (
              <div key={msg.id} className={`p-3 rounded-lg border ${!msg.read ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-100"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{msg.customerName}</span>
                  <span className="text-xs text-gray-500">{msg.date}</span>
                </div>
                <p className="text-sm font-medium text-gray-800">{msg.subject}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">{msg.preview}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Jobs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Jobs</h2>
            <Link href="/crews" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingJobs.map((job) => (
              <div key={job.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{job.customer}</span>
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">{job.scheduledDate}</span>
                </div>
                <p className="text-sm text-gray-700">{job.description}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{job.crewName}</span>
                  <span>{job.estimatedHours}h est. &middot; {formatCurrency(job.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crew Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Crew Performance</h2>
            <Link href="/crews" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View details
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {crews.map((crew) => (
              <div key={crew.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <h3 className="font-semibold text-gray-900">{crew.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{crew.members.length} members</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Jobs Done</span>
                    <span className="font-medium">{crew.jobsCompleted}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Avg Time</span>
                    <span className="font-medium">{crew.avgCompletionTime}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rating</span>
                    <span className="font-medium text-yellow-600">{crew.rating}/5.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Revenue</span>
                    <span className="font-medium text-green-600">{formatCurrency(crew.revenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
