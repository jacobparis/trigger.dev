const compactFormatter = Intl.NumberFormat("en", { notation: "compact", compactDisplay: "short" });

export const formatNumberCompact = (num: number): string => {
  return compactFormatter.format(num);
};

const formatter = Intl.NumberFormat("en");

export const formatNumber = (num: number): string => {
  return formatter.format(num);
};

const roundedCurrencyFormatter = Intl.NumberFormat("en-US", {
  style: "currency",
  currencyDisplay: "symbol",
  maximumFractionDigits: 0,
  currency: "USD",
});
const currencyFormatter = Intl.NumberFormat("en-US", {
  style: "currency",
  currencyDisplay: "symbol",
  currency: "USD",
});

const formatCurrency = (num: number, rounded: boolean): string => {
  return rounded ? roundedCurrencyFormatter.format(num) : currencyFormatter.format(num);
};
