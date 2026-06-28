"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import type { Facets } from "@/types/property";

export function SearchBar({ facets }: { facets: Facets }) {
  const router = useRouter();
  const [finalidade, setFinalidade] = useState<"venda" | "locacao">("venda");
  const [cidade, setCidade] = useState("");
  const [tipo, setTipo] = useState("");
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    // Só números → busca direta por código do imóvel
    if (/^\d+$/.test(term)) {
      router.push(`/imovel/${term}`);
      return;
    }
    const p = new URLSearchParams();
    p.set("finalidade", finalidade);
    if (cidade) p.set("cidade", cidade);
    if (tipo) p.set("tipo", tipo);
    if (term) p.set("q", term);
    router.push(`/imoveis?${p.toString()}`);
  }

  const tab = "px-5 py-2 text-sm font-medium rounded-full transition";

  return (
    <form onSubmit={submit} className="w-full max-w-3xl">
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setFinalidade("venda")}
          className={`${tab} ${finalidade === "venda" ? "bg-brand text-white" : "bg-white/15 text-white hover:bg-white/25"}`}
        >
          Comprar
        </button>
        <button
          type="button"
          onClick={() => setFinalidade("locacao")}
          className={`${tab} ${finalidade === "locacao" ? "bg-brand text-white" : "bg-white/15 text-white hover:bg-white/25"}`}
        >
          Alugar
        </button>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-card sm:flex-row">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Bairro, condomínio ou código do imóvel…"
          className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-muted"
        />
        <select
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          className="rounded-xl bg-neutral-50 px-4 py-3 text-sm text-ink outline-none"
        >
          <option value="">Cidade</option>
          {facets.cidades.map((c) => (
            <option key={c.nome} value={c.nome}>
              {c.nome}
            </option>
          ))}
        </select>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="rounded-xl bg-neutral-50 px-4 py-3 text-sm text-ink outline-none"
        >
          <option value="">Tipo</option>
          {facets.tipos.map((t) => (
            <option key={t.nome} value={t.nome}>
              {t.nome}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          <Search className="h-4 w-4" /> Buscar
        </button>
      </div>
    </form>
  );
}
