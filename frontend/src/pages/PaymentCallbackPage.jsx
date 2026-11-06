import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";

export default function PaymentCallbackPage() {
  const [params] = useSearchParams();
  const status = params.get("status");
  const paymentId = params.get("paymentId");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white border border-gray-200 rounded-xl p-8 text-center">
        {status === "success" ? (
          <>
            <CheckCircle2 className="mx-auto text-green-700 mb-3" size={40} />
            <h1 className="text-lg font-bold text-gray-900 mb-1">Payment successful</h1>
            <p className="text-sm text-gray-500 mb-4">Your payment is now held securely in escrow.</p>
          </>
        ) : (
          <>
            <XCircle className="mx-auto text-red-600 mb-3" size={40} />
            <h1 className="text-lg font-bold text-gray-900 mb-1">Payment {status || "failed"}</h1>
            <p className="text-sm text-gray-500 mb-4">Something went wrong with your payment.</p>
          </>
        )}
        <Link to="/payments" className="text-green-700 font-semibold text-sm">Back to My Payments</Link>
      </div>
    </div>
  );
}
