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

// ── Valor por extenso (PT-BR) ───────────────────────────────────────────────
function centenasExtenso(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";
  const u = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const d10 = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const dez = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const cem = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];
  const out: string[] = [];
  let r = n;
  if (r >= 100) { out.push(cem[Math.floor(r / 100)]); r %= 100; }
  if (r >= 20) { const un = r % 10; out.push(un ? dez[Math.floor(r / 10)] + " e " + u[un] : dez[Math.floor(r / 10)]); }
  else if (r >= 10) out.push(d10[r - 10]);
  else if (r >= 1) out.push(u[r]);
  return out.join(" e ");
}

function inteiroExtenso(n: number): string {
  if (n === 0) return "zero";
  const escalas: [number, string, string][] = [
    [1_000_000_000, "bilhão", "bilhões"],
    [1_000_000, "milhão", "milhões"],
    [1_000, "mil", "mil"],
  ];
  const partes: string[] = [];
  let resto = n;
  for (const [val, sing, plur] of escalas) {
    if (resto >= val) {
      const q = Math.floor(resto / val);
      resto %= val;
      if (val === 1000) partes.push(q === 1 ? "mil" : centenasExtenso(q) + " mil");
      else partes.push(centenasExtenso(q) + " " + (q === 1 ? sing : plur));
    }
  }
  if (resto > 0) partes.push(centenasExtenso(resto));
  if (partes.length <= 1) return partes[0] ?? "zero";
  const ultimo = partes.pop()!;
  return partes.join(", ") + " e " + ultimo;
}

/** Valor em reais por extenso. Ex.: 999000 → "novecentos e noventa e nove mil reais". */
export function extensoReais(value: number): string {
  const total = Math.round((value || 0) * 100);
  const inteiro = Math.floor(total / 100);
  const centavos = total % 100;
  const partes: string[] = [];
  if (inteiro > 0) partes.push(inteiroExtenso(inteiro) + (inteiro === 1 ? " real" : " reais"));
  if (centavos > 0) partes.push(inteiroExtenso(centavos) + (centavos === 1 ? " centavo" : " centavos"));
  return partes.length ? partes.join(" e ") : "zero real";
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
