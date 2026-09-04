import { lazy, Suspense, useEffect, useMemo } from "react";
import { getCurrentAuth } from "./api/passApi";

const BookingPassPage = lazy(() => import("./pages/BookingPassPage"));
const VerifyPassPage = lazy(() => import("./pages/VerifyPassPage"));

export default function App() {
  const auth = useMemo(() => getCurrentAuth(), []);

  useEffect(() => {
    if (!auth?.token || !["GUIDE", "TOURIST"].includes(auth?.user?.role)) {
      window.location.replace("/login.html");
    }
  }, [auth]);

  if (!auth?.token || !auth?.user) return null;

  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#f4f8f6] text-sm font-semibold text-emerald-800">Preparing your ExploreBD workspace...</div>}>
      {auth.user.role === "GUIDE" ? <VerifyPassPage /> : <BookingPassPage />}
    </Suspense>
  );
}
