import { apiGet } from "./api";
import type {
  PropertyFilters,
  PropertyListResponse,
  PropertyDetailResponse,
} from "@/types/property";

/** Lista imóveis com filtros + paginação. */
export function listProperties(
  filters: PropertyFilters = {},
  revalidate = 300
): Promise<PropertyListResponse> {
  const params: Record<string, string | number | boolean | undefined> = {
    ...filters,
    destaque: filters.destaque ? 1 : undefined,
  };
  return apiGet<PropertyListResponse>("properties.php", { params, revalidate });
}

/** Detalhe de um imóvel + similares. */
export function getProperty(id: string, revalidate = 300): Promise<PropertyDetailResponse> {
  return apiGet<PropertyDetailResponse>("properties.php", {
    params: { id },
    revalidate,
  });
}

/** Atalho: imóveis em destaque para a home. */
export function listFeatured(limit = 8, revalidate = 300): Promise<PropertyListResponse> {
  return listProperties({ destaque: true, per_page: limit, ordenar: "recentes" }, revalidate);
}
