import { motion } from "framer-motion";

function TranscriptPanel({ messages, loading, error }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Loading transcript...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Error: {error}
      </div>
    );
  }

  const formatSpeaker = (speaker) => {
    if (speaker.includes("IVR")) return "IVR";
    if (speaker.includes("Customer")) return "Customer";
    return speaker;
  };

  return (
    <div className="glass max-h-[450px] space-y-3 overflow-y-auto rounded-2xl p-4">
      {messages.map((msg, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex ${
            msg.speaker.includes("IVR") ? "justify-start" : "justify-end"
          }`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-3 py-2 ${
              msg.speaker.includes("IVR")
                ? "bg-orange-500 text-white"
                : "bg-zinc-100 text-zinc-700"
            }`}
          >
            <p className="text-sm font-semibold">
              {formatSpeaker(msg.speaker)}
            </p>
            <p className="text-sm">{msg.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default TranscriptPanel;

