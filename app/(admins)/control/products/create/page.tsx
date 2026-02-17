import { AddProductForm } from "@/components/admin/products/add-product-form";

const AdminCreateProductsPage = () => {
  return (
    <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
          Add New Product
        </h2>
      </div>
      <AddProductForm />
    </div>
  );
};

export default AdminCreateProductsPage;
