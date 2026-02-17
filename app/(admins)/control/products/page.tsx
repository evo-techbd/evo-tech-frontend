import { Metadata } from "next";
import AdminProductsClient from "@/components/admin/products/admin-products-client";

export const metadata: Metadata = {
  title: "Products",
  description: "View and manage products",
};

const AdminProductsPage = () => {
  return <AdminProductsClient />;
};

export default AdminProductsPage;
