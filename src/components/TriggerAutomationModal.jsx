import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function TriggerAutomationModal({ isOpen, onClose, selectedContactIds, contacts }) {
  const [mode, setMode] = React.useState("send_all_at_once");
  const [actionName, setActionName] = React.useState("");
  const [scheduleTime, setScheduleTime] = React.useState("");
  const [batchSize, setBatchSize] = React.useState(50);
  const [intervalMinutes, setIntervalMinutes] = React.useState(1440);
  const [loading, setLoading] = React.useState(false);
  const { tokens } = useAuth();

  const leads = React.useMemo(() => {
    return (contacts || []).filter((c) => (selectedContactIds || []).includes(c._id));
  }, [contacts, selectedContactIds]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!actionName.trim()) {
      alert("Action name is required.");
      return;
    }
    
    if (leads.length === 0) {
      alert("No contacts selected.");
      return;
    }

    if ((mode === "send_at_scheduled_time" || mode === "send_in_drip_mode") && !scheduleTime) {
      alert("Please select a date and time.");
      return;
    }

    setLoading(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const url = `${API_BASE_URL}/api/ivr-agent/trigger_campaign`;

    let trigger_type = "immediate";
    if (mode === "send_at_scheduled_time") trigger_type = "scheduled";
    if (mode === "send_in_drip_mode") trigger_type = "multi_level";

    const payload = {
      action_name: actionName,
      trigger_type,
      leads: leads.map(l => ({ name: l.name, phone: l.phone }))
    };

    if (trigger_type === "scheduled" || trigger_type === "multi_level") {
      payload.schedule_time = new Date(scheduleTime).toISOString();
    }

    if (trigger_type === "multi_level") {
      payload.batch_size = batchSize;
      payload.interval_minutes = intervalMinutes;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || errorData.message || "Failed to trigger campaign.");
      }

      alert("Campaign triggered successfully!");
      onClose();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
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
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 p-6">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                Add to automation
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                Runs the selected workflow or campaign for all selected contacts
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div>
              <p className="text-sm font-medium text-zinc-700">
                Add to automation for the following contacts
              </p>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                {leads.slice(0, 5).map((lead) => (
                  <div key={lead._id} className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm" title={lead.name}>
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {leads.length > 5 && (
                  <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center font-bold text-sm">
                    +{leads.length - 5}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Action name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Write a name for the action (to be shown in tracking report)"
                  value={actionName}
                  onChange={(e) => setActionName(e.target.value)}
                  maxLength={256}
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                  {actionName.length} / 256
                </span>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-zinc-700">
                Mode
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="send_all_at_once"
                    checked={mode === "send_all_at_once"}
                    onChange={(e) => setMode(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm text-zinc-600">
                    Send all at once
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="send_at_scheduled_time"
                    checked={mode === "send_at_scheduled_time"}
                    onChange={(e) => setMode(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm text-zinc-600">
                    Send at scheduled time
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="send_in_drip_mode"
                    checked={mode === "send_in_drip_mode"}
                    onChange={(e) => setMode(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm text-zinc-600">
                    Send in drip mode
                  </span>
                </label>
              </div>
            </div>

            {(mode === "send_at_scheduled_time" || mode === "send_in_drip_mode") && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Pick a start date & time (Local Time){" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 pl-4 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {mode === "send_in_drip_mode" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Batch Size <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Interval (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={intervalMinutes}
                    onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                    className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Info size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Please note the action will be performed over period of time.
                You can track the progress on the bulk actions page.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 bg-zinc-50/50 p-6 border-t border-zinc-100">
            <button
              onClick={onClose}
              className="rounded-lg px-6 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors border border-zinc-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Adding..." : "Add to automation"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default TriggerAutomationModal;
