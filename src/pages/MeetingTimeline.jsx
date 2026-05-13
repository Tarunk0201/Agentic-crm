import React from "react";

const getStatusColor = (status) => {
  if (status.includes("initiated")) return "bg-blue-500";
  if (status.includes("picked_up")) return "bg-green-500";
  if (status.includes("summary") || status.includes("tag"))
    return "bg-orange-500";
  if (status.includes("disconnected")) return "bg-red-500";
  return "bg-zinc-400";
};

function MeetingTimeline({ timeline }) {
  if (!timeline) return null;

  return (
    <div className="relative border-l-2 border-zinc-200 pl-8 py-2">
      {Object.entries(timeline).map(([key, value]) => (
        <div key={key} className="mb-6 last:mb-0">
          <div
            className={`absolute -left-[9px] h-4 w-4 rounded-full border-4 border-white ${getStatusColor(
              key,
            )}`}
          ></div>
          <p className="font-semibold capitalize text-zinc-800 text-md">
            {key.replace(/_/g, " ")}
          </p>
          <p className="text-sm text-zinc-500">
            {new Date(value).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      ))}
    </div>
  );
}

export default MeetingTimeline;
