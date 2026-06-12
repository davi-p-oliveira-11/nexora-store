import { useSearchParams } from "react-router";
import { apiFetch } from "../lib/api";
import { useQuery } from "@tanstack/react-query";

type Product = {
  id: string;
  slug: string;
  imageUrl?: string | null;
  category?: string | null;
  name: string;
  description: string;
  priceCents: number;
  currency?: string | null;
};

type CategoriesResponse = {
  categories: string[];
};

type ProductsResponse = {
  products: Product[];
};

export function useHomeCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category")?.trim() ?? "";

  const setCategory = (category: string) => {
  const next = new URLSearchParams(searchParams);

    if (!category) next.delete("category");
    else next.set("category", category);

    setSearchParams(next, { replace: true });   
 };

  const { data: categoriesData, isLoading: loadingCategories } = useQuery<CategoriesResponse>({
    queryKey: ["product-categories"],
    queryFn: () => apiFetch("/api/products/categories"),
  });

   const {
    data: productsData,
    isLoading: loadingList,
    error,
  } = useQuery<ProductsResponse>({
    queryKey: ["products", categoryFilter],
    queryFn: () =>
      apiFetch(
        categoryFilter
          ? `/api/products?category=${encodeURIComponent(categoryFilter)}`
          : "/api/products",
      ),
  });

  const categories: string[] = categoriesData?.categories ?? [];
  const products: Product[] = productsData?.products ?? [];
  const categoryChipsLoading = loadingCategories && categories.length === 0;
  
   return {
    categoryFilter,
    setCategory,
    categories,
    products,
    categoryChipsLoading,
    loadingCategories,
    loadingList,
    error,
  };

}