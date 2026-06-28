import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BedDouble, Bath, Car, Maximize, Building2, Layers, ArrowUpRight,
  MessageCircle, CalendarCheck, MapPin, Check, Calculator, FileSignature,
} from "lucide-react";
import { Gallery } from "@/components/Gallery";
import { PropertyCard } from "@/components/PropertyCard";
import { getProperty } from "@/services/properties";
import { formatBRL, priceLabel, area, humanize } from "@/lib/format";
import type { PropertyDetail } from "@/types/property";

export const revalidate = 60;

async function load(id: string) {
  try {
    return await getProperty(id, 60);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const r = await load(id);
  if (!r) return { title: "Imóvel não encontrado" };
  const i = r.data;
  const local = [i.bairro, i.cidade].filter(Boolean).join(", ");
  return {
    title: `${i.titulo}`,
    description: (i.descricao || `${i.tipo} em ${local}. ${priceLabel(i)}.`).slice(0, 160),
    openGraph: { images: i.capa ? [i.capa] : [], title: i.titulo, type: "website" },
  };
}

function Spec({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-neutral-50 px-2 py-3 text-center">
      <span className="text-ink-muted">{icon}</span>
      <span className="mt-1 text-sm font-semibold text-ink">{value}</span>
      <span className="text-xs text-ink-muted">{label}</span>
    </div>
  );
}

export default async function ImovelPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id } = await params;
  const r = await load(id);
  if (!r) notFound();
  const i: PropertyDetail = r.data;

  const wpp = process.env.NEXT_PUBLIC_WHATSAPP ?? "";
  const local = [i.bairro, i.cidade, i.estado].filter(Boolean).join(", ");
  const msg = (txt: string) => (wpp ? `https://wa.me/${wpp}?text=${encodeURIComponent(txt)}` : "#");
  const precoBase = i.preco_venda || i.preco_locacao;
  const isLoc = i.transacao === "locacao";
  const valorPrincipal = isLoc ? i.preco_locacao || i.preco_venda : i.preco_venda || i.preco_locacao;
  const temDesconto = !!i.preco_promocional && i.preco_promocional > 0;
  const badgeDesconto = temDesconto
    ? i.desconto_tipo === "percentual"
      ? `${i.desconto_valor}% OFF`
      : `- ${formatBRL(i.desconto_valor ?? 0)}`
    : null;
  const totalLoc = valorPrincipal + (i.condominio || 0) + (i.iptu || 0) + (i.iptu_vaga || 0) + (i.taxa_lixo || 0) + (i.seguro || 0);
  const sufMes = isLoc ? "/mês" : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: i.titulo,
    image: i.fotos?.slice(0, 5) ?? [],
    description: i.descricao || `${i.tipo} em ${local}`,
    category: i.tipo,
    offers: {
      "@type": "Offer",
      price: precoBase || undefined,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <article className="container py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-ink-muted">
        <Link href="/" className="hover:text-brand">Início</Link><span>/</span>
        <Link href="/imoveis" className="hover:text-brand">Imóveis</Link><span>/</span>
        <span className="text-ink-soft">{i.titulo}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* COLUNA PRINCIPAL */}
        <div className="min-w-0 lg:col-span-2">
          <Gallery fotos={i.fotos ?? []} titulo={i.titulo} badge={badgeDesconto ?? undefined} />

          <h1 className="mt-6 font-display text-2xl font-bold text-ink sm:text-3xl">{i.titulo}</h1>
          {local && (
            <p className="mt-1 flex items-center gap-1.5 text-ink-muted">
              <MapPin className="h-4 w-4" /> {local}
            </p>
          )}

          {/* specs */}
          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {i.quartos > 0 && <Spec icon={<BedDouble className="h-5 w-5" />} value={i.quartos} label="Quartos" />}
            {i.suites > 0 && <Spec icon={<BedDouble className="h-5 w-5" />} value={i.suites} label="Suítes" />}
            {i.banheiros > 0 && <Spec icon={<Bath className="h-5 w-5" />} value={i.banheiros} label="Banheiros" />}
            {i.vagas > 0 && <Spec icon={<Car className="h-5 w-5" />} value={i.vagas} label="Vagas" />}
            {i.area_interna > 0 && <Spec icon={<Maximize className="h-5 w-5" />} value={area(i.area_interna)} label="Área" />}
            {i.andar && <Spec icon={<Layers className="h-5 w-5" />} value={i.andar} label="Andar" />}
          </div>

          {/* descrição */}
          {i.descricao && (
            <section className="mt-8">
              <h2 className="mb-2 font-display text-xl font-bold text-ink">Sobre o imóvel</h2>
              <p className="whitespace-pre-line leading-relaxed text-ink-soft">{i.descricao}</p>
            </section>
          )}

          {/* características */}
          {i.caracteristicas?.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 font-display text-xl font-bold text-ink">Características</h2>
              <div className="flex flex-wrap gap-2">
                {i.caracteristicas.map((c, idx) => (
                  <span key={`${c}-${idx}`} className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-ink-soft">
                    <Check className="h-3.5 w-3.5 text-brand" /> {humanize(c)}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* tour virtual — só quando houver link */}
          {i.tour_url && (
            <section className="mt-8">
              <h2 className="mb-3 font-display text-xl font-bold text-ink">Tour virtual</h2>
              <iframe
                title="Tour virtual"
                className="aspect-video w-full rounded-2xl border border-black/5"
                loading="lazy"
                allowFullScreen
                src={i.tour_url}
              />
            </section>
          )}

          {/* mapa */}
          {i.lat && i.lng && (
            <section className="mt-8">
              <h2 className="mb-3 font-display text-xl font-bold text-ink">Localização</h2>
              <iframe
                title="Mapa"
                className="h-80 w-full rounded-2xl border border-black/5"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${i.lat},${i.lng}&z=16&output=embed`}
              />
            </section>
          )}
        </div>

        {/* COLUNA LATERAL (sticky) */}
        <aside className="min-w-0 lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5">
              <div className="flex items-center justify-between border-b border-black/5 px-5 py-3">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  {isLoc ? "Para alugar" : "À venda"} · {i.tipo}
                </span>
                <span className="text-xs font-semibold text-brand">Cód. {i.id}</span>
              </div>

              {/* Resumo de despesas */}
              <div className="px-5 py-4">
<div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wide text-brand">Valor</span>
                  {temDesconto ? (
                    <div className="text-right">
                      <span className="block text-sm text-ink-muted line-through">{formatBRL(valorPrincipal)}{sufMes}</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatBRL(i.preco_promocional!)}
                        {sufMes && <span className="text-base font-medium text-green-500">{sufMes}</span>}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-ink">
                      {formatBRL(valorPrincipal)}
                      {sufMes && <span className="text-base font-medium text-ink-muted">{sufMes}</span>}
                    </span>
                  )}
                </div>
                {i.condominio > 0 && (
                  <div className="mt-2 flex justify-between text-sm text-ink-muted">
                    <span>Condomínio</span><span>{formatBRL(i.condominio)}</span>
                  </div>
                )}
                {i.iptu > 0 && (
                  <div className="mt-1 flex justify-between text-sm text-ink-muted">
                    <span>IPTU{i.iptu_parcelas > 1 ? ` (${i.iptu_parcelas}x)` : ""}</span><span>{formatBRL(i.iptu)}</span>
                  </div>
                )}
                {i.iptu_vaga > 0 && (
                  <div className="mt-1 flex justify-between text-sm text-ink-muted">
                    <span>IPTU vaga{i.iptu_vaga_parcelas > 1 ? ` (${i.iptu_vaga_parcelas}x)` : ""}</span><span>{formatBRL(i.iptu_vaga)}</span>
                  </div>
                )}
                {isLoc && i.taxa_lixo > 0 && (
                  <div className="mt-1 flex justify-between text-sm text-ink-muted">
                    <span>Taxa de lixo{i.taxa_lixo_parcelas > 1 ? ` (${i.taxa_lixo_parcelas}x)` : ""}</span><span>{formatBRL(i.taxa_lixo)}</span>
                  </div>
                )}
                {isLoc && i.seguro > 0 && (
                  <div className="mt-1 flex justify-between text-sm text-ink-muted">
                    <span>Seguro incêndio{i.seguro_parcelas > 1 ? ` (${i.seguro_parcelas}x)` : ""}</span><span>{formatBRL(i.seguro)}</span>
                  </div>
                )}
                {isLoc && (i.condominio > 0 || i.iptu > 0 || i.iptu_vaga > 0 || i.taxa_lixo > 0 || i.seguro > 0) && (
                  <div className="mt-2.5 flex items-center justify-between border-t border-black/5 pt-2.5">
                    <span className="text-sm font-semibold text-ink">Total</span>
                    <span className="text-lg font-bold text-ink">
                      {formatBRL(totalLoc)}
                      <span className="text-sm font-medium text-ink-muted">{sufMes}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="space-y-2 px-5 pb-5">
                <a href={msg(`Olá! Tenho interesse no imóvel "${i.titulo}" (cód. ${i.id}).`)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">
                  <MessageCircle className="h-4 w-4" /> Tenho interesse
                </a>
                <a href={msg(`Olá! Gostaria de agendar uma visita ao imóvel "${i.titulo}" (cód. ${i.id}).`)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-neutral-50">
                  <CalendarCheck className="h-4 w-4" /> Agendar visita
                </a>
                <a href={msg(`Olá! Gostaria de fazer uma proposta para o imóvel "${i.titulo}" (cód. ${i.id}).`)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-neutral-50">
                  <FileSignature className="h-4 w-4" /> Fazer proposta
                </a>
                {i.transacao === "venda" && precoBase > 0 && (
                  <Link href={`/financiamento?valor=${precoBase}`}
                    className="flex items-center justify-center gap-2 rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-neutral-50">
                    <Calculator className="h-4 w-4" /> Simular financiamento
                  </Link>
                )}
              </div>
            </div>

            {i.video_url && (
              <a href={i.video_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-white p-4 text-sm font-medium text-ink-soft shadow-card ring-1 ring-black/5 transition hover:text-brand">
                <ArrowUpRight className="h-4 w-4" /> Ver vídeo do imóvel
              </a>
            )}
          </div>
        </aside>
      </div>

      {/* SIMILARES */}
      {r.similares?.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold text-ink">
            <Building2 className="h-6 w-6 text-brand" /> Imóveis semelhantes
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {r.similares.map((s) => (
              <PropertyCard key={`${s.id}-${s.transacao}`} imovel={s} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
