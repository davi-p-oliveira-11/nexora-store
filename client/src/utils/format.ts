export function formatPrice(
  cents: number,
  currency?: string | null,
): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: (currency ?? "usd").toUpperCase(),
  }).format(cents / 100);
}

type FormatOrderWhenOptions = {
  dateStyle?: Intl.DateTimeFormatOptions["dateStyle"];
};

export function formatOrderWhen(
  iso?: string | null,
  opts: FormatOrderWhenOptions = {},
): string {
  const { dateStyle = "medium" } = opts;

  if (!iso) return "";

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle,
    timeStyle: "short",
  }).format(date);
}