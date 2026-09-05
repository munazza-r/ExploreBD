import { lazy, Suspense, useState } from "react";
import { getCurrentAuth } from "./api/passApi";

const BookingPassPage = lazy(() => import("./pages/BookingPassPage"));
const VerifyPassPage = lazy(() => import("./pages/VerifyPassPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));

export default function App() {
  const [auth, setAuth] = useState(() => getCurrentAuth());

  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#f4f8f6] text-sm font-semibold text-emerald-800">Preparing your ExploreBD workspace...</div>}>
      {!auth?.token || !["GUIDE", "TOURIST"].includes(auth?.user?.role)
        ? <LoginPage onSuccess={setAuth} />
        : auth.user.role === "GUIDE" ? <VerifyPassPage /> : <BookingPassPage />}
    </Suspense>
  );
}
