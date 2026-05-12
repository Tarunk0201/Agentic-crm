import { motion } from "framer-motion";

function CallLogItem({ call, active, onClick }) {
  const isAnswered = call.status === "Answered";

  return (
    <motion.button
      whileHover={{ scale: 1.003 }}
      onClick={onClick}
      className={`w-full rounded-[14px] border px-3.5 py-3 text-left transition ${
        active
          ? "border-[#f2b277] bg-[#fff8f0]"
          : "border-zinc-200 bg-white hover:border-[#f2b277]"
      }`}
    >
      <div className="flex justify-between">
        <div>
          <div className="mb-1">
            <p className="text-lg font-semibold leading-5 text-zinc-800">
              {call.customerName}
            </p>

            <p className="mb-2 text-lg text-zinc-500"> +{call.to}</p>
          </div>
          <p className="text-xs text-zinc-500">From {call.from}</p>
        </div>
        <div className="flex flex-col items-center justify-between text-sm text-zinc-500">
          <p>
            {call.date} • {call.time}
          </p>
          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`rounded-full px-2.5 py-1 text-sm font-semibold ${
                isAnswered
                  ? "bg-[#ecfaef] text-[#2f9a47]"
                  : "bg-red-100 text-red-500"
              }`}
            >
              {call.status}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export default CallLogItem;
