import { CartItem } from "@/schemas/cartSchema";

const roundBDT = (value: number) => {
  const normalized = typeof value === "number" && !isNaN(value) ? value : 0;
  return Math.round(normalized * 100) / 100;
};

export interface CartBreakdown {
  cartSubTotal: number;
  regularSubtotal: number;
  preOrderSubtotal: number;
  preOrderDepositDue: number;
  preOrderBalanceDue: number;
  dueNowSubtotal: number;
  hasPreOrderItems: boolean;
  preOrderItemsCount: number;
}

export const calculateCartBreakdown = (
  cartItems: CartItem[] | null | undefined
): CartBreakdown => {
  const items = Array.isArray(cartItems) ? cartItems : [];

  let cartSubTotal = 0;
  let preOrderSubtotal = 0;
  let preOrderItemsCount = 0;

  for (const item of items) {
    const price = Number(item.item_price) || 0;
    const quantity = Number(item.item_quantity) || 0;
    const lineTotal = price * quantity;
    cartSubTotal += lineTotal;

    if (item.item_isPreOrder) {
      preOrderSubtotal += lineTotal;
      preOrderItemsCount += quantity;
    }
  }

  const preOrderDepositDue =
    preOrderSubtotal > 0 ? roundBDT(preOrderSubtotal * 0.5) : 0;
  const preOrderBalanceDue = roundBDT(
    Math.max(preOrderSubtotal - preOrderDepositDue, 0)
  );
  const regularSubtotal = roundBDT(cartSubTotal - preOrderSubtotal);
  const dueNowSubtotal = roundBDT(regularSubtotal + preOrderDepositDue);

  return {
    cartSubTotal: roundBDT(cartSubTotal),
    regularSubtotal,
    preOrderSubtotal: roundBDT(preOrderSubtotal),
    preOrderDepositDue,
    preOrderBalanceDue,
    dueNowSubtotal,
    hasPreOrderItems: preOrderItemsCount > 0,
    preOrderItemsCount,
  };
};
