import type { Banco, Simulacao } from "@/types/financing";

/** Juros efetivos ao ano (%) → taxa mensal efetiva (decimal). */
export function annualToMonthly(taxaAaPct: number): number {
  return Math.pow(1 + taxaAaPct / 100, 1 / 12) - 1;
}

/**
 * Simula um financiamento imobiliário.
 * - PRICE: parcela fixa.
 * - SAC: amortização constante, parcelas decrescentes (mostra 1ª e última).
 */
export function simular(
  valorImovel: number,
  entrada: number,
  prazoMeses: number,
  banco: Banco
): Simulacao {
  const PV = Math.max(0, valorImovel - entrada);
  const n = Math.max(1, Math.round(prazoMeses));
  const i = annualToMonthly(banco.taxa_aa);

  let primeira: number, ultima: number, totalPago: number;

  if (banco.sistema === "PRICE") {
    const pmt = i === 0 ? PV / n : (PV * i) / (1 - Math.pow(1 + i, -n));
    primeira = pmt;
    ultima = pmt;
    totalPago = pmt * n;
  } else {
    const amort = PV / n;
    primeira = amort + PV * i;
    ultima = amort * (1 + i);
    // Juros totais SAC = i * PV * (n + 1) / 2
    totalPago = PV + (i * PV * (n + 1)) / 2;
  }

  return {
    banco,
    valorFinanciado: PV,
    primeiraParcela: primeira,
    ultimaParcela: ultima,
    totalPago,
    totalJuros: totalPago - PV,
  };
}
