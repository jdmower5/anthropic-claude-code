"use client";

import { useState } from "react";
import { messages, customers, type Message } from "@/lib/data";

const channelBadge: Record<string, string> = {
  email: "bg-blue-100 text-blue-700",
  phone: "bg-green-100 text-green-700",
  sms: "bg-purple-100 text-purple-700",
  "in-person": "bg-orange-100 text-orange-700",
};

export default function CommunicationsPage() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMessages = messages.filter((m) => {
    if (filter === "unread" && m.read) return false;
    if (searchQuery && !m.customerName.toLowerCase().includes(searchQuery.toLowerCase()) && !m.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const selectedCustomer = selectedMessage
    ? customers.find((c) => c.id === selectedMessage.customerId)
    : null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
        <p className="text-gray-500 mt-1">Manage all customer messages and conversations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({messages.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter === "unread" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Unread ({messages.filter((m) => !m.read).length})
              </button>
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {filteredMessages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedMessage?.id === msg.id ? "bg-blue-50" : ""
                } ${!msg.read ? "bg-blue-50/50" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm ${!msg.read ? "font-bold" : "font-medium"}`}>
                    {msg.customerName}
                  </span>
                  <span className="text-xs text-gray-400">{msg.date}</span>
                </div>
                <p className={`text-sm ${!msg.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                  {msg.subject}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{msg.preview}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${channelBadge[msg.channel]}`}>
                    {msg.channel}
                  </span>
                </div>
              </button>
            ))}
            {filteredMessages.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">No messages found.</div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          {selectedMessage ? (
            <div>
              <div className="flex items-start justify-between border-b border-gray-200 pb-4 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedMessage.subject}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    From: <span className="font-medium text-gray-700">{selectedMessage.customerName}</span>
                    {selectedCustomer && (
                      <>
                        <span className="mx-2">&middot;</span>
                        <span>{selectedCustomer.email}</span>
                        <span className="mx-2">&middot;</span>
                        <span>{selectedCustomer.phone}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${channelBadge[selectedMessage.channel]}`}>
                    {selectedMessage.channel}
                  </span>
                  <span className="text-xs text-gray-400">{selectedMessage.date}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700 leading-relaxed">{selectedMessage.preview}</p>
              </div>

              {selectedCustomer && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Customer Info</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Name</span>
                      <p className="font-medium">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status</span>
                      <p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedCustomer.status === "active"
                            ? "bg-green-100 text-green-700"
                            : selectedCustomer.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {selectedCustomer.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email</span>
                      <p className="font-medium">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone</span>
                      <p className="font-medium">{selectedCustomer.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Contact</span>
                      <p className="font-medium">{selectedCustomer.lastContact}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Reply */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Quick Reply</h3>
                <textarea
                  placeholder="Type your reply..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
                <div className="flex gap-2 mt-2">
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    Send Reply
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                    Save Draft
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-gray-400">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">Select a message</p>
                <p className="text-sm mt-1">Choose a conversation from the list to view details.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Directory */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Customer Directory</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Last Contact</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{c.name}</td>
                  <td className="py-3 px-4 text-gray-600">{c.email}</td>
                  <td className="py-3 px-4 text-gray-600">{c.phone}</td>
                  <td className="py-3 px-4 text-gray-600">{c.lastContact}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.status === "active"
                        ? "bg-green-100 text-green-700"
                        : c.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
