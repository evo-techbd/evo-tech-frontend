// Single source of truth for how a product's price is shown on the storefront.
// Mirrors backend order.service.ts#isGroupBuyActive, which decides what the
// customer is actually charged.

type PricingInput = {
  price: number;
  previousPrice?: number | null;
  preOrderPrice?: number | null;
  isPreOrder?: boolean | null;
};

export type DisplayPricing = {
  isGroupBuy: boolean;
  currentPrice: number;
  // Shown with a strikethrough beside currentPrice; null when nothing to strike.
  strikePrice: number | null;
};

// Group Buy is live only while the admin toggle is on and the Group Buy price
// is a real discount on the normal price.
export const isGroupBuyActive = ({
  price,
  preOrderPrice,
  isPreOrder,
}: PricingInput): boolean => {
  const groupBuyPrice = Number(preOrderPrice) || 0;
  return (
    isPreOrder === true && groupBuyPrice > 0 && groupBuyPrice < Number(price)
  );
};

// Group Buy on:  Group Buy price, normal price struck through.
// Group Buy off: normal price, previous price struck through (if higher).
export const getDisplayPricing = (input: PricingInput): DisplayPricing => {
  const price = Number(input.price) || 0;

  if (isGroupBuyActive(input)) {
    return {
      isGroupBuy: true,
      currentPrice: Number(input.preOrderPrice),
      strikePrice: price,
    };
  }

  const previousPrice = Number(input.previousPrice) || 0;
  return {
    isGroupBuy: false,
    currentPrice: price,
    strikePrice: previousPrice > price ? previousPrice : null,
  };
};
