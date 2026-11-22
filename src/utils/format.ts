const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

// Formats an exact decimal string (e.g. "692912.06") as £692,912.06
export function formatGbp(amount: string): string {
  return gbp.format(amount as Intl.StringNumericLiteral);
}

const utcDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  // Always show the UTC calendar date, whatever timezone the server or browser is in
  timeZone: "UTC",
});

// Formats a timestamp as a UTC date, e.g. 14 Oct 2026
export function formatUtcDate(date: Date): string {
  return utcDate.format(date);
}
