import { Metadata } from "next";
import AdminFinanceClient from "@/components/admin/finance/admin-finance-client";

export const metadata: Metadata = {
  title: "Finance Management",
  description: "Manage investments, expenses, and track financial health.",
};

const AdminFinancePage = () => {
  return <AdminFinanceClient />;
};

export default AdminFinancePage;
