import { useAuth } from "@clerk/react";
import { useCart } from "../store/cart";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { useState } from "react";

type CartItem = {
  productId: string;
  quantity: number;
};

type Product = {
  id: string;
  slug: string;
  imageUrl?: string | null;
  name: string;
  priceCents: number;
  currency?: string | null;
};

type ProductsResponse = {
  products: Product[];
};

type CheckoutResponse = {
  checkoutUrl?: string;
};

export default function useCartPage() {
  const { getToken } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const items = useCart((s: { items: CartItem[] }) => s.items);
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.removeItem);

  const { data, isLoading: productsLoading, isError: productsError } =
    useQuery<ProductsResponse>({
      queryKey: ["products"],
      queryFn: () => apiFetch("/api/products"),
      enabled: items.length > 0,
    });

  const products = data?.products ?? [];

  const byId = new Map<string, Product>(
    products.map((p: Product) => [p.id, p]),
  );

  const lines = items.map((line: CartItem) => ({
    line,
    product: byId.get(line.productId) ?? null,
  }));

  const subtotal = lines.reduce((sum, { line, product }) => {
    if (!product) return sum;
    return sum + product.priceCents * line.quantity;
  }, 0);

  async function checkout() {
    setCheckoutLoading(true);

    const body = {
      items: items.map((i: CartItem) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    };

    const res = await apiFetch("/api/checkout", {
      getToken,
      method: "POST",
      body,
    });

    const data = res as CheckoutResponse;

    if (data?.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }

    setCheckoutLoading(false);
  }

  return {
    items,
    setQty,
    removeItem,
    productsLoading,
    productsError,
    lines,
    subtotal,
    checkout,
    checkoutLoading,
  };
}