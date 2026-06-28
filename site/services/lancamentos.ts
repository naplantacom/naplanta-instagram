import { apiGet } from "./api";
import type { Empreendimento } from "@/data/lancamentos";

/** Lançamento como vem da API REST (GET /lancamentos.php). */
export interface LancamentoApi {
  slug: string;
  nome: string;
  incorporadora?: string;
  status: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  regiao?: string;
  entrega?: string;
  resumo?: string;
  area_min?: number;
  area_max?: number;
  suites_min?: number;
  suites_max?: number;
  preco_min?: number;
  preco_a_partir?: string;
  destaques?: string[];
  capa?: string;
  logo?: string;
  landing_url?: string;
  destaque?: boolean;
}

export interface LancamentosResponse {
  total: number;
  data: LancamentoApi[];
}

/** Lista os lançamentos curados no back office. */
export function listLancamentos(revalidate = 300): Promise<LancamentosResponse> {
  return apiGet<LancamentosResponse>("lancamentos.php", { revalidate });
}

/** Mapeia o lançamento da API para o modelo de card usado na página. */
export function toEmpreendimento(l: LancamentoApi): Empreendimento {
  const local = [l.bairro, l.cidade, l.estado].filter(Boolean).join(" · ") || l.regiao || "";

  const suites =
    l.suites_min && l.suites_max
      ? l.suites_min === l.suites_max
        ? `${l.suites_min} suítes`
        : `${l.suites_min} a ${l.suites_max} suítes`
      : "";
  const area =
    l.area_min && l.area_max
      ? l.area_min === l.area_max
        ? `${l.area_min} m²`
        : `${l.area_min} a ${l.area_max} m²`
      : "";
  const tipologias = [suites, area].filter(Boolean).join(" · ") || (l.destaques?.[0] ?? "");

  return {
    slug: l.slug,
    nome: l.nome,
    local,
    status: l.status,
    precoDe: l.preco_a_partir || "Consulte valores",
    resumo: l.resumo ?? "",
    tipologias,
    cover: l.capa ?? "",
    url: l.landing_url ?? "",
  };
}
