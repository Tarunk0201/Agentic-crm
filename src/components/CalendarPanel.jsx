import React from "react";
import { Calendar, Clock } from "lucide-react";

function CalendarPanel({ meetingSummary }) {
  if (!meetingSummary) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        No meeting has been scheduled for this call.
      </div>
    );
  }

  const { final_status, meeting_time } = meetingSummary;

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold text-zinc-800">Meeting Details</h3>
      <div className="p-4 border rounded-lg bg-zinc-50 border-zinc-200">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-5 h-5 text-zinc-500" />
          <span className="font-medium text-zinc-700">Status:</span>
          <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
            {final_status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-zinc-500" />
          <span className="font-medium text-zinc-700">Time:</span>
          <span className="text-zinc-900">{meeting_time}</span>
        </div>
      </div>
    </div>
  );
}

export default CalendarPanel;
