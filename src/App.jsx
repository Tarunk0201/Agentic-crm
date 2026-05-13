import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import ContactsPage from "./pages/ContactsPage";
import BulkActionsPage from "./pages/BulkActionsPage";
import VoiceCallLogsPage from "./pages/VoiceCallLogsPage";
import MeetingsPage from "./pages/MeetingsPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/contacts" replace />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/bulk-actions" element={<BulkActionsPage />} />
        <Route path="/logs" element={<VoiceCallLogsPage />} />
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route
          path="/smart-lists"
          element={<div className="p-6">Smart Lists Page (Coming Soon)</div>}
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
