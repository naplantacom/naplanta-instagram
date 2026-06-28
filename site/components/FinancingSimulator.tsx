"use client";

import { useMemo, useState } from "react";
import { Landmark, TrendingDown, MessageCircle } from "lucide-react";
import type { Banco } from "@/types/financing";
import { simular } from "@/lib/financing";
import { formatBRL } from "@/lib/format";

export function FinancingSimulator({
  bancos,
  valorInicial = 500000,
}: {
  bancos: Banco[];
  valorInicial?: number;
}) {
  const [valor, setValor] = useState(valorInicial);
  const [entradaPct, setEntradaPct] = useState(20);
  const [prazoAnos, setPrazoAnos] = useState(30);

  const entrada = Math.round((valor * entradaPct) / 100);
  const prazoMeses = prazoAnos * 12;

  const simulacoes = useMemo(() => {
    return bancos
      .map((b) => simular(valor, entrada, Math.min(prazoMeses, b.prazo_max_meses), b))
      .sort((a, b) => a.primeiraParcela - b.primeiraParcela);
  }, [bancos, valor, entrada, prazoMeses]);

  const melhor = simulacoes[0]?.banco.id;
  const wpp = process.env.NEXT_PUBLIC_WHATSAPP ?? "";

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      {/* CONTROLES */}
      <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-black/5">
        <label className="mb-1 block text-sm font-medium text-ink">Valor do imóvel</label>
        <div className="mb-5 flex items-center rounded-xl bg-neutral-50 px-3">
          <span className="text-ink-muted">R$</span>
          <input
            type="number"
            min={50000}
            step={10000}
            value={valor}
            onChange={(e) => setValor(Math.max(0, Number(e.target.value)))}
            className="w-full bg-transparent px-2 py-3 text-lg font-semibold text-ink outline-none"
          />
        </div>

        <div className="mb-5">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-ink">Entrada</span>
            <span className="text-ink-muted">
              {formatBRL(entrada)} · {entradaPct}%
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={90}
            step={1}
            value={entradaPct}
            onChange={(e) => setEntradaPct(Number(e.target.value))}
            className="w-full accent-brand"
          />
        </div>

        <div className="mb-2">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-ink">Prazo</span>
            <span className="text-ink-muted">{prazoAnos} anos ({prazoMeses}x)</span>
          </div>
          <input
            type="range"
            min={5}
            max={35}
            step={1}
            value={prazoAnos}
            onChange={(e) => setPrazoAnos(Number(e.target.value))}
            className="w-full accent-brand"
          />
        </div>

        <div className="mt-5 rounded-xl bg-brand-50 p-4 text-sm">
          <p className="text-ink-muted">Valor financiado</p>
          <p className="text-xl font-bold text-brand-700">{formatBRL(valor - entrada)}</p>
        </div>
      </div>

      {/* RESULTADOS */}
      <div>
        <div className="grid gap-4 sm:grid-cols-2">
          {simulacoes.map((s) => {
            const isMelhor = s.banco.id === melhor;
            return (
              <div
                key={s.banco.id}
                className={`relative rounded-2xl bg-white p-5 shadow-card ring-1 transition ${
                  isMelhor ? "ring-2 ring-brand" : "ring-black/5"
                }`}
              >
                {isMelhor && (
                  <span className="absolute -top-2.5 left-5 rounded-full bg-brand px-3 py-0.5 text-xs font-semibold text-white">
                    Menor 1ª parcela
                  </span>
                )}
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-ink">
                    <Landmark className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{s.banco.nome}</p>
                    <p className="text-xs text-ink-muted">
                      {s.banco.taxa_aa}% a.a. · {s.banco.sistema}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-ink-muted">
                  {s.banco.sistema === "SAC" ? "1ª parcela (decrescente)" : "Parcela fixa"}
                </p>
                <p className="text-2xl font-bold text-ink">{formatBRL(s.primeiraParcela)}</p>
                {s.banco.sistema === "SAC" && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                    <TrendingDown className="h-3.5 w-3.5" /> última {formatBRL(s.ultimaParcela)}
                  </p>
                )}

                <div className="mt-3 border-t border-neutral-100 pt-3 text-sm text-ink-muted">
                  <div className="flex justify-between">
                    <span>Total de juros</span>
                    <span>{formatBRL(s.totalJuros)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total pago</span>
                    <span>{formatBRL(s.totalPago)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {wpp && (
          <a
            href={`https://wa.me/${wpp}?text=${encodeURIComponent(
              `Olá! Simulei um financiamento de ${formatBRL(valor)} (entrada ${formatBRL(
                entrada
              )}, ${prazoAnos} anos) e gostaria de ajuda.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            <MessageCircle className="h-4 w-4" /> Falar com um corretor sobre o financiamento
          </a>
        )}

        <p className="mt-4 text-xs leading-relaxed text-ink-muted">
          Simulação aproximada para fins informativos. As condições reais (taxas, sistema de
          amortização, seguros, TR e prazo) dependem de análise de crédito e da política de cada
          banco. Não constitui oferta de crédito.
        </p>
      </div>
    </div>
  );
}
