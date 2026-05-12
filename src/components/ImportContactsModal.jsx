import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function ImportContactsModal({ isOpen, onClose, onImportSuccess }) {
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const fileInputRef = React.useRef(null);
  const { tokens } = useAuth();

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError("");
      setSuccessMessage("");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("contactsFile", selectedFile);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    console.log("Using accessToken:", tokens.accessToken); // Debugging line

    try {
      if (!tokens.accessToken) {
        throw new Error(
          "Authentication token is missing. Please log in again.",
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/tenant-admin/contacts/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || "File upload failed.");
      }

      setSuccessMessage(
        `${result.msg} Contacts created: ${result.contactsCreated}/${result.totalRows}.`,
      );
      setSelectedFile(null); // Clear file input after success

      if (onImportSuccess) {
        onImportSuccess();
      }
      // Optionally close the modal after a delay
      // setTimeout(onClose, 2000);
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
          className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between p-6">
            <h2 className="text-xl font-bold text-zinc-800">Import Contacts</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            >
              <X size={20} className="text-orange-500" />
            </button>
          </div>

          <div className="px-6 pb-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.xlsx"
              className="hidden"
            />
            <div
              onClick={handleUploadClick}
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/30 py-12 px-6 transition-colors hover:bg-orange-50/50"
            >
              <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                <Upload size={32} className="text-orange-500" />
              </div>
              <p className="text-center text-sm font-medium text-zinc-600">
                {selectedFile
                  ? `Selected: ${selectedFile.name}`
                  : "Drop .csv/.xlsx file or click to upload"}
              </p>
              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
              {successMessage && (
                <p className="mt-2 text-xs text-green-600">{successMessage}</p>
              )}
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-full border border-zinc-200 px-6 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedFile}
                className="rounded-full bg-[#1a1c1e] px-8 py-2 text-sm font-medium text-white hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Uploading..." : "Submit"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ImportContactsModal;
