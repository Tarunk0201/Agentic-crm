import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PhoneCall } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function SingleCallModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { tokens } = useAuth();

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setError("Please fill in both name and phone number.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/agent/trigger_ai_call`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          body: JSON.stringify(formData),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || "Failed to trigger call.");
      }

      setSuccessMessage(result.msg || "Call triggered successfully!");
      setFormData({ name: "", phone: "" }); // Reset form
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 2000); // Close modal after 2 seconds
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
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
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between p-6">
            <h2 className="text-xl font-bold text-zinc-800">Trigger AI Call</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            >
              <X size={20} className="text-orange-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-zinc-700 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm outline-none focus:border-orange-400 transition-all"
                  placeholder="e.g., Anjali"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-zinc-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm outline-none focus:border-orange-400 transition-all"
                  placeholder="e.g., +91 XXXXXXXXXX"
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 text-xs text-center text-red-600">{error}</p>
            )}
            {successMessage && (
              <p className="mt-4 text-xs text-center text-green-600">
                {successMessage}
              </p>
            )}

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-zinc-200 px-6 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-full bg-[#1a1c1e] px-8 py-2 text-sm font-medium text-white hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PhoneCall size={16} />
                {loading ? "Calling..." : "Call"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default SingleCallModal;
