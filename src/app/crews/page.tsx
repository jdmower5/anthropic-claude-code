"use client";

import { useState } from "react";
import { crews, jobs, formatCurrency, type Crew } from "@/lib/data";

export default function CrewsPage() {
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);

  const completedJobs = jobs.filter((j) => j.status === "completed");
  const totalEstimated = completedJobs.reduce((sum, j) => sum + j.estimatedHours, 0);
  const totalActual = completedJobs.reduce((sum, j) => sum + (j.actualHours || 0), 0);
  const efficiencyPct = totalEstimated > 0 ? ((totalEstimated / totalActual) * 100).toFixed(1) : "N/A";

  const crewJobs = selectedCrew
    ? jobs.filter((j) => j.crewId === selectedCrew.id)
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Crew Efficiency</h1>
        <p className="text-gray-500 mt-1">Monitor crew performance, job completion, and efficiency metrics.</p>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Crews</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{crews.length}</p>
          <p className="text-xs text-gray-400 mt-1">
            {crews.reduce((sum, c) => sum + c.members.length, 0)} total members
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Jobs Completed</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{completedJobs.length}</p>
          <p className="text-xs text-gray-400 mt-1">
            {jobs.filter((j) => j.status === "scheduled").length} upcoming
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Overall Efficiency</p>
          <p className={`text-3xl font-bold mt-1 ${Number(efficiencyPct) >= 100 ? "text-green-600" : "text-yellow-600"}`}>
            {efficiencyPct}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Estimated vs actual hours</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {formatCurrency(crews.reduce((sum, c) => sum + c.revenue, 0))}
          </p>
          <p className="text-xs text-gray-400 mt-1">Across all crews</p>
        </div>
      </div>

      {/* Crew Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {crews.map((crew) => {
          const crewCompletedJobs = jobs.filter((j) => j.crewId === crew.id && j.status === "completed");
          const crewEstimated = crewCompletedJobs.reduce((s, j) => s + j.estimatedHours, 0);
          const crewActual = crewCompletedJobs.reduce((s, j) => s + (j.actualHours || 0), 0);
          const crewEfficiency = crewEstimated > 0 ? ((crewEstimated / crewActual) * 100) : 0;

          return (
            <button
              key={crew.id}
              onClick={() => setSelectedCrew(selectedCrew?.id === crew.id ? null : crew)}
              className={`text-left bg-white rounded-xl border p-6 transition-all hover:shadow-md ${
                selectedCrew?.id === crew.id ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{crew.name}</h3>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">{crew.rating}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Efficiency</span>
                    <span className={`font-medium ${crewEfficiency >= 100 ? "text-green-600" : "text-yellow-600"}`}>
                      {crewEfficiency.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${crewEfficiency >= 100 ? "bg-green-500" : "bg-yellow-500"}`}
                      style={{ width: `${Math.min(crewEfficiency, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Completed</span>
                    <p className="font-semibold">{crew.jobsCompleted}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Scheduled</span>
                    <p className="font-semibold">{crew.jobsScheduled}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Avg Time</span>
                    <p className="font-semibold">{crew.avgCompletionTime}h</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Revenue</span>
                    <p className="font-semibold text-green-600">{formatCurrency(crew.revenue)}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Team ({crew.members.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {crew.members.map((m) => (
                      <span key={m.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {m.name}
                        <span className="text-gray-400 ml-1">{m.role === "Crew Lead" ? "(Lead)" : ""}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Crew Jobs */}
      {selectedCrew && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">{selectedCrew.name} &mdash; Job History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Est. Hours</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actual Hours</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {crewJobs.map((job) => {
                  const efficiency =
                    job.actualHours && job.estimatedHours
                      ? ((job.estimatedHours / job.actualHours) * 100).toFixed(0)
                      : null;
                  return (
                    <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{job.customer}</td>
                      <td className="py-3 px-4 text-gray-600">{job.description}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          job.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : job.status === "in-progress"
                            ? "bg-blue-100 text-blue-700"
                            : job.status === "scheduled"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{job.scheduledDate}</td>
                      <td className="py-3 px-4 text-right">{job.estimatedHours}h</td>
                      <td className="py-3 px-4 text-right">
                        {job.actualHours ? (
                          <span>
                            {job.actualHours}h
                            {efficiency && (
                              <span className={`ml-1 text-xs ${Number(efficiency) >= 100 ? "text-green-600" : "text-red-500"}`}>
                                ({efficiency}%)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">&mdash;</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(job.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Jobs */}
      {!selectedCrew && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">All Jobs</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Crew</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{job.customer}</td>
                    <td className="py-3 px-4 text-gray-600">{job.crewName}</td>
                    <td className="py-3 px-4 text-gray-600">{job.description}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        job.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : job.status === "in-progress"
                          ? "bg-blue-100 text-blue-700"
                          : job.status === "scheduled"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{job.scheduledDate}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(job.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
