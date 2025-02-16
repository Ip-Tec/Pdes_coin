export const formatCurrency = (amount: number): string => {
  const truncated = Math.floor(amount * 100) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(truncated);
};

export const formattedMoneyUSD = (number: number): string => {
  const truncated = Math.floor(number * 100) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(truncated);
};

export const formattedMoneyNGN = (amount: number) => {
  const truncated = Math.floor(amount * 100) / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(truncated);
};
