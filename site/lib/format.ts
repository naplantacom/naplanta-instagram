/** Formatação BR — moeda, área e slug. */

export function formatBRL(value: number): string {
  if (!value || value <= 0) return "Sob consulta";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Preço de card conforme a transação. */
export function priceLabel(p: { transacao: string; preco_venda: number; preco_locacao: number }): string {
  if (p.transacao === "locacao") {
    const v = p.preco_locacao || p.preco_venda;
    return v > 0 ? `${formatBRL(v)}/mês` : "Sob consulta";
  }
  return formatBRL(p.preco_venda || p.preco_locacao);
}

export function area(value: number): string {
  if (!value || value <= 0) return "";
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} m²`;
}

/** snake_case → "Sentença legível" (com acentos comuns restaurados). */
export function humanize(key: unknown): string {
  if (typeof key !== "string" || !key) return "";
  const acc: Record<string, string> = {
    area: "área", servico: "serviço", manha: "manhã", agua: "água",
    eletrico: "elétrico", proximo: "próximo", garagem: "garagem", privativa: "privativa",
  };
  const s = (key || "")
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => acc[w] ?? w)
    .join(" ")
    .trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function slugify(text: string): string {
  return (text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
