import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Ouvidoria",
  description: "Canal de ouvidoria da NaPlanta Imobiliária — sugestões, elogios e reclamações.",
};

export default function OuvidoriaPage() {
  return (
    <>
      <section className="border-b border-black/5 bg-neutral-50">
        <div className="container py-12">
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Ouvidoria</h1>
          <p className="mt-2 max-w-2xl text-ink-muted">
            Sua opinião importa. Envie sugestões, elogios ou reclamações — vamos analisar e retornar.
          </p>
        </div>
      </section>
      <section className="container py-12">
        <div className="mx-auto max-w-xl">
          <LeadForm origem="Ouvidoria" mensagemPadrao="" />
        </div>
      </section>
    </>
  );
}
