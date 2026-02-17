export interface CartItem {
  item_id: string;
  item_name: string;
  item_slug: string;
  item_mainimg: string;
  item_category: string;
  item_subcategory: string;
  item_brand: string;
  item_weight: number;
  item_color: string | null;
  item_quantity: number;
  item_price: number;
  item_isPreOrder?: boolean;
  item_preorderPrice?: number | null;
  item_stock?: number | null;
  item_lowstockthreshold?: number | null;
  item_instock?: boolean;
}
