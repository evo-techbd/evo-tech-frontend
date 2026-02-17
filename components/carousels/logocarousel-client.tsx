"use client";

import { useState, useEffect, memo } from "react";
import LogoCarousel from "./logocarousel";
import axios from "@/utils/axios/axios";
import axiosErrorLogger from "@/components/error/axios_error";

interface LogoData {
  brand_name: string;
  brand_logosrc: string;
  brand_url?: string;
  brand_description?: string | null;
}

const LogoCarouselClient = memo(() => {
  const [logos, setLogos] = useState<LogoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLogos = async () => {
      try {
        const response = await axios.get("/clients/active");
        const clientsData = response?.data?.data ?? [];

        if (!isMounted) {
          return;
        }

        const mappedLogos: LogoData[] = clientsData
          .map((client: any) => ({
            brand_name: client?.name ?? client?.brand_name ?? "Unknown Company",
            brand_logosrc: client?.logo ?? client?.brand_logosrc ?? "",
            brand_url: client?.website ?? client?.brand_url ?? undefined,
            brand_description:
              client?.description ?? client?.brand_description ?? null,
          }))
          .filter((item: LogoData) => Boolean(item.brand_logosrc));

        setLogos(mappedLogos);
      } catch (error: any) {
        axiosErrorLogger({ error });
        if (isMounted) {
          setLogos([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLogos();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[80px] flex justify-center items-center">
        <div className="w-5 h-5 border-2 border-stone-400 border-t-stone-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (logos.length === 0) {
    return null;
  }

  return <LogoCarousel logos={logos} />;
});

LogoCarouselClient.displayName = "LogoCarouselClient";

export default LogoCarouselClient;
