const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

// Formats an exact decimal string (e.g. "692912.06") as £692,912.06
export function formatGbp(amount: string): string {
  return gbp.format(amount as Intl.StringNumericLiteral);
}
