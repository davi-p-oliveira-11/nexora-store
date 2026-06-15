import { useAuth } from "@clerk/react";
import { apiFetch } from "../lib/api.js";
import { useQuery } from "@tanstack/react-query";
import type { PreviewItem } from "../components/OrderPreview.js";

type Order = {
  id: string;
  status: string;
  amountCents: number;
  currency?: string | null;
  createdAt: string;
  totalCents: number;
  previewItems?: PreviewItem[];
};

function useOrdersPage() {
  const { getToken, isSignedIn } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: () => apiFetch("/api/orders", { getToken }),
    enabled: isSignedIn,
  });

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/me", { getToken }),
    enabled: isSignedIn,
  });

  const staff = meData?.user?.role === "support" || meData?.user?.role === "admin";

  const orders: Order[] = data?.orders ?? [];

  return {
    isLoading,
    error,
    orders,
    staff,
  };
}

export default useOrdersPage;