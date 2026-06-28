import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Building2, Handshake, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre",
  description: "A NaPlanta Imobiliária — da planta às chaves. Atendimento próximo e especializado em São José, Florianópolis e região.",
};

const VALORES = [
  { icon: MapPin, t: "Especialistas na região", d: "Conhecemos cada bairro de São José e da Grande Florianópolis." },
  { icon: Handshake, t: "Atendimento próximo", d: "Da primeira visita à entrega das chaves, com um corretor ao seu lado." },
  { icon: ShieldCheck, t: "Segurança jurídica", d: "Documentação e contratos conduzidos por quem entende." },
  { icon: Building2, t: "Da planta às chaves", d: "Lançamentos, imóveis prontos, locação e venda — tudo em um lugar." },
];

export default function SobrePage() {
  return (
    <>
      <section className="border-b border-black/5 bg-neutral-50">
        <div className="container py-14">
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Sobre a NaPlanta</h1>
          <p className="mt-3 max-w-2xl text-ink-muted">
            Somos uma imobiliária focada em realizar o sonho do imóvel ideal — com atendimento humano,
            tecnologia e conhecimento de verdade da nossa região.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4 text-ink-soft leading-relaxed">
            <h2 className="font-display text-2xl font-bold text-ink">Quem somos</h2>
            <p>
              A <strong>NaPlanta.com Imobiliária</strong> nasceu para tornar a jornada de comprar, vender ou
              alugar um imóvel mais simples e transparente. Atuamos em São José, Florianópolis e toda a
              Grande Florianópolis, com um portfólio que vai de lançamentos a imóveis prontos.
            </p>
            <p>
              Nosso time acompanha cada etapa — da escolha do imóvel à assinatura do contrato — sempre com
              clareza nas informações e agilidade no atendimento.
            </p>
            <p className="text-sm text-ink-muted">CRECI 8123J</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {VALORES.map((v) => (
              <div key={v.t} className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-black/5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand">
                  <v.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-semibold text-ink">{v.t}</h3>
                <p className="mt-1 text-sm text-ink-muted">{v.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-3xl bg-ink px-8 py-10 text-center text-white sm:flex-row sm:text-left">
          <div>
            <h2 className="font-display text-2xl font-bold">Vamos encontrar seu imóvel?</h2>
            <p className="mt-1 text-white/70">Fale com a gente ou explore os imóveis disponíveis.</p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link href="/imoveis" className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-600">
              Ver imóveis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contato" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
              Falar conosco
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
