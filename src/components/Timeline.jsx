function Timeline({ timeline }) {
  const getEventColor = (key) => {
    if (key.includes("initiated")) return "bg-sky-400";
    if (key.includes("picked_up")) return "bg-emerald-500";
    if (key.includes("disconnected")) return "bg-red-800";
    return "bg-[#ea8d3f]";
  };

  const timelineEvents = timeline
    ? Object.entries(timeline)
        .filter(([key]) => key !== "call_summary")
        .map(([key, value]) => ({
          key,
          label: key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          value: new Date(value).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }))
    : [];

  if (!timeline) {
    return (
      <div className="text-center text-zinc-500">
        No timeline data available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {timelineEvents.map((item) => (
        <div key={item.key} className="flex gap-2.5">
          <div className="flex flex-col items-center">
            <span
              className={`mt-1 h-2.5 w-2.5 rounded-full ${getEventColor(
                item.key,
              )}`}
            />
          </div>
          <div>
            <p className="text-base font-semibold leading-tight text-zinc-700">
              {item.label}
            </p>
            <p className="text-sm text-zinc-500">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Timeline;
