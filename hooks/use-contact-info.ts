"use client";

import useSWR from "swr";
import axios from "@/utils/axios/axios";
import {
  ContactInfo,
  DEFAULT_CONTACT_INFO,
  withContactDefaults,
} from "@/lib/contact-info";

const fetchContactInfo = (url: string) =>
  axios.get(url).then((res) => withContactDefaults(res.data?.data));

// Client components (e.g. the footer). Shows the defaults until loaded.
export const useContactInfo = (): ContactInfo => {
  const { data } = useSWR("/settings/contact", fetchContactInfo, {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000,
  });
  return data ?? DEFAULT_CONTACT_INFO;
};
