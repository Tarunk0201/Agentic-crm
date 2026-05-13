import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Tabs from "./Tabs";
import TranscriptPanel from "./TranscriptPanel";
import MeetingInfoPanel from "./MeetingInfoPanel";

function MeetingDetails({ details, loading }) {
  const [activeTab, setActiveTab] = useState("Meeting Info");

  useEffect(() => {
    // Reset to the main tab when a new meeting is selected
    setActiveTab("Meeting Info");
  }, [details?.callId]);

  if (loading) {
    return <div className="text-center p-4">Loading details...</div>;
  }

  if (!details) {
    return (
      <div className="text-center p-4">Select a meeting to see details.</div>
    );
  }

  const availableTabs = ["Meeting Info", "Transcript"];

  return (
    <>
      <div className="mb-2.5 border-b border-zinc-200 pb-2.5">
        <h2 className="text-xl font-semibold text-zinc-800">Meeting Details</h2>
        <p className="text-sm text-zinc-500">
          {details.customerName} • {details.meetingSummary.final_status}
        </p>
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
          {activeTab === "Meeting Info" && (
            <MeetingInfoPanel details={details} />
          )}
          {activeTab === "Transcript" && (
            <TranscriptPanel messages={details.transcript} />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default MeetingDetails;
