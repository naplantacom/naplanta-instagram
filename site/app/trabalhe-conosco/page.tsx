import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Trabalhe conosco",
  description: "Faça parte do time da NaPlanta Imobiliária. Envie seu contato.",
};

export default function TrabalheConoscoPage() {
  return (
    <>
      <section className="border-b border-black/5 bg-neutral-50">
        <div className="container py-12">
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Trabalhe conosco</h1>
          <p className="mt-2 max-w-2xl text-ink-muted">
            Quer ser corretor(a) ou fazer parte da equipe NaPlanta? Deixe seus dados e uma mensagem — a gente entra em contato.
          </p>
        </div>
      </section>
      <section className="container py-12">
        <div className="mx-auto max-w-xl">
          <LeadForm origem="Trabalhe conosco" mensagemPadrao="Tenho interesse em trabalhar na NaPlanta. " />
        </div>
      </section>
    </>
  );
}
