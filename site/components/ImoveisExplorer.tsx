"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, SearchX } from "lucide-react";
import { PropertyCard } from "./PropertyCard";
import { listProperties } from "@/services/properties";
import type { Facets, PropertyCard as Card, PropertyFilters } from "@/types/property";

const PER_PAGE = 12;

export function ImoveisExplorer({ facets, initial }: { facets: Facets; initial: PropertyFilters }) {
  const [filters, setFilters] = useState<PropertyFilters>(initial);
  const [items, setItems] = useState<Card[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const sentinel = useRef<HTMLDivElement>(null);

  // (Re)carrega a primeira página quando os filtros mudam
  useEffect(() => {
    let active = true;
    setLoading(true);
    listProperties({ ...filters, page: 1, per_page: PER_PAGE })
      .then((r) => {
        if (!active) return;
        setItems(r.data);
        setPage(1);
        setTotalPages(r.total_pages);
        setTotal(r.total);
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
        setTotal(0);
        setTotalPages(1);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [filters]);

  const loadMore = useCallback(() => {
    if (loading || page >= totalPages) return;
    setLoading(true);
    const next = page + 1;
    listProperties({ ...filters, page: next, per_page: PER_PAGE })
      .then((r) => {
        setItems((prev) => [...prev, ...r.data]);
        setPage(next);
      })
      .finally(() => setLoading(false));
  }, [loading, page, totalPages, filters]);

  // Scroll infinito
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && loadMore(), { rootMargin: "500px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  const set = (patch: Partial<PropertyFilters>) => setFilters((f) => ({ ...f, ...patch }));
  const tab = (v: PropertyFilters["finalidade"], label: string) => (
    <button
      type="button"
      onClick={() => set({ finalidade: v })}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        filters.finalidade === v ? "bg-brand text-white" : "bg-neutral-100 text-ink-soft hover:bg-neutral-200"
      }`}
    >
      {label}
    </button>
  );
  const selCls = "rounded-xl border-0 bg-neutral-100 px-3 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30";

  return (
    <div>
      {/* FILTROS */}
      <div className="sticky top-[73px] z-30 -mx-5 mb-8 border-b border-black/5 bg-white/95 px-5 py-4 backdrop-blur">
        <div className="mb-3 flex gap-2">
          {tab(undefined, "Tudo")}
          {tab("venda", "Comprar")}
          {tab("locacao", "Alugar")}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            defaultValue={filters.q ?? ""}
            onChange={(e) => set({ q: e.target.value || undefined })}
            placeholder="Bairro, condomínio, características…"
            className="min-w-[180px] flex-1 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
          />
          <select className={selCls} value={filters.cidade ?? ""} onChange={(e) => set({ cidade: e.target.value || undefined })}>
            <option value="">Cidade</option>
            {facets.cidades.map((c) => (
              <option key={c.nome} value={c.nome}>{c.nome} ({c.total})</option>
            ))}
          </select>
          <select className={selCls} value={filters.tipo ?? ""} onChange={(e) => set({ tipo: e.target.value || undefined })}>
            <option value="">Tipo</option>
            {facets.tipos.map((t) => (
              <option key={t.nome} value={t.nome}>{t.nome}</option>
            ))}
          </select>
          <select className={selCls} value={filters.quartos_min ?? ""} onChange={(e) => set({ quartos_min: e.target.value ? Number(e.target.value) : undefined })}>
            <option value="">Quartos</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
          <select className={selCls} value={filters.ordenar ?? "recentes"} onChange={(e) => set({ ordenar: e.target.value as PropertyFilters["ordenar"] })}>
            <option value="recentes">Mais recentes</option>
            <option value="preco_asc">Menor preço</option>
            <option value="preco_desc">Maior preço</option>
            <option value="area_desc">Maior área</option>
          </select>
        </div>
      </div>

      {/* CONTAGEM */}
      <p className="mb-5 text-sm text-ink-muted">
        {loading && items.length === 0 ? "Buscando…" : `${total} ${total === 1 ? "imóvel encontrado" : "imóveis encontrados"}`}
      </p>

      {/* RESULTADOS */}
      {items.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((im) => (
            <PropertyCard key={`${im.id}-${im.transacao}`} imovel={im} />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-neutral-50 py-20 text-center text-ink-muted">
            <SearchX className="h-8 w-8" />
            <p>Nenhum imóvel encontrado com esses filtros.</p>
          </div>
        )
      )}

      {/* Loader / sentinela do scroll infinito */}
      <div ref={sentinel} className="flex justify-center py-10">
        {loading && items.length > 0 && <Loader2 className="h-6 w-6 animate-spin text-brand" />}
      </div>
    </div>
  );
}
