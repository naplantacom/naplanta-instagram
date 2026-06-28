import Image from "next/image";
import Link from "next/link";
import { Instagram, Facebook, Phone, MessageCircle } from "lucide-react";

const SOBRE = [
  { label: "Quem Somos", href: "/sobre" },
  { label: "Fale Conosco", href: "/contato" },
  { label: "Política de Privacidade", href: "/politica-privacidade" },
];

const LINKS = [
  { label: "Imóveis para comprar", href: "/imoveis?finalidade=venda" },
  { label: "Imóveis para alugar", href: "/imoveis?finalidade=locacao" },
  { label: "Anuncie seu imóvel", href: "/anuncie" },
  { label: "Área do cliente", href: "https://www.portalunsoft.com.br/area-do-cliente/naplanta", external: true },
  { label: "Documentos", href: "/documentos" },
  { label: "Ouvidoria", href: "/ouvidoria" },
  { label: "Trabalhe conosco", href: "/trabalhe-conosco" },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="container grid gap-10 py-16 md:grid-cols-3">
        {/* Marca + institucional */}
        <div>
          <Image src="/logo-naplanta-white.png" alt="NaPlanta Imobiliária" width={180} height={48} />
          <ul className="mt-6 space-y-3 text-sm text-white/70">
            {SOBRE.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="transition hover:text-white">
                  {s.label}
                </Link>
              </li>
            ))}
            <li className="pt-1 text-white/50">CRECI: 8123J</li>
          </ul>
        </div>

        {/* Links */}
        <div>
          <h4 className="mb-5 text-xs font-semibold uppercase tracking-widest text-white/50">Links</h4>
          <ul className="space-y-3 text-sm text-white/70">
            {LINKS.map((l) => (
              <li key={l.href}>
                {l.external ? (
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                    {l.label}
                  </a>
                ) : (
                  <Link href={l.href} className="transition hover:text-white">
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Contato */}
        <div>
          <h4 className="mb-5 text-xs font-semibold uppercase tracking-widest text-white/50">Contato</h4>
          <a href="mailto:contato@naplanta.com" className="text-sm text-white/70 transition hover:text-white">
            contato@naplanta.com
          </a>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> (48) 99153-1668
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> (48) 99153-1668
            </li>
          </ul>

          <h4 className="mb-3 mt-7 text-xs font-semibold uppercase tracking-widest text-white/50">
            Redes Sociais
          </h4>
          <div className="flex gap-3">
            <a
              href="https://instagram.com/naplanta"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-brand"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://facebook.com/naplanta"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-brand"
            >
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/40 sm:flex-row">
          <span>© {new Date().getFullYear()} NaPlanta.com Imobiliária Ltda · CRECI 8123J</span>
          <span>Desenvolvido por FELIPACk&reg;</span>
        </div>
      </div>
    </footer>
  );
}
