import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { PropertyCard } from "@/components/PropertyCard";
import { getFacets } from "@/services/facets";
import { listProperties } from "@/services/properties";
import { getPosts } from "@/services/blog";
import { BlogSection } from "@/components/BlogSection";
import { EMPREENDIMENTOS } from "@/data/lancamentos";
import type { Facets, PropertyListResponse } from "@/types/property";
import type { Post } from "@/types/blog";

export const revalidate = 120;

const EMPTY_FACETS: Facets = {
  cidades: [],
  bairros: [],
  tipos: [],
  preco: { venda: { min: 0, max: 0 }, locacao: { min: 0, max: 0 } },
};

export default async function HomePage() {
  let facets = EMPTY_FACETS;
  let venda: PropertyListResponse["data"] = [];
  let locacao: PropertyListResponse["data"] = [];
  let posts: Post[] = [];
  try {
    const [f, v, l, b] = await Promise.all([
      getFacets(),
      listProperties({ finalidade: "venda", destaque: true, per_page: 8 }, 120),
      listProperties({ finalidade: "locacao", destaque: true, per_page: 4 }, 120),
      getPosts(3),
    ]);
    facets = f;
    venda = v.data;
    locacao = l.data;
    posts = b.posts;
    // Fallback: enquanto não houver destaques marcados na aba Site, mostra recentes
    if (!venda.length) venda = (await listProperties({ finalidade: "venda", per_page: 8, ordenar: "recentes" })).data;
    if (!locacao.length) locacao = (await listProperties({ finalidade: "locacao", per_page: 4, ordenar: "recentes" })).data;
  } catch {
    // API indisponível — a home ainda renderiza (degradação graciosa).
  }

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink text-white">
        {/* foto de São José (coloque em public/hero-saojose.jpg) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-saojose.jpg')" }}
          aria-hidden
        />
        {/* overlay escuro p/ legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/60 to-ink/85" aria-hidden />
        <div className="container relative flex min-h-[72vh] flex-col items-center justify-center py-20 text-center">
          <h1 className="max-w-3xl text-balance font-display text-4xl font-extrabold leading-tight sm:text-6xl">
            Encontre seu imóvel, <span className="text-brand-400">da planta às chaves</span>
          </h1>
          <p className="mt-5 max-w-xl text-balance text-white/70 sm:text-lg">
            Apartamentos, casas e lançamentos em São José, Florianópolis e região — direto da nossa base.
          </p>
          <div className="mt-9 flex w-full justify-center">
            <SearchBar facets={facets} />
          </div>
        </div>
      </section>

      {/* DESTAQUES — À VENDA */}
      <section className="container py-16">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Imóveis à venda em destaque</h2>
            <p className="mt-1 text-sm text-ink-muted">Selecionados pra você</p>
          </div>
          <Link href="/imoveis?finalidade=venda" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-600">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {venda.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {venda.map((im) => (
              <PropertyCard key={`v-${im.id}`} imovel={im} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-neutral-50 p-10 text-center text-ink-muted">
            Em breve, novos imóveis por aqui.
          </p>
        )}
      </section>

      {/* DESTAQUES — PARA ALUGAR */}
      {locacao.length > 0 && (
        <section className="bg-neutral-50 py-16">
          <div className="container">
            <div className="mb-7 flex items-end justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Para alugar em destaque</h2>
                <p className="mt-1 text-sm text-ink-muted">Opções de locação na região</p>
              </div>
              <Link href="/imoveis?finalidade=locacao" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-600">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {locacao.map((im) => (
                <PropertyCard key={`l-${im.id}`} imovel={im} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LANÇAMENTOS */}
      {EMPREENDIMENTOS.length > 0 && (
        <section className="container py-16">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Lançamentos</h2>
              <p className="mt-1 text-sm text-ink-muted">Empreendimentos que a NaPlanta representa</p>
            </div>
            <Link href="/lancamentos" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-600">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {EMPREENDIMENTOS.map((e) => (
              <Link
                key={e.slug}
                href="/lancamentos"
                className="group relative block overflow-hidden rounded-2xl shadow-card ring-1 ring-black/5"
              >
                <div className="relative aspect-[16/9]">
                  <Image
                    src={e.cover}
                    alt={e.nome}
                    fill
                    sizes="(max-width:768px) 100vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                    {e.status}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <h3 className="font-display text-2xl font-bold">{e.nome}</h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/80">
                      <MapPin className="h-4 w-4" /> {e.local}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-brand-200">{e.precoDe}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CIDADES */}
      {facets.cidades.length > 0 && (
        <section className="container pb-16">
          <h2 className="mb-7 font-display text-2xl font-bold text-ink sm:text-3xl">Onde você quer morar?</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {facets.cidades.slice(0, 8).map((c) => (
              <Link
                key={c.nome}
                href={`/imoveis?cidade=${encodeURIComponent(c.nome)}`}
                className="group flex items-center justify-between rounded-2xl border border-black/5 bg-white p-5 shadow-card transition hover:border-brand/30"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium text-ink">{c.nome}</p>
                    <p className="text-xs text-ink-muted">{c.total} imóveis</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-ink-muted transition group-hover:translate-x-1 group-hover:text-brand" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container pb-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-ink px-8 py-12 text-center text-white sm:flex-row sm:text-left">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Quer anunciar ou vender seu imóvel?</h2>
            <p className="mt-2 text-white/70">Fale com a NaPlanta e tenha atendimento de quem entende da região.</p>
          </div>
          <Link
            href="/contato"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-7 py-3 font-semibold text-white transition hover:bg-brand-600"
          >
            Falar com um corretor <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* BLOG — mercado imobiliário de SC */}
      <BlogSection posts={posts} />
    </>
  );
}
