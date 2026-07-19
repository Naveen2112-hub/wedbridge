export function formatNumber(value: number, locale: string = "en-IN"): string {
  return new Intl.NumberFormat(locale).format(value);
}
