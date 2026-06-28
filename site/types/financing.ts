export interface Banco {
  id: string;
  nome: string;
  taxa_aa: number; // juros efetivos ao ano (%)
  sistema: "SAC" | "PRICE";
  prazo_max_meses: number;
  entrada_min_pct: number;
}

export interface BancosResponse {
  atualizado: string;
  bancos: Banco[];
}

export interface Simulacao {
  banco: Banco;
  valorFinanciado: number;
  primeiraParcela: number;
  ultimaParcela: number;
  totalPago: number;
  totalJuros: number;
}
