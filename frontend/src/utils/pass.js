export function formatDateTime(value, options = {}) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-BD", {
    timeZone: "Asia/Dhaka",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...options,
  }).format(new Date(value));
}

export function formatMoney(amount, currency = "BDT") {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function extractToken(value) {
  const candidate = String(value || "").trim();
  if (!candidate) return "";

  const queryIndex = candidate.indexOf("?");
  if (queryIndex !== -1) {
    const params = new URLSearchParams(candidate.slice(queryIndex + 1));
    const token = params.get("token");
    if (token) return token;
  }

  return candidate;
}

export function tokenFromHash() {
  const hash = window.location.hash || "";
  return hash.includes("?token=") ? extractToken(hash) : "";
}
