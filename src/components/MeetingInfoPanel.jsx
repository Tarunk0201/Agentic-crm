import React from "react";
import MeetingTimeline from "../pages/MeetingTimeline"; // Corrected import path

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between border-b border-zinc-100 py-3">
    <p className="text-sm text-zinc-500">{label}</p>
    <p className="text-sm font-semibold text-zinc-800 truncate" title={value}>
      {value}
    </p>
  </div>
);

function MeetingInfoPanel({ details }) {
  if (!details) {
    return null;
  }

  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-[0.8fr,1.2fr] gap-6 p-2">
      {/* Right Column: Details */}
      <div>
        <DetailItem label="To" value={details.to} />
        <DetailItem label="From" value={details.from} />
        <DetailItem label="Customer Name" value={details.customerName} />
        <DetailItem label="Call Status" value={details.callStatus} />
        <DetailItem label="Call Date" value={details.callDate} />
        <DetailItem label="Call ID" value={details.callId} />
        <DetailItem label="Call Duration" value={details.callDuration} />
        <DetailItem label="Total Cost" value={details.totalCost} />
      </div>
    </div>
  );
}

export default MeetingInfoPanel;
