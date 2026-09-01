import { BrowserRouter, Routes, Route } from "react-router-dom";
import Checkout from "./Checkout";
import PaymentCallback from "./PaymentCallback";
import AdminPayments from "./AdminPayments";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Checkout />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
