import React, { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import TriggerAutomationModal from "../components/TriggerAutomationModal";
import ImportContactsModal from "../components/ImportContactsModal";
import TriggerCallModal from "../components/TriggerCallModal";
import { useAuth } from "../context/AuthContext";

function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isTriggerCallModalOpen, setIsTriggerCallModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });
  const { tokens, setTokens } = useAuth();
  const navigate = useNavigate();

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

  const handleTriggerCall = async () => {
    if (selectedContacts.length !== 1) return;

    const contactToCall = contacts.find((c) => c._id === selectedContacts[0]);
    if (!contactToCall) return;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const url = `${API_BASE_URL}/api/ivr-agent/trigger_ai_call`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify({
          name: contactToCall.name,
          phone: contactToCall.phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to trigger call.");
      }

      alert("Call triggered successfully!");
      setIsTriggerCallModalOpen(false);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
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
    <div className="p-6">
      <Navbar onImportClick={() => setIsImportModalOpen(true)} />

      <div className="rounded-[20px] bg-white p-6 shadow-sm border border-zinc-100">
        {/* Bulk Action Bar */}
        <div className="mb-6 flex items-center gap-4">
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
              {selectedContacts.length === 1 && (
                <button
                  onClick={() => setIsTriggerCallModalOpen(true)}
                  className="rounded-lg bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                >
                  Trigger Single Call
                </button>
              )}
            </div>
          )}

          <div className="flex-1">
            <p className="mb-2 text-xs font-medium text-zinc-500">Search</p>
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
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-50 text-[13px] font-semibold text-zinc-900">
                <th className="pb-4 pl-2">
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
                <th className="pb-4 px-4 font-medium">Contact Name</th>
                <th className="pb-4 px-4 font-medium">Phone</th>
                <th className="pb-4 px-4 font-medium">Email</th>
                <th className="pb-4 px-4 font-medium">Business Name</th>
                <th className="pb-4 px-4 font-medium">Created Date</th>
                <th className="pb-4 px-4 font-medium">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-zinc-500">
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
                    <td className="py-4 pl-2">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact._id)}
                        onChange={() => toggleSelectContact(contact._id)}
                        className="h-4 w-4 rounded border-zinc-300 accent-[#ea8d3f]"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-zinc-900">
                          {contact.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-zinc-600">
                      {contact.phone}
                    </td>
                    <td className="py-4 px-4 text-sm text-zinc-600">
                      {contact.email}
                    </td>
                    <td className="py-4 px-4 text-sm text-zinc-600">
                      {contact.businessName}
                    </td>
                    <td className="py-4 px-4 text-sm text-zinc-600">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
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
        <div className="mt-8 flex items-center justify-between border-t border-zinc-50 pt-6">
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
              disabled={
                pagination.currentPage >= pagination.totalPages || loading
              }
              className="flex h-8 items-center gap-1 rounded-lg border border-zinc-200 px-3 text-xs font-bold text-zinc-900 hover:bg-zinc-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <TriggerAutomationModal
        isOpen={isAutomationModalOpen}
        onClose={() => setIsAutomationModalOpen(false)}
      />
      <ImportContactsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          fetchContacts();
          setIsImportModalOpen(false);
        }}
      />
      <TriggerCallModal
        isOpen={isTriggerCallModalOpen}
        onClose={() => setIsTriggerCallModalOpen(false)}
        contact={contacts.find((c) => c._id === selectedContacts[0])}
        onConfirm={handleTriggerCall}
      />
    </div>
  );
}

export default ContactsPage;
