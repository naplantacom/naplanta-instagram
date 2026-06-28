import type { Metadata } from "next";
import Link from "next/link";
import { FileText, UserRound, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Documentos",
  description: "Documentos e segunda via de boletos, contratos e comprovantes da NaPlanta Imobiliária.",
};

const AREA_CLIENTE = "https://www.portalunsoft.com.br/area-do-cliente/naplanta";

export default function DocumentosPage() {
  const wpp = process.env.NEXT_PUBLIC_WHATSAPP ?? "";
  return (
    <>
      <section className="border-b border-black/5 bg-neutral-50">
        <div className="container py-12">
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Documentos</h1>
          <p className="mt-2 max-w-2xl text-ink-muted">
            Boletos, contratos, comprovantes e segunda via ficam na Área do Cliente. Precisa de ajuda? Fale com a gente.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <a href={AREA_CLIENTE} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-black/5 transition hover:-translate-y-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand"><UserRound className="h-5 w-5" /></span>
            <h2 className="mt-3 font-semibold text-ink">Área do Cliente</h2>
            <p className="mt-1 text-sm text-ink-muted">Boletos, 2ª via e seus contratos.</p>
          </a>
          <Link href="/contato" className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-black/5 transition hover:-translate-y-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand"><FileText className="h-5 w-5" /></span>
            <h2 className="mt-3 font-semibold text-ink">Solicitar documento</h2>
            <p className="mt-1 text-sm text-ink-muted">Peça um documento específico pela equipe.</p>
          </Link>
          {wpp && (
            <a href={`https://wa.me/${wpp}`} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-black/5 transition hover:-translate-y-1">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand"><MessageCircle className="h-5 w-5" /></span>
              <h2 className="mt-3 font-semibold text-ink">WhatsApp</h2>
              <p className="mt-1 text-sm text-ink-muted">Atendimento rápido para documentos.</p>
            </a>
          )}
        </div>
      </section>
    </>
  );
}
