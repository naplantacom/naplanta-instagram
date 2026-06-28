import { apiGet } from "./api";
import type { Facets } from "@/types/property";

/** Facetas para montar os filtros (cidades, bairros, tipos, faixa de preço). */
export function getFacets(cidade?: string, revalidate = 600): Promise<Facets> {
  return apiGet<Facets>("facets.php", {
    params: { cidade },
    revalidate,
  });
}
