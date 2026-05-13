import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import MeetingDetails from "../components/MeetingDetails";
import CalendarToolbar from "../components/CalendarToolbar";

const localizer = momentLocalizer(moment);

function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { tokens, setTokens } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!tokens.accessToken) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const url = `${API_BASE_URL}/api/ivr-agent/meetings`;
      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });
        if (response.status === 401) {
          setTokens({ accessToken: null, refreshToken: null });
          navigate("/login");
          return;
        }
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || "Failed to fetch meetings.");
        }
        const data = await response.json();
        setMeetings(data.data);
        if (data.data.length > 0) {
          setSelectedMeetingId(data.data[0].call_uuid);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, [tokens.accessToken, navigate, setTokens]);

  useEffect(() => {
    const fetchMeetingDetails = async () => {
      if (!selectedMeetingId) return;
      setDetailsLoading(true);
      setMeetingDetails(null);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const url = `${API_BASE_URL}/api/ivr-agent/meeting/${selectedMeetingId}`;
      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });
        if (response.status === 401) {
          setTokens({ accessToken: null, refreshToken: null });
          navigate("/login");
          return;
        }
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || "Failed to fetch meeting details.");
        }
        const data = await response.json();
        setMeetingDetails(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setDetailsLoading(false);
      }
    };
    fetchMeetingDetails();
  }, [selectedMeetingId, tokens.accessToken, navigate, setTokens]);

  const events = useMemo(() => {
    return meetings.map((meeting) => {
      const meetingTime = moment(
        meeting.meeting_time,
        "DD MMMM YYYY at hh:mm A",
      );
      return {
        id: meeting.call_uuid,
        title: meeting.customer_name,
        start: meetingTime.toDate(),
        end: meetingTime.clone().add(1, "hour").toDate(), // Assuming 1-hour meetings
      };
    });
  }, [meetings]);

  if (loading) {
    return <div className="text-center p-4">Loading meetings...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-3"
    >
      <div className="grid flex-1 gap-3 xl:grid-cols-[1.06fr_0.74fr] items-start">
        <section className="glass flex flex-col rounded-[14px] p-3">
          <h2 className="text-xl text-center font-semibold text-zinc-800">
            Meetings Calendar
          </h2>
          <div className="bg-white rounded-lg overflow-hidden">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100vh" }} // Give a large height to allow scrolling
              onSelectEvent={(event) => setSelectedMeetingId(event.id)}
              onShowMore={(events, date) => {
                setView("day");
                setDate(date);
              }}
              onView={setView}
              onNavigate={setDate}
              view={view}
              date={date}
              components={{
                toolbar: CalendarToolbar,
              }}
            />
          </div>
        </section>
        <section className="glass flex flex-col rounded-[14px] p-3 sticky top-5 self-start">
          <MeetingDetails details={meetingDetails} loading={detailsLoading} />
        </section>
      </div>
    </motion.div>
  );
}

export default MeetingsPage;
