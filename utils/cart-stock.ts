import { CartItem } from "@/schemas/cartSchema";

const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export type CartStockStatus = {
  itemId: string;
  itemName: string;
  requestedQuantity: number;
  availableStock: number | null;
  isOutOfStock: boolean;
  exceedsStock: boolean;
  isLowStock: boolean;
  message: string;
};

export const assessCartItemStock = (
  item: CartItem,
  quantityOverride?: number
): CartStockStatus => {
  const requestedQuantity =
    typeof quantityOverride === "number" && !Number.isNaN(quantityOverride)
      ? quantityOverride
      : Number(item.item_quantity) || 0;

  const availableStock = parseNumber(item.item_stock);
  const lowStockThreshold =
    (parseNumber(item.item_lowstockthreshold) ?? availableStock ?? 0) || 5;

  // If item is a preorder, skip stock validation
  const isPreOrder = item.item_isPreOrder === true;

  const isOutOfStock =
    !isPreOrder &&
    (item.item_instock === false ||
      (typeof availableStock === "number" && availableStock <= 0));

  const exceedsStock =
    !isPreOrder &&
    !isOutOfStock &&
    typeof availableStock === "number" &&
    requestedQuantity > availableStock;

  const isLowStock =
    !isPreOrder &&
    !isOutOfStock &&
    typeof availableStock === "number" &&
    availableStock > 0 &&
    availableStock <= lowStockThreshold;

  let message = "";
  if (isOutOfStock) {
    message = "This item is currently out of stock.";
  } else if (exceedsStock && typeof availableStock === "number") {
    message = `Only ${availableStock} in stock. Reduce the quantity to continue.`;
  } else if (isLowStock && typeof availableStock === "number") {
    message = `Only ${availableStock} left in stock.`;
  } else if (isPreOrder) {
    message = "Pre-order item - no stock validation required.";
  }

  return {
    itemId: item.item_id,
    itemName: item.item_name,
    requestedQuantity,
    availableStock: typeof availableStock === "number" ? availableStock : null,
    isOutOfStock,
    exceedsStock,
    isLowStock,
    message,
  };
};

export const summarizeCartStock = (items?: CartItem[] | null) => {
  const normalizedItems = Array.isArray(items) ? items : [];
  const statuses = normalizedItems.map((item) => assessCartItemStock(item));

  const blockingIssues = statuses.filter(
    (status) => status.isOutOfStock || status.exceedsStock
  );

  const warningIssues = statuses.filter(
    (status) =>
      !status.isOutOfStock && !status.exceedsStock && status.isLowStock
  );

  return {
    statuses,
    blockingIssues,
    warningIssues,
    hasBlockingIssues: blockingIssues.length > 0,
  };
};
