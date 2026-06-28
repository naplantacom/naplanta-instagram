"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, UserRound } from "lucide-react";
import { LogoNaPlanta } from "./LogoNaPlanta";

const AREA_CLIENTE = "https://www.portalunsoft.com.br/area-do-cliente/naplanta";

const NAV = [
  { label: "Comprar", href: "/imoveis?finalidade=venda" },
  { label: "Alugar", href: "/imoveis?finalidade=locacao" },
  { label: "Lançamentos", href: "/lancamentos" },
  { label: "Financiamento", href: "/financiamento" },
  { label: "Sobre", href: "/sobre" },
  { label: "Anuncie seu imóvel", href: "/anuncie" },
  { label: "Contato", href: "/contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white">
      {/* faixa vermelha da marca */}
      <div className="h-1 w-full bg-brand" />

      <div className="container flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-center" onClick={() => setOpen(false)} aria-label="NaPlanta — início">
          <LogoNaPlanta />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[13px] font-semibold uppercase tracking-wide text-ink-soft transition hover:text-brand"
            >
              {n.label}
            </Link>
          ))}
          <a
            href={AREA_CLIENTE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-semibold uppercase tracking-wide text-white transition hover:bg-brand"
          >
            <UserRound className="h-4 w-4" /> Área do cliente
          </a>
        </nav>

        <button
          type="button"
          aria-label="Abrir menu"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* menu mobile */}
      {open && (
        <nav className="border-t border-black/5 bg-white lg:hidden">
          <div className="container flex flex-col py-2">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="border-b border-black/5 py-3 text-sm font-semibold uppercase tracking-wide text-ink-soft"
              >
                {n.label}
              </Link>
            ))}
            <a
              href={AREA_CLIENTE}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white"
            >
              <UserRound className="h-4 w-4" /> Área do cliente
            </a>
          </div>
        </nav>
      )}

      <div className="h-px w-full bg-black/5" />
    </header>
  );
}
