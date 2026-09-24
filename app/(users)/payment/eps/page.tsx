import { Metadata } from "next";
import EpsPaymentResult from "./eps-payment-result";

export const metadata: Metadata = {
  title: "Payment Status | Evo-TechBD",
};

interface EpsPaymentPageProps {
  searchParams: Promise<{
    status?: string;
    order?: string;
    code?: string;
  }>;
}

const EpsPaymentPage = async ({ searchParams }: EpsPaymentPageProps) => {
  const { status, order, code } = await searchParams;

  return (
    <EpsPaymentResult
      initialStatus={status ?? "error"}
      orderId={order}
      trackingCode={code}
    />
  );
};

export default EpsPaymentPage;
