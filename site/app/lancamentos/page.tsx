import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Building2, ArrowUpRight, MessageCircle } from "lucide-react";
import { EMPREENDIMENTOS as ESTATICOS, type Empreendimento } from "@/data/lancamentos";
import { listLancamentos, toEmpreendimento } from "@/services/lancamentos";

export const metadata: Metadata = {
  title: "Lançamentos",
  description:
    "Conheça os lançamentos e empreendimentos da NaPlanta em Florianópolis e região: Valence Residence, InHaus, Next Trindade e mais.",
};

/**
 * Fonte: API de lançamentos (curada no back office) + estáticos como fallback.
 * Lançamentos com landing própria (ex.: Valence) vêm da API; InHaus/Next Trindade
 * seguem nos estáticos enquanto não migram para a API. Dedup por slug.
 */
async function getEmpreendimentos(): Promise<Empreendimento[]> {
  try {
    const { data } = await listLancamentos();
    const daApi = data.map(toEmpreendimento);
    const slugs = new Set(daApi.map((e) => e.slug));
    return [...daApi, ...ESTATICOS.filter((e) => !slugs.has(e.slug))];
  } catch {
    return ESTATICOS;
  }
}

function Card({ e }: { e: Empreendimento }) {
  const wpp = process.env.NEXT_PUBLIC_WHATSAPP ?? "";
  const wppHref = wpp
    ? `https://wa.me/${wpp}?text=${encodeURIComponent(`Olá! Tenho interesse no empreendimento ${e.nome}.`)}`
    : "";

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5">
      <div className="relative aspect-[16/10] overflow-hidden bg-ink">
        <Image src={e.cover} alt={e.nome} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
          {e.status}
        </span>
      </div>

      <div className="p-6">
        <h2 className="font-display text-2xl font-bold text-ink">{e.nome}</h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
          <MapPin className="h-4 w-4" /> {e.local}
        </p>
        <p className="mt-3 text-sm text-ink-soft">{e.resumo}</p>

        <div className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
          <Building2 className="h-4 w-4" /> {e.tipologias}
        </div>
        <p className="mt-3 text-lg font-bold text-brand-700">{e.precoDe}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          {e.url && (
            <a
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand"
            >
              Ver empreendimento <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
          {wppHref && (
            <a
              href={wppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              <MessageCircle className="h-4 w-4" /> Tenho interesse
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function LancamentosPage() {
  const EMPREENDIMENTOS = await getEmpreendimentos();
  return (
    <>
      <section className="border-b border-black/5 bg-neutral-50">
        <div className="container py-12">
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Lançamentos</h1>
          <p className="mt-2 max-w-2xl text-ink-muted">
            Os empreendimentos que a NaPlanta representa em Florianópolis e região — da planta às chaves.
          </p>
        </div>
      </section>

      <section className="container py-10">
        {EMPREENDIMENTOS.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {EMPREENDIMENTOS.map((e) => (
              <Card key={e.slug} e={e} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-neutral-50 p-10 text-center text-ink-muted">
            Em breve, novos lançamentos por aqui.
          </p>
        )}
      </section>
    </>
  );
}
