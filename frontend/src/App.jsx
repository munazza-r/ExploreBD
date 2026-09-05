import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import ExploreGuides from "./pages/ExploreGuides";
import GuideProfilePage from "./pages/GuideProfilePage";
import VerificationPage from "./pages/VerificationPage";
import AdminVerificationPage from "./pages/AdminVerificationPage";
import TourPackagePage from "./pages/TourPackagePage";
import BookingPage from "./pages/BookingPage";
import MeetingPointPage from "./pages/MeetingPointPage";
import GuideMeetingApprovalsPage from "./pages/GuideMeetingApprovalsPage";
import ChatPage from "./pages/ChatPage";
import ItineraryBuilderPage from "./pages/ItineraryBuilderPage";
import MyPaymentsPage from "./pages/MyPaymentsPage";
import GuideEarningsPage from "./pages/GuideEarningsPage";
import AdminPaymentsPage from "./pages/AdminPaymentsPage";
import BookingPassPage from "./pages/BookingPassPage";
import VerifyPassPage from "./pages/VerifyPassPage";
import SupportPage from "./pages/SupportPage";
import AdminRequestsPage from "./pages/AdminRequestsPage";
import PaymentCallbackPage from "./pages/PaymentCallbackPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/payment/callback" element={<PaymentCallbackPage />} />
          <Route path="/" element={<HomePage />} />

          {/* Available to any logged-in user */}
          <Route path="/guides" element={<ProtectedRoute><ExploreGuides /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />

          {/* Tourist-facing */}
          <Route path="/meeting-point" element={<ProtectedRoute role="TOURIST"><MeetingPointPage /></ProtectedRoute>} />
          <Route path="/itinerary" element={<ProtectedRoute role="TOURIST"><ItineraryBuilderPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute role="TOURIST"><MyPaymentsPage /></ProtectedRoute>} />
          <Route path="/qr-pass" element={<ProtectedRoute role="TOURIST"><BookingPassPage /></ProtectedRoute>} />

          {/* Guide-facing */}
          <Route path="/guide-profile" element={<ProtectedRoute role="GUIDE"><GuideProfilePage /></ProtectedRoute>} />
          <Route path="/meeting-approvals" element={<ProtectedRoute role="GUIDE"><GuideMeetingApprovalsPage /></ProtectedRoute>} />
          <Route path="/tour-packages" element={<ProtectedRoute role="GUIDE"><TourPackagePage /></ProtectedRoute>} />
          <Route path="/verification" element={<ProtectedRoute role="GUIDE"><VerificationPage /></ProtectedRoute>} />
          <Route path="/earnings" element={<ProtectedRoute role="GUIDE"><GuideEarningsPage /></ProtectedRoute>} />
          <Route path="/scan-qr" element={<ProtectedRoute role="GUIDE"><VerifyPassPage /></ProtectedRoute>} />

          {/* Admin-facing */}
          <Route path="/admin/verification" element={<ProtectedRoute role="ADMIN"><AdminVerificationPage /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute role="ADMIN"><AdminPaymentsPage /></ProtectedRoute>} />
          <Route path="/admin/requests" element={<ProtectedRoute role="ADMIN"><AdminRequestsPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
