"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/StatCard";
import {
  financials as sampleFinancials,
  formatCurrency,
  getTotalRevenue,
  getTotalExpenses,
  getProfit,
} from "@/lib/data";

interface JobberInvoice {
  id: string;
  invoiceNumber: string;
  subject: string | null;
  status: string;
  issuedDate: string;
  dueDate: string;
  total: number;
  amountDue: number;
  amountPaid: number;
  client: { id: string; firstName: string; lastName: string };
}

type FilterType = "all" | "income" | "expense" | "paid" | "unpaid";

export default function FinancialsPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [jobberConnected, setJobberConnected] = useState(false);
  const [invoices, setInvoices] = useState<JobberInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const statusRes = await fetch("/api/jobber/status");
        const status = await statusRes.json();
        if (status.connected) {
          setJobberConnected(true);
          const invoicesRes = await fetch("/api/jobber/invoices");
          if (invoicesRes.ok) {
            const data = await invoicesRes.json();
            setInvoices(data.nodes || []);
          }
        }
      } catch {
        setJobberConnected(false);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Jobber financials
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalDue = invoices.reduce((sum, inv) => sum + inv.amountDue, 0);

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === "paid") return inv.amountDue === 0;
    if (filter === "unpaid") return inv.amountDue > 0;
    return true;
  });

  // Sample financials
  const revenue = getTotalRevenue();
  const expenses = getTotalExpenses();
  const profit = getProfit();

  const filteredSample = sampleFinancials.filter((f) => {
    if (filter === "income") return f.type === "income" && f.amount > 0;
    if (filter === "expense") return f.type === "expense";
    return true;
  });

  const expensesByCategory: Record<string, number> = {};
  sampleFinancials
    .filter((f) => f.type === "expense")
    .forEach((f) => {
      const cat = f.category;
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Math.abs(f.amount);
    });

  const categoryColors: Record<string, string> = {
    Payroll: "bg-red-500",
    Equipment: "bg-orange-500",
    Fuel: "bg-yellow-500",
    Vehicle: "bg-blue-500",
    Insurance: "bg-purple-500",
    Marketing: "bg-pink-500",
  };

  // Group invoices by status for breakdown
  const invoicesByStatus: Record<string, { count: number; total: number }> = {};
  invoices.forEach((inv) => {
    const status = inv.status || "Unknown";
    if (!invoicesByStatus[status]) {
      invoicesByStatus[status] = { count: 0, total: 0 };
    }
    invoicesByStatus[status].count++;
    invoicesByStatus[status].total += inv.total;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading financials...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financials</h1>
        <p className="text-gray-500 mt-1">
          Track income, expenses, and profitability.
          {jobberConnected && (
            <span className="inline-flex items-center ml-2 text-green-600 text-xs font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              Jobber Connected
            </span>
          )}
        </p>
      </div>

      {jobberConnected ? (
        <>
          {/* Jobber Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Invoiced"
              value={formatCurrency(totalInvoiced)}
              subtitle={`${invoices.length} invoices`}
              color="green"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
            <StatCard
              title="Amount Paid"
              value={formatCurrency(totalPaid)}
              subtitle={`${((totalPaid / totalInvoiced) * 100 || 0).toFixed(0)}% collected`}
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
              subtitle={`${invoices.filter((i) => i.amountDue > 0).length} unpaid`}
              color="red"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              title="Collection Rate"
              value={`${((totalPaid / totalInvoiced) * 100 || 0).toFixed(1)}%`}
              subtitle="of invoiced amount"
              color="purple"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Invoices Table */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Invoices</h2>
                <div className="flex gap-2">
                  {(["all", "paid", "unpaid"] as FilterType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                        filter === f
                          ? f === "paid" ? "bg-green-600 text-white"
                          : f === "unpaid" ? "bg-red-600 text-white"
                          : "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
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
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">#{inv.invoiceNumber}</td>
                        <td className="py-3 px-4">{inv.client.firstName} {inv.client.lastName}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            inv.status?.toLowerCase() === "paid" ? "bg-green-100 text-green-700"
                            : inv.status?.toLowerCase() === "draft" ? "bg-gray-100 text-gray-600"
                            : inv.status?.toLowerCase() === "sent" ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{inv.issuedDate}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(inv.total)}</td>
                        <td className={`py-3 px-4 text-right font-semibold ${inv.amountDue > 0 ? "text-red-600" : "text-green-600"}`}>
                          {formatCurrency(inv.amountDue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredInvoices.length === 0 && (
                  <p className="text-center py-8 text-gray-400">No invoices found.</p>
                )}
              </div>
            </div>

            {/* Invoice Status Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">By Status</h2>
              <div className="space-y-4">
                {Object.entries(invoicesByStatus)
                  .sort(([, a], [, b]) => b.total - a.total)
                  .map(([status, data]) => {
                    const pct = (data.total / totalInvoiced) * 100;
                    const color = status.toLowerCase() === "paid" ? "bg-green-500"
                      : status.toLowerCase() === "sent" ? "bg-blue-500"
                      : status.toLowerCase() === "draft" ? "bg-gray-400"
                      : "bg-yellow-500";
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                          <span className="text-sm text-gray-500">{formatCurrency(data.total)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{data.count} invoices &middot; {pct.toFixed(1)}%</p>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Invoiced</span>
                  <span className="font-bold text-gray-900">{formatCurrency(totalInvoiced)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Collected</span>
                  <span className="font-bold text-green-600">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Outstanding</span>
                  <span className="font-bold text-red-600">{formatCurrency(totalDue)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Sample Data Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(revenue)}
              trend={{ value: "12%", positive: true }}
              color="green"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              }
            />
            <StatCard
              title="Net Profit"
              value={formatCurrency(profit)}
              subtitle={`${((profit / revenue) * 100).toFixed(1)}% profit margin`}
              color="blue"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Transactions Table */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Transactions</h2>
                <div className="flex gap-2">
                  {(["all", "income", "expense"] as FilterType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                        filter === f
                          ? f === "income" ? "bg-green-600 text-white"
                          : f === "expense" ? "bg-red-600 text-white"
                          : "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSample.map((entry) => (
                      <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">{entry.date}</td>
                        <td className="py-3 px-4 font-medium">{entry.description}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {entry.category}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${
                          entry.type === "income" && entry.amount > 0 ? "text-green-600"
                          : entry.type === "expense" ? "text-red-600"
                          : "text-gray-400"
                        }`}>
                          {entry.type === "income" && entry.amount > 0 ? "+" : ""}
                          {formatCurrency(Math.abs(entry.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Expense Breakdown</h2>
              <div className="space-y-4">
                {Object.entries(expensesByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => {
                    const pct = (amount / expenses) * 100;
                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{category}</span>
                          <span className="text-sm text-gray-500">{formatCurrency(amount)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${categoryColors[category] || "bg-gray-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{pct.toFixed(1)}% of total</p>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-600">Total Expenses</span>
                  <span className="font-bold text-red-600">{formatCurrency(expenses)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
