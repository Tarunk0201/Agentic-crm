import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TriggerAutomationModal from "../components/TriggerAutomationModal";
import ImportContactsModal from "../components/ImportContactsModal";
import { useAuth } from "../context/AuthContext";
import SingleCallModal from "../components/SingleCallModal";
import ActionDetailsModal from "../components/ActionDetailsModal";

function ContactsPage() {
  const [activeTab, setActiveTab] = useState("contacts"); // 'contacts' or 'bulk-actions'
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSingleCallModalOpen, setIsSingleCallModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkActionsSearch, setBulkActionsSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  // Bulk Actions State
  const [actions, setActions] = useState([]);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [actionsError, setActionsError] = useState(null);
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [actionsPagination, setActionsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });
  const { tokens, setTokens } = useAuth();
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "complete":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "running":
        return "bg-cyan-50 text-cyan-600 border-cyan-100";
      case "scheduled":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "failed":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-zinc-50 text-zinc-600 border-zinc-100";
    }
  };

  const handleLogout = () => {
    // In a real app, you'd also clear tokens, user data from state management, etc.
    localStorage.removeItem("user"); // Example: clear user from local storage
    navigate("/login");
  };

  const fetchContacts = async () => {
    if (!tokens.accessToken) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const url = `${API_BASE_URL}/api/tenant-admin/contacts?page=${pagination.currentPage}&limit=${pagination.limit}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      if (response.status === 401) {
        setTokens({ accessToken: null, refreshToken: null });
        navigate("/login");
        return;
      }

      if (response.status === 401) {
        setTokens({ accessToken: null, refreshToken: null });
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to fetch contacts.");
      }

      const data = await response.json();
      setContacts(data.contacts || []);
      setPagination(
        data.pagination || { currentPage: 1, totalPages: 1, limit: 10 },
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [tokens.accessToken, pagination.currentPage, pagination.limit]);

  const fetchActions = async () => {
    if (!tokens?.accessToken) return;
    setActionsLoading(true);
    setActionsError(null);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/ivr-agent/actions?page=${actionsPagination.currentPage}&limit=${actionsPagination.limit}`,
        {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.msg || json.message || "Failed to fetch actions");
      if (json.success) {
        setActions(json.data || []);
        if (json.pagination) {
          setActionsPagination((prev) => ({
            ...prev,
            totalPages: json.pagination.totalPages || 1,
            currentPage: json.pagination.currentPage || 1,
          }));
        }
      }
    } catch (err) {
      setActionsError(err.message);
    } finally {
      setActionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "bulk-actions") {
      fetchActions();
    }
  }, [tokens?.accessToken, actionsPagination.currentPage, actionsPagination.limit, activeTab]);

  const handleViewDetails = (actionId) => {
    setSelectedActionId(actionId);
    setIsDetailsModalOpen(true);
  };


  const toggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((c) => c._id));
    }
  };

  const toggleSelectContact = (id) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter((cid) => cid !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  const handleDelete = () => {
    // Note: This should be replaced with an API call to delete contacts
    alert(
      `This would delete ${selectedContacts.length} contacts. API integration needed.`,
    );
    // setContacts(contacts.filter(c => !selectedContacts.includes(c._id)))
    // setSelectedContacts([])
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-zinc-100">
      {/* Sticky top: tabs + action buttons */}
      <div className="sticky top-0 z-20 bg-white rounded-t-xl px-6 pt-4 pb-0">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("contacts")}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                activeTab === "contacts"
                  ? "text-[#ea8d3f]"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Contacts
              {activeTab === "contacts" && (
                <div className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-[#ea8d3f]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("bulk-actions")}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                activeTab === "bulk-actions"
                  ? "text-[#ea8d3f]"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Bulk Actions
              {activeTab === "bulk-actions" && (
                <div className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-[#ea8d3f]" />
              )}
            </button>
          </nav>

          <div className="flex gap-3 pb-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="rounded-lg border border-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Import
            </button>
            <button
              onClick={() => setIsSingleCallModalOpen(true)}
              className="rounded-lg bg-[#1a1c1e] px-4 py-1.5 text-sm font-medium text-white hover:bg-black"
            >
              Single Call
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {activeTab === "contacts" && (
        <div>
          {/* Bulk Action Bar & Search */}
          <div className="sticky top-[57px] z-10 bg-white px-6 pt-4 pb-3">
              {selectedContacts.length > 0 && (
                <div className="flex items-center gap-4 border-r border-zinc-200 pr-4">
                  <span className="text-sm font-semibold text-zinc-900">
                    {selectedContacts.length} Contact Selected
                  </span>
                  <button
                    onClick={toggleSelectAll}
                    className="rounded-lg border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                  >
                    {selectedContacts.length === contacts.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="rounded-lg border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setIsAutomationModalOpen(true)}
                    className="rounded-lg bg-[#1a1c1e] px-4 py-1.5 text-xs font-semibold text-white hover:bg-black"
                  >
                    Trigger Automation
                  </button>
                </div>
              )}

              <div className="flex-1">
                {/* <p className="mb-2 text-xs font-medium text-zinc-500">Search</p> */}
                <div className="relative max-w-xs">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type="text"
                    placeholder="Search name, email, business..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-zinc-100 bg-[#f9f9f9] py-2 pl-9 pr-4 text-sm outline-none focus:border-[#ea8d3f] transition-all"
                  />
                </div>
              </div>
            </div>

          {/* Table */}
          <div className="px-6">
            <table className="w-full text-left">
              <thead className="sticky top-[130px] z-10 bg-white shadow-[0_1px_0_0_#f4f4f5]">
                <tr className="text-[13px] font-semibold text-zinc-900">
                  <th className="py-3 pl-2">
                    <input
                      type="checkbox"
                      checked={
                        selectedContacts.length === contacts.length &&
                        contacts.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-zinc-300 accent-[#ea8d3f]"
                    />
                  </th>
                  <th className="py-3 px-4 font-medium">Contact Name</th>
                  <th className="py-3 px-4 font-medium">Phone</th>
                  <th className="py-3 px-4 font-medium">Email</th>
                  <th className="py-3 px-4 font-medium">Business Name</th>
                  <th className="py-3 px-4 font-medium">Created Date</th>
                  <th className="py-3 px-4 font-medium">Tags</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-zinc-50">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-8 text-center text-zinc-500"
                      >
                        Loading contacts...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-red-500">
                        Error: {error}
                      </td>
                    </tr>
                  ) : (
                    contacts.map((contact) => (
                      <tr
                        key={contact._id}
                        className="group hover:bg-zinc-50/50 transition-colors"
                      >
                        <td className="py-3 pl-2">
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact._id)}
                            onChange={() => toggleSelectContact(contact._id)}
                            className="h-4 w-4 rounded border-zinc-300 accent-[#ea8d3f]"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-zinc-900">
                              {contact.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-zinc-600">
                          {contact.phone}
                        </td>
                        <td className="py-3 px-4 text-sm text-zinc-600">
                          {contact.email}
                        </td>
                        <td className="py-3 px-4 text-sm text-zinc-600">
                          {contact.businessName}
                        </td>
                        <td className="py-3 px-4 text-sm text-zinc-600">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {contact.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-medium text-orange-600 border border-orange-100"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
          </div>

          {/* Pagination */}
          <div className="sticky bottom-0 z-10 bg-white px-6 py-4 border-t border-zinc-100 flex items-center justify-between">
            <p className="text-xs font-medium text-[#ea8d3f]">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1 || loading}
                className="flex h-8 items-center gap-1 rounded-lg border border-zinc-100 px-3 text-xs font-medium text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages || loading}
                className="flex h-8 items-center gap-1 rounded-lg border border-zinc-200 px-3 text-xs font-bold text-zinc-900 hover:bg-zinc-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "bulk-actions" && (
        <div>
          {/* Filters */}
          <div className="sticky top-[57px] z-10 bg-white px-6 pt-4 pb-3 flex items-end gap-6">
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
                    value={bulkActionsSearch}
                    onChange={(e) => setBulkActionsSearch(e.target.value)}
                    className="w-full rounded-lg border border-zinc-100 bg-[#f9f9f9] py-2 pl-9 pr-4 text-sm outline-none focus:border-[#ea8d3f] transition-all"
                  />
                </div>
              </div>
          </div>

          {/* Scrollable Table */}
          <div className="px-6">
            <table className="w-full text-left">
              <thead className="sticky top-[130px] bg-white z-10 shadow-[0_1px_0_0_#f4f4f5]">
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
                  {actionsLoading ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-zinc-500">
                        Loading actions...
                      </td>
                    </tr>
                  ) : actionsError ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-red-500">
                        {actionsError}
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
          <div className="sticky bottom-0 z-10 bg-white px-6 py-4 border-t border-zinc-100 flex items-center justify-between">
            <p className="text-xs font-medium text-[#ea8d3f]">
              Page {actionsPagination.currentPage} of {actionsPagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActionsPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={actionsPagination.currentPage <= 1 || actionsLoading}
                className="flex h-8 items-center gap-1 rounded-lg border border-zinc-100 px-3 text-xs font-medium text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-xs font-bold text-zinc-900 shadow-sm border border-zinc-200">
                {actionsPagination.currentPage}
              </div>
              <button
                onClick={() => setActionsPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={actionsPagination.currentPage >= actionsPagination.totalPages || actionsLoading}
                className="flex h-8 items-center gap-1 rounded-lg border border-zinc-100 px-3 text-xs font-medium text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <TriggerAutomationModal
        isOpen={isAutomationModalOpen}
        onClose={() => setIsAutomationModalOpen(false)}
        selectedContactIds={selectedContacts}
        contacts={contacts}
      />
      <ImportContactsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          fetchContacts();
          setIsImportModalOpen(false);
        }}
      />
      <SingleCallModal
        isOpen={isSingleCallModalOpen}
        onClose={() => setIsSingleCallModalOpen(false)}
      />
      <ActionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        actionId={selectedActionId}
      />
    </div>
  );
}

export default ContactsPage;
