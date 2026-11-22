const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

// Formats an exact decimal string (e.g. "692912.06") as £692,912.06.
// Longer strings such as an average ("183369.99584") are rounded here, at display time only,
// to the nearest penny with halves rounded up (Intl's default "halfExpand" rounding)
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

const count = new Intl.NumberFormat("en-GB");

// Formats a whole number with thousands separators, e.g. 2,030
export function formatCount(value: number): string {
  return count.format(value);
}
