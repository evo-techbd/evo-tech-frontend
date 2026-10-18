import { ProductGroupsManager } from "@/components/admin/product-groups/product-groups-manager";

const ProductGroupsPage = () => {
  return (
    <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
          Product Groups
        </h2>
        <p className="text-sm text-stone-600">
          Group models of the same product line (e.g. A1 mini, A1, A1 Combo).
          Each product page then shows the other models beside its images,
          cheapest first, with the price difference.
        </p>
      </div>
      <ProductGroupsManager />
    </div>
  );
};

export default ProductGroupsPage;
