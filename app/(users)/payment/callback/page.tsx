import { Metadata } from "next";
import PaymentCallbackHandler from "./payment-callback-handler";

export const metadata: Metadata = {
  title: "Payment Processing | Evo-TechBD",
};

interface PaymentCallbackPageProps {
  searchParams: Promise<{
    paymentID?: string;
    status?: string;
    signature?: string;
  }>;
}

const PaymentCallbackPage = async ({
  searchParams,
}: PaymentCallbackPageProps) => {
  const resolvedParams = await searchParams;

  return <PaymentCallbackHandler searchParams={resolvedParams} />;
};

export default PaymentCallbackPage;
