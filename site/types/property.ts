/** Tipos espelhando a API REST v1 do back office (multi/api/v1). */

export interface PropertyCard {
  id: string;
  titulo: string;
  tipo: string;
  finalidade: string;
  destinacao: string;
  transacao: "venda" | "locacao";
  preco_venda: number;
  preco_locacao: number;
  condominio: number;
  iptu: number;
  bairro: string;
  cidade: string;
  estado: string;
  quartos: number;
  suites: number;
  banheiros: number;
  vagas: number;
  area_interna: number;
  area_total: number;
  condominio_nome: string;
  destaque: boolean;
  capa: string | null;
  desconto_tipo?: "percentual" | "valor";
  desconto_valor?: number;
  preco_promocional?: number;
  fotos_total: number;
}

export interface PropertyAgent {
  nome: string;
  creci: string;
  telefone: string;
}

export interface PropertyDetail extends PropertyCard {
  descricao: string;
  andar: string;
  salas: number;
  varandas: number;
  area_externa: number;
  taxa_lixo: number;
  seguro: number;
  iptu_vaga: number;
  iptu_parcelas: number;
  iptu_vaga_parcelas: number;
  taxa_lixo_parcelas: number;
  seguro_parcelas: number;
  aceita_financiamento: boolean;
  aceita_permuta: boolean;
  lat: number | null;
  lng: number | null;
  video_url: string;
  tour_url: string;
  caracteristicas: string[];
  fotos: string[];
  corretor: PropertyAgent | null;
}

export interface PropertyListResponse {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  data: PropertyCard[];
}

export interface PropertyDetailResponse {
  data: PropertyDetail;
  similares: PropertyCard[];
}

export interface FacetItem {
  nome: string;
  total: number;
}

export interface Facets {
  cidades: FacetItem[];
  bairros: FacetItem[];
  tipos: FacetItem[];
  preco: {
    venda: { min: number; max: number };
    locacao: { min: number; max: number };
  };
}

export interface PropertyFilters {
  finalidade?: "venda" | "locacao";
  tipo?: string;
  cidade?: string;
  bairro?: string;
  q?: string;
  quartos_min?: number;
  vagas_min?: number;
  area_min?: number;
  preco_min?: number;
  preco_max?: number;
  destaque?: boolean;
  ordenar?: "recentes" | "preco_asc" | "preco_desc" | "area_desc";
  page?: number;
  per_page?: number;
}
