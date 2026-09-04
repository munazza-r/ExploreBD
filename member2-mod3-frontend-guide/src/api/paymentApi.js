const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5082/api/payments";

export async function fetchCustomerPayments(touristName) {
  const res = await fetch(`${BASE_URL}/customer/${encodeURIComponent(touristName)}`);
  if (!res.ok) throw new Error("Failed to fetch payments");
  return res.json();
}

export async function fetchGuideEarnings(guideName) {
  const res = await fetch(`${BASE_URL}/guide/${encodeURIComponent(guideName)}`);
  if (!res.ok) throw new Error("Failed to fetch earnings");
  return res.json();
}

export async function releasePayment(id) {
  const res = await fetch(`${BASE_URL}/${id}/release`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to release payment");
  return res.json();
}
