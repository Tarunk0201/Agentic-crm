import React, { useState } from "react";
import { X } from "lucide-react";

function TriggerCallModal({ isOpen, onClose, contact, onConfirm }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-zinc-800">
            Trigger Single Call
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700"
          >
            <X size={24} />
          </button>
        </div>
        <div className="mb-6">
          <p className="text-zinc-600">
            You are about to trigger a call to the following contact:
          </p>
          <div className="mt-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <p className="font-semibold text-zinc-800">{contact.name}</p>
            <p className="text-zinc-500">{contact.phone}</p>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#1a1c1e] text-white font-semibold hover:bg-black disabled:bg-zinc-400"
          >
            {loading ? "Triggering..." : "Confirm & Call"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TriggerCallModal;
