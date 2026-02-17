import { Metadata } from "next";
import TrackOrderClient from "./track-order-client";

export const metadata: Metadata = {
  title: "Track Order - Evo-Tech",
  description: "Track your order status and delivery information",
};

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}
