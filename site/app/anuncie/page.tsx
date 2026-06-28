import type { Metadata } from "next";
import { BadgeCheck, Camera, Megaphone, Handshake } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Anuncie seu imóvel",
  description: "Anuncie seu imóvel com a NaPlanta: divulgação nos portais, fotos profissionais e atendimento que vende.",
};

const VANTAGENS = [
  { icon: Megaphone, t: "Divulgação ampla", d: "Seu imóvel nos principais portais e nas nossas redes." },
  { icon: Camera, t: "Fotos que vendem", d: "Material profissional para destacar o imóvel." },
  { icon: Handshake, t: "Atendimento ativo", d: "Time de corretores cuidando de cada lead." },
  { icon: BadgeCheck, t: "Segurança", d: "Documentação e contratos conduzidos por especialistas." },
];

export default function AnunciePage() {
  return (
    <>
      <section className="border-b border-black/5 bg-neutral-50">
        <div className="container py-12">
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Anuncie seu imóvel</h1>
          <p className="mt-2 max-w-2xl text-ink-muted">
            Venda ou alugue mais rápido com quem entende da região. Deixe seus dados que a gente cuida do resto.
          </p>
        </div>
      </section>

      <section className="container grid gap-10 py-12 lg:grid-cols-2">
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            {VANTAGENS.map((v) => (
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

        <div>
          <h2 className="mb-4 font-display text-xl font-bold text-ink">Quero anunciar</h2>
          <LeadForm origem="Anuncie seu imóvel" mensagemPadrao="Quero anunciar meu imóvel. " />
        </div>
      </section>
    </>
  );
}
