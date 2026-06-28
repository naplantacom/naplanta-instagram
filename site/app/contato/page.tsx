import type { Metadata } from "next";
import { Phone, MessageCircle, Mail, MapPin, Instagram } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a NaPlanta Imobiliária. Atendimento por WhatsApp, telefone e e-mail em São José e região.",
};

export default function ContatoPage() {
  const wpp = process.env.NEXT_PUBLIC_WHATSAPP ?? "";
  return (
    <>
      <section className="border-b border-black/5 bg-neutral-50">
        <div className="container py-12">
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Fale conosco</h1>
          <p className="mt-2 max-w-2xl text-ink-muted">
            Deixe seus dados que um corretor da NaPlanta entra em contato — ou chame direto no WhatsApp.
          </p>
        </div>
      </section>

      <section className="container grid gap-10 py-12 lg:grid-cols-2">
        <LeadForm origem="Página de contato" />

        <div className="space-y-6">
          <h2 className="font-display text-xl font-bold text-ink">Canais de atendimento</h2>
          <ul className="space-y-4 text-ink-soft">
            {wpp && (
              <li>
                <a href={`https://wa.me/${wpp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-brand">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand"><MessageCircle className="h-5 w-5" /></span>
                  <span><span className="block text-sm text-ink-muted">WhatsApp</span>(48) 99153-1668</span>
                </a>
              </li>
            )}
            <li className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand"><Phone className="h-5 w-5" /></span>
              <span><span className="block text-sm text-ink-muted">Telefone</span>(48) 99153-1668</span>
            </li>
            <li>
              <a href="mailto:contato@naplanta.com" className="flex items-center gap-3 hover:text-brand">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand"><Mail className="h-5 w-5" /></span>
                <span><span className="block text-sm text-ink-muted">E-mail</span>contato@naplanta.com</span>
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand"><MapPin className="h-5 w-5" /></span>
              <span><span className="block text-sm text-ink-muted">Atendimento</span>São José e Grande Florianópolis · SC</span>
            </li>
            <li>
              <a href="https://instagram.com/naplanta" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-brand">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand"><Instagram className="h-5 w-5" /></span>
                <span><span className="block text-sm text-ink-muted">Instagram</span>@naplanta</span>
              </a>
            </li>
          </ul>
          <p className="text-sm text-ink-muted">CRECI 8123J</p>
        </div>
      </section>
    </>
  );
}
