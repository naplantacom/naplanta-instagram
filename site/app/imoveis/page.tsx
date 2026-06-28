import type { Metadata } from "next";
import { ImoveisExplorer } from "@/components/ImoveisExplorer";
import { getFacets } from "@/services/facets";
import type { Facets, PropertyFilters } from "@/types/property";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Imóveis à venda e para alugar",
  description: "Encontre apartamentos, casas e lançamentos em São José, Florianópolis e região. Filtre por cidade, tipo, quartos e preço.",
};

const EMPTY_FACETS: Facets = {
  cidades: [],
  bairros: [],
  tipos: [],
  preco: { venda: { min: 0, max: 0 }, locacao: { min: 0, max: 0 } },
};

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const initial: PropertyFilters = {
    finalidade: sp.finalidade === "venda" ? "venda" : sp.finalidade === "locacao" ? "locacao" : undefined,
    cidade: sp.cidade || undefined,
    bairro: sp.bairro || undefined,
    tipo: sp.tipo || undefined,
    q: sp.q || undefined,
    quartos_min: sp.quartos_min ? Number(sp.quartos_min) : undefined,
    ordenar: (sp.ordenar as PropertyFilters["ordenar"]) || "recentes",
  };

  let facets = EMPTY_FACETS;
  try {
    facets = await getFacets();
  } catch {
    // segue com facetas vazias
  }

  return (
    <section className="container py-8">
      <h1 className="font-display text-3xl font-extrabold text-ink">Imóveis</h1>
      <ImoveisExplorer facets={facets} initial={initial} />
    </section>
  );
}
