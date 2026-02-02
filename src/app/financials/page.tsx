"use client";

import { useState } from "react";
import StatCard from "@/components/StatCard";
import {
  financials,
  formatCurrency,
  getTotalRevenue,
  getTotalExpenses,
  getProfit,
} from "@/lib/data";

type FilterType = "all" | "income" | "expense";

export default function FinancialsPage() {
  const [filter, setFilter] = useState<FilterType>("all");

  const revenue = getTotalRevenue();
  const expenses = getTotalExpenses();
  const profit = getProfit();

  const filtered = financials.filter((f) => {
    if (filter === "income") return f.type === "income" && f.amount > 0;
    if (filter === "expense") return f.type === "expense";
    return true;
  });

  // Group expenses by category
  const expensesByCategory: Record<string, number> = {};
  financials
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financials</h1>
        <p className="text-gray-500 mt-1">Track income, expenses, and profitability.</p>
      </div>

      {/* Summary Cards */}
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
                      ? f === "income"
                        ? "bg-green-600 text-white"
                        : f === "expense"
                        ? "bg-red-600 text-white"
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
                {filtered.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">{entry.date}</td>
                    <td className="py-3 px-4 font-medium">{entry.description}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {entry.category}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${
                      entry.type === "income" && entry.amount > 0
                        ? "text-green-600"
                        : entry.type === "expense"
                        ? "text-red-600"
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
    </div>
  );
}
