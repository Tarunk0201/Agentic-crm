import React from "react";

function MeetingsList({ meetings, selectedMeetingId, onSelectMeeting }) {
  return (
    <div className="overflow-y-auto">
      {meetings.map((meeting) => (
        <div
          key={meeting.call_uuid}
          className={`p-3 cursor-pointer border-b border-gray-200 ${
            selectedMeetingId === meeting.call_uuid ? "bg-gray-100" : ""
          }`}
          onClick={() => onSelectMeeting(meeting.call_uuid)}
        >
          <div className="font-semibold">{meeting.customer_name}</div>
          <div className="text-sm text-gray-600">{meeting.meeting_time}</div>
        </div>
      ))}
    </div>
  );
}

export default MeetingsList;
