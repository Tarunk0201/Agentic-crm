import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, CheckCircle2, Phone, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function ActionDetailsModal({ isOpen, onClose, actionId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);
  const [contacts, setContacts] = useState([]);
  const { tokens } = useAuth();

  useEffect(() => {
    if (!isOpen || !actionId) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      try {
        const response = await fetch(`${API_BASE_URL}/api/ivr-agent/actions/${actionId}`, {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch action details");
        }

        const json = await response.json();
        if (json.success && json.data) {
          setDetails(json.data.action_details);
          setContacts(json.data.contacts || []);
        } else {
          throw new Error(json.message || "Failed to fetch action details");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, actionId, tokens.accessToken]);

  if (!isOpen) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "answered":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "running":
        return "bg-cyan-50 text-cyan-600 border-cyan-100";
      case "scheduled":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "failed":
      case "not answered":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-zinc-50 text-zinc-600 border-zinc-100";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 p-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                {details?.action_name || "Action Details"}
              </h2>
              {details && (
                <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                  <span className="capitalize">{details.operation}</span>
                  <span>•</span>
                  <span className="capitalize">{details.trigger_type}</span>
                  <span>•</span>
                  <span>{new Date(details.created_time).toLocaleString()}</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50">
            {loading ? (
              <div className="flex h-full items-center justify-center text-zinc-500">
                Loading details...
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center text-red-500">
                {error}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-500">Progress</p>
                    <p className="mt-2 text-2xl font-bold text-zinc-900">
                      {details.contacted_count} / {details.total_contacts}
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-500">Success Rate</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600">
                      {details.success_percentage}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-500">Status</p>
                    <div className="mt-2 inline-block">
                      <span
                        className={`rounded-md border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusColor(
                          details.status
                        )}`}
                      >
                        {details.status}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-500">Completed Time</p>
                    <p className="mt-2 text-sm font-semibold text-zinc-900">
                      {details.completed_time ? new Date(details.completed_time).toLocaleString() : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Contacts Table */}
                <div className="rounded-xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-zinc-100 p-4">
                    <h3 className="font-semibold text-zinc-900">Call History ({contacts.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-zinc-50 bg-zinc-50/50 text-[13px] font-semibold text-zinc-600">
                          <th className="p-4">Customer Name</th>
                          <th className="p-4">Phone</th>
                          <th className="p-4">Call Status</th>
                          <th className="p-4">Result</th>
                          <th className="p-4">Duration (s)</th>
                          <th className="p-4">Initiated (IST)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                        {contacts.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="p-8 text-center text-zinc-500">
                              No calls have been initiated yet.
                            </td>
                          </tr>
                        ) : (
                          contacts.map((contact, index) => (
                            <tr key={contact.call_uuid || index} className="hover:bg-zinc-50 transition-colors">
                              <td className="p-4 font-medium text-zinc-900">
                                {contact.customer_name}
                              </td>
                              <td className="p-4 text-sm text-zinc-600">
                                {contact.customer_phone}
                              </td>
                              <td className="p-4">
                                <span className="text-sm text-zinc-600 capitalize">
                                  {contact.call_status}
                                </span>
                              </td>
                              <td className="p-4">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize ${getStatusColor(
                                    contact.status
                                  )}`}
                                >
                                  {contact.status === "Answered" ? (
                                    <Phone size={12} />
                                  ) : contact.status === "Not Answered" ? (
                                    <XCircle size={12} />
                                  ) : null}
                                  {contact.status}
                                </span>
                              </td>
                              <td className="p-4 text-sm text-zinc-600">
                                {contact.duration}s
                              </td>
                              <td className="p-4 text-sm text-zinc-600">
                                {new Date(contact.created_time).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ActionDetailsModal;
