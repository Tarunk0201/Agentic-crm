import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ActionCards from "../components/ActionCards";
import CallDetails from "../components/CallDetails";
import CallList from "../components/CallList";
import RecordingPlayer from "../components/RecordingPlayer";
import SearchBar from "../components/SearchBar";
import StatsCard from "../components/StatsCard";
import Tabs from "../components/Tabs";
import TranscriptPanel from "../components/TranscriptPanel";
import CalendarPanel from "../components/CalendarPanel"; // Import CalendarPanel
import { useAuth } from "../context/AuthContext";
import {
  dashboardStats,
  recordingMeta,
  transcriptMessages,
} from "../data/mockData";

function VoiceCallLogsPage() {
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All"); // "All", "Answered", "Not Answered"
  const [calls, setCalls] = useState([]);
  const [selectedCallId, setSelectedCallId] = useState(null);
  const [activeTab, setActiveTab] = useState("Call Details");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  const [callDetails, setCallDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  const [transcript, setTranscript] = useState([]);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState(null);

  const { tokens, setTokens } = useAuth();
  const navigate = useNavigate();

  const fetchCalls = async () => {
    if (!tokens.accessToken) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const url = `${API_BASE_URL}/api/agent/calls?page=${pagination.currentPage}&limit=${pagination.limit}`;

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to fetch calls.");
      }

      const data = await response.json();
      const formattedCalls = data.data.map((call) => ({
        id: call.callId,
        from: call.from,
        to: call.to,
        customerName: call.customerName,
        status: call.status,
        date: new Date(call.callTime).toLocaleDateString(),
        time: new Date(call.callTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
      setCalls(formattedCalls);
      if (formattedCalls.length > 0) {
        setSelectedCallId(formattedCalls[0].id);
      }
      setPagination(
        data.pagination || { currentPage: 1, totalPages: 1, limit: 10 },
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCallDetails = async () => {
    if (!selectedCallId) return;

    setDetailsLoading(true);
    setDetailsError(null);
    setCallDetails(null); // Reset previous details

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const url = `${API_BASE_URL}/api/agent/conversation/${selectedCallId}`;

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to fetch call details.");
      }

      const data = await response.json();
      setCallDetails(data.data);
    } catch (err) {
      setDetailsError(err.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchTranscript = async () => {
    if (!selectedCallId) return;

    setTranscriptLoading(true);
    setTranscriptError(null);
    setTranscript([]);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const url = `${API_BASE_URL}/api/agent/transcript/${selectedCallId}`;

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to fetch transcript.");
      }

      const data = await response.json();
      setTranscript(data.data);
    } catch (err) {
      setTranscriptError(err.message);
    } finally {
      setTranscriptLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [tokens.accessToken, pagination.currentPage, pagination.limit]);

  useEffect(() => {
    if (selectedCallId) {
      fetchCallDetails();
      fetchTranscript();
    }
  }, [selectedCallId, tokens.accessToken]);

  const filteredCalls = useMemo(() => {
    let filtered = calls;

    // Apply status filter
    if (filterStatus !== "All") {
      filtered = filtered.filter((call) => call.status === filterStatus);
    }

    // Apply search query
    if (query) {
      const lowercasedQuery = query.toLowerCase();
      const isNumericQuery = /^\d+$/.test(query);

      filtered = filtered
        .map((call) => {
          let score = 0;
          const customerName = call.customerName?.toLowerCase() || "";
          const from = call.from?.toLowerCase() || "";
          const to = call.to?.toLowerCase() || "";
          const id = call.id?.toLowerCase() || "";

          if (isNumericQuery) {
            if (
              from.includes(lowercasedQuery) ||
              to.includes(lowercasedQuery)
            ) {
              score = 2; // Higher score for number match
            }
          } else {
            if (customerName.includes(lowercasedQuery)) {
              score = 2; // Higher score for name match
            }
          }

          if (id.includes(lowercasedQuery)) {
            score = Math.max(score, 1); // Lower score for ID match
          }

          return { ...call, score };
        })
        .filter((call) => call.score > 0)
        .sort((a, b) => b.score - a.score);
    }

    return filtered;
  }, [query, calls, filterStatus]);

  const selectedCall =
    filteredCalls.find((c) => c.id === selectedCallId) || filteredCalls[0];

  const availableTabs = [
    "Call Details",
    "Transcript",
    // "Recording"
  ];
  if (callDetails?.meetingSummary) {
    availableTabs.push("Calendar");
  }
  availableTabs.push("More");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[calc(100vh-1.25rem)] flex-col gap-3"
    >
      {/* <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-5">
        {dashboardStats.map((stat) => (
          <StatsCard key={stat.id} stat={stat} />
        ))}
      </div> */}

      <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[1.06fr_0.74fr]">
        <section className="glass flex min-h-0 flex-col rounded-[14px] p-3">
          <SearchBar
            query={query}
            setQuery={setQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
          <CallList
            calls={filteredCalls}
            selectedCallId={selectedCall?.id}
            setSelectedCallId={setSelectedCallId}
          />
        </section>
        <section className="glass flex min-h-0 flex-col rounded-[14px] p-3">
          <div className="mb-2.5 border-b border-zinc-200 pb-2.5">
            <h2 className="text-xl font-semibold text-zinc-800">
              Call Details Panel
            </h2>
            {selectedCall && (
              <p className="text-sm text-zinc-500">
                {selectedCall.id} • {selectedCall.status}
              </p>
            )}
          </div>
          <Tabs
            tabs={availableTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2.5 min-h-0 flex-1"
            >
              {activeTab === "Call Details" && selectedCall && (
                <CallDetails call={callDetails} loading={detailsLoading} />
              )}
              {activeTab === "Transcript" && (
                <TranscriptPanel
                  messages={transcript}
                  loading={transcriptLoading}
                  error={transcriptError}
                />
              )}
              {activeTab === "Recording" && (
                <RecordingPlayer recording={recordingMeta} />
              )}
              {activeTab === "Calendar" && (
                <CalendarPanel meetingSummary={callDetails?.meetingSummary} />
              )}
              {activeTab === "More" && <ActionCards />}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </motion.div>
  );
}

export default VoiceCallLogsPage;
