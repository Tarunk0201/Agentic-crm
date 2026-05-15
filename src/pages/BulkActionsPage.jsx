import React, { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import ImportContactsModal from "../components/ImportContactsModal";
import ActionDetailsModal from "../components/ActionDetailsModal";
import { useAuth } from "../context/AuthContext";

function BulkActionsPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });
  const { tokens } = useAuth();

  const fetchActions = async () => {
    if (!tokens?.accessToken) return;
    setLoading(true);
    setError(null);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/ivr-agent/actions?page=${pagination.currentPage}&limit=${pagination.limit}`,
        {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.msg || json.message || "Failed to fetch actions");
      if (json.success) {
        setActions(json.data || []);
        if (json.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalPages: json.pagination.totalPages || 1,
            currentPage: json.pagination.currentPage || 1,
          }));
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [tokens?.accessToken, pagination.currentPage, pagination.limit]);

  const handleViewDetails = (actionId) => {
    setSelectedActionId(actionId);
    setIsDetailsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Complete":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Running":
        return "bg-cyan-50 text-cyan-600 border-cyan-100";
      case "Scheduled":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "Failed":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-zinc-50 text-zinc-600 border-zinc-100";
    }
  };

  return (
    <div className="p-2">
      <div className="rounded-[20px] bg-white shadow-sm border border-zinc-100">
        {/* Sticky top: title + filters */}
        <div className="sticky top-0 z-20 bg-white rounded-t-[20px] px-8 pt-8 pb-4">
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-zinc-900">Bulk Actions</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Track progress and results for bulk actions.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-end gap-6">
            <div className="w-full max-w-[240px]">
              <label className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Status
              </label>
              <div className="relative">
                <select className="w-full appearance-none rounded-lg border border-zinc-100 bg-[#f9f9f9] px-4 py-2 text-sm outline-none focus:border-[#ea8d3f]">
                  <option value="all">All</option>
                  <option value="complete">Complete</option>
                  <option value="running">Running</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="failed">Failed</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Search
              </label>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="text"
                  placeholder="Search bulk actions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-100 bg-[#f9f9f9] py-2 pl-9 pr-4 text-sm outline-none focus:border-[#ea8d3f] transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-8">
          <table className="w-full text-left">
            <thead className="sticky top-[200px] bg-white z-10 shadow-[0_1px_0_0_#f4f4f5]">
              <tr className="border-b border-zinc-50 text-[13px] font-semibold text-zinc-900">
                <th className="py-3 px-4 font-medium">Action Name</th>
                <th className="py-3 px-4 font-medium">Progress</th>
                <th className="py-3 px-4 font-medium">Success %</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Created (IST)</th>
                <th className="py-3 px-4 font-medium">Completed (IST)</th>
                <th className="py-3 px-4 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-zinc-500">
                    Loading actions...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : actions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-zinc-500">
                    No actions found.
                  </td>
                </tr>
              ) : (
                actions.map((action) => (
                  <tr
                    key={action.id || action._id}
                    className="group hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-zinc-900">
                          {action.action_name}
                        </p>
                        <p className="text-[11px] text-zinc-400 capitalize">
                          {action.operation} • {action.trigger_type}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-600">
                      {action.contacted_count} / {action.total_contacts}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-emerald-600">
                        {action.success_percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold capitalize ${getStatusColor(
                          action.status
                        )}`}
                      >
                        {action.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-600">
                      {new Date(action.created_time).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-600">
                      {action.completed_time ? new Date(action.completed_time).toLocaleString() : "N/A"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewDetails(action.id || action._id)}
                        className="rounded border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 shadow-sm transition-all"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="sticky bottom-0 z-20 bg-white rounded-b-[20px] px-8 py-4 border-t border-zinc-50 flex items-center justify-between">
          <p className="text-xs font-medium text-[#ea8d3f]">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={pagination.currentPage <= 1 || loading}
              className="flex h-8 items-center gap-1 rounded-lg border border-zinc-100 px-3 text-xs font-medium text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-xs font-bold text-zinc-900 shadow-sm border border-zinc-200">
              {pagination.currentPage}
            </div>
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={pagination.currentPage >= pagination.totalPages || loading}
              className="flex h-8 items-center gap-1 rounded-lg border border-zinc-100 px-3 text-xs font-medium text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <ImportContactsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
      <ActionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        actionId={selectedActionId}
      />
    </div>
  );
}

export default BulkActionsPage;
