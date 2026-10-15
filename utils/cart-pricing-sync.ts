import axios from "@/utils/axios/axios";
import type { CartItem } from "@/schemas/cartSchema";
import { isGroupBuyActive } from "@/utils/product-pricing";

const sameLine = (a: CartItem, b: CartItem) =>
  a.item_id === b.item_id &&
  (a.item_color || "").toLowerCase() === (b.item_color || "").toLowerCase() &&
  (a.item_isPreOrder ?? false) === (b.item_isPreOrder ?? false);

// Carts live in localStorage, so a line can outlive the price it was added at
// (e.g. an admin turned Group Buy off afterwards). Re-price every line against
// current product data so the cart shows what checkout will actually charge.
// Returns the updated cart, or null when nothing changed.
export const syncCartPricing = async (
  items: CartItem[],
): Promise<CartItem[] | null> => {
  const ids = Array.from(new Set(items.map((item) => item.item_id)));
  const results = await Promise.allSettled(
    ids.map((id) => axios.get(`/products/${id}`)),
  );

  const products = new Map<string, any>();
  results.forEach((result, idx) => {
    if (result.status === "fulfilled" && result.value.data?.data) {
      products.set(ids[idx], result.value.data.data);
    }
  });

  let changed = false;
  const synced: CartItem[] = [];

  for (const item of items) {
    const product = products.get(item.item_id);
    let next: CartItem = { ...item };

    if (product) {
      const wasGroupBuy = item.item_isPreOrder === true;
      const isGroupBuy = wasGroupBuy && isGroupBuyActive(product);
      const price = isGroupBuy
        ? Number(product.preOrderPrice)
        : Number(product.price) || item.item_price;

      next = {
        ...next,
        item_isPreOrder: isGroupBuy,
        item_price: price,
        item_preorderPrice: product.preOrderPrice ?? null,
      };

      // A Group Buy line that fell back to a regular purchase is stock-capped again
      if (wasGroupBuy && !isGroupBuy) {
        next.item_stock = typeof product.stock === "number" ? product.stock : null;
        next.item_instock = product.inStock ?? true;
      }

      if (isGroupBuy !== wasGroupBuy || price !== item.item_price) {
        changed = true;
      }
    }

    // Merge into an identical line (e.g. the same product already in the cart
    // as a regular purchase) instead of keeping two rows for it
    const duplicate = synced.find((line) => sameLine(line, next));
    if (duplicate) {
      duplicate.item_quantity += next.item_quantity;
      changed = true;
      continue;
    }

    synced.push(next);
  }

  return changed ? synced : null;
};
