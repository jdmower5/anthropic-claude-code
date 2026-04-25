"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/StatCard";
import Link from "next/link";
import {
  formatCurrency,
  getTotalRevenue,
  getTotalExpenses,
  getProfit,
  getUnreadCount,
  getActiveJobsCount,
  messages as sampleMessages,
  jobs as sampleJobs,
  crews as sampleCrews,
} from "@/lib/data";

interface JobberClient {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  emails: { address: string; primary: boolean }[];
  phones: { number: string; primary: boolean }[];
  balance: number;
  createdAt: string;
}

interface JobberJob {
  id: string;
  title: string;
  jobNumber: string;
  startAt: string | null;
  endAt: string | null;
  jobStatus: string;
  total: number;
  client: { id: string; firstName: string; lastName: string };
}

interface JobberInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  amountDue: number;
  amountPaid: number;
  issuedDate: string;
  client: { id: string; firstName: string; lastName: string };
}

export default function DashboardHome() {
  const [jobberConnected, setJobberConnected] = useState(false);
  const [clients, setClients] = useState<JobberClient[]>([]);
  const [jobberJobs, setJobberJobs] = useState<JobberJob[]>([]);
  const [invoices, setInvoices] = useState<JobberInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const statusRes = await fetch("/api/jobber/status");
        const status = await statusRes.json();
        if (!status.connected) {
          setJobberConnected(false);
          setLoading(false);
          return;
        }
        setJobberConnected(true);

        const [clientsRes, jobsRes, invoicesRes] = await Promise.all([
          fetch("/api/jobber/clients"),
          fetch("/api/jobber/jobs"),
          fetch("/api/jobber/invoices"),
        ]);

        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(data.nodes || []);
        }
        if (jobsRes.ok) {
          const data = await jobsRes.json();
          setJobberJobs(data.nodes || []);
        }
        if (invoicesRes.ok) {
          const data = await invoicesRes.json();
          setInvoices(data.nodes || []);
        }
      } catch {
        setJobberConnected(false);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If connected to Jobber, use real data
  if (jobberConnected) {
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalDue = invoices.reduce((sum, inv) => sum + inv.amountDue, 0);
    const activeJobs = jobberJobs.filter((j) =>
      !["completed", "closed"].includes(j.jobStatus?.toLowerCase() || "")
    );
    const recentClients = clients.slice(0, 5);

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Live data from your Jobber account.
            <span className="inline-flex items-center ml-2 text-green-600 text-xs font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              Connected
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Invoiced"
            value={formatCurrency(totalInvoiced)}
            color="green"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />
          <StatCard
            title="Amount Paid"
            value={formatCurrency(totalPaid)}
            color="blue"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Outstanding"
            value={formatCurrency(totalDue)}
            subtitle={`${invoices.filter((i) => i.amountDue > 0).length} unpaid invoices`}
            color="red"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Active Jobs"
            value={String(activeJobs.length)}
            subtitle={`${clients.length} total clients`}
            color="yellow"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Clients */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Clients</h2>
              <Link href="/communications" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</Link>
            </div>
            <div className="space-y-3">
              {recentClients.map((client) => {
                const primaryEmail = client.emails?.find((e) => e.primary)?.address || client.emails?.[0]?.address;
                const primaryPhone = client.phones?.find((p) => p.primary)?.number || client.phones?.[0]?.number;
                return (
                  <div key={client.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {client.firstName} {client.lastName}
                        {client.companyName && <span className="text-gray-400 ml-1">({client.companyName})</span>}
                      </span>
                      {client.balance > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                          {formatCurrency(client.balance)} due
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex gap-3">
                      {primaryEmail && <span>{primaryEmail}</span>}
                      {primaryPhone && <span>{primaryPhone}</span>}
                    </div>
                  </div>
                );
              })}
              {recentClients.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No clients found.</p>
              )}
            </div>
          </div>

          {/* Active Jobs */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Active Jobs</h2>
              <Link href="/crews" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</Link>
            </div>
            <div className="space-y-3">
              {activeJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{job.client.firstName} {job.client.lastName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      job.jobStatus?.toLowerCase() === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {job.jobStatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{job.title}</p>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                    <span>#{job.jobNumber}</span>
                    <span className="font-medium">{formatCurrency(job.total)}</span>
                  </div>
                </div>
              ))}
              {activeJobs.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No active jobs.</p>
              )}
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Invoices</h2>
              <Link href="/financials" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Invoice #</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Total</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 10).map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">#{inv.invoiceNumber}</td>
                      <td className="py-3 px-4">{inv.client.firstName} {inv.client.lastName}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          inv.status?.toLowerCase() === "paid" ? "bg-green-100 text-green-700"
                          : inv.status?.toLowerCase() === "draft" ? "bg-gray-100 text-gray-600"
                          : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{inv.issuedDate}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(inv.total)}</td>
                      <td className={`py-3 px-4 text-right font-medium ${inv.amountDue > 0 ? "text-red-600" : "text-green-600"}`}>
                        {formatCurrency(inv.amountDue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {invoices.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No invoices found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to sample data
  const revenue = getTotalRevenue();
  const expenses = getTotalExpenses();
  const profit = getProfit();
  const unreadCount = getUnreadCount();
  const activeJobsCount = getActiveJobsCount();
  const recentMessages = sampleMessages.slice(0, 4);
  const upcomingJobs = sampleJobs.filter((j) => j.status === "scheduled").slice(0, 4);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back. Here&apos;s your business overview.
          <Link href="/settings" className="ml-2 text-blue-600 text-xs font-medium hover:text-blue-800">
            Connect Jobber for live data
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Revenue" value={formatCurrency(revenue)} trend={{ value: "12%", positive: true }} color="green"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>}
        />
        <StatCard title="Total Expenses" value={formatCurrency(expenses)} trend={{ value: "3%", positive: false }} color="red"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>}
        />
        <StatCard title="Net Profit" value={formatCurrency(profit)} subtitle={`${((profit / revenue) * 100).toFixed(1)}% margin`} color="blue"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
        <StatCard title="Active Jobs" value={String(activeJobsCount)} subtitle={`${unreadCount} unread messages`} color="yellow"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Messages</h2>
            <Link href="/communications" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</Link>
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

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Jobs</h2>
            <Link href="/crews" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</Link>
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

        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Crew Performance</h2>
            <Link href="/crews" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View details</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleCrews.map((crew) => (
              <div key={crew.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <h3 className="font-semibold text-gray-900">{crew.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{crew.members.length} members</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Jobs Done</span><span className="font-medium">{crew.jobsCompleted}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Avg Time</span><span className="font-medium">{crew.avgCompletionTime}h</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Rating</span><span className="font-medium text-yellow-600">{crew.rating}/5.0</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Revenue</span><span className="font-medium text-green-600">{formatCurrency(crew.revenue)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
