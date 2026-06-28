"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const WPP_FALLBACK = "5548991531668";

const OPCOES = [
  {
    label: "Prontos e Locação",
    text: "Olá! Quero falar sobre imóveis prontos ou locação com a NaPlanta.",
  },
  {
    label: "Lançamentos",
    text: "Olá! Quero saber mais sobre os lançamentos da NaPlanta.",
  },
];

export function WhatsAppFab() {
  const wpp = process.env.NEXT_PUBLIC_WHATSAPP || WPP_FALLBACK;
  const [teaser, setTeaser] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!wpp) return;
    if (sessionStorage.getItem("waTeaserOff")) return;
    const horarios = [5000, 30000, 75000];
    const timers: ReturnType<typeof setTimeout>[] = [];
    horarios.forEach((t, idx) => {
      timers.push(
        setTimeout(() => {
          if (sessionStorage.getItem("waTeaserOff")) return;
          setTeaser(true);
          timers.push(setTimeout(() => setTeaser(false), 8000));
          if (idx === horarios.length - 1) sessionStorage.setItem("waTeaserOff", "1");
        }, t)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [wpp]);

  function dismissTeaser(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setTeaser(false);
    sessionStorage.setItem("waTeaserOff", "1");
  }

  function toggleMenu() {
    setTeaser(false);
    setMenuOpen((v) => !v);
  }

  function waLink(text: string) {
    return `https://wa.me/${wpp}?text=${encodeURIComponent(text)}`;
  }

  if (!wpp) return null;

  return (
    <>
      {/* teaser balão */}
      {teaser && !menuOpen && (
        <div className="fixed bottom-[92px] right-5 z-50 flex max-w-[260px] items-center gap-3 rounded-2xl bg-white p-3 pr-8 shadow-xl ring-1 ring-black/5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
            <Image src="/na-simbolo.png" alt="" width={26} height={24} className="object-contain" aria-hidden="true" />
          </span>
          <span className="text-sm leading-snug text-ink-soft">
            <span className="font-semibold text-ink">Olá! 👋</span> Posso te ajudar a achar o imóvel ideal?
          </span>
          <button
            type="button"
            onClick={dismissTeaser}
            aria-label="Fechar"
            className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-ink-muted hover:bg-neutral-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* menu de opções */}
      {menuOpen && (
        <>
          {/* overlay para fechar */}
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="fixed bottom-[92px] right-5 z-50 overflow-hidden rounded-2xl bg-[#1e6b46] shadow-2xl">
            {OPCOES.map((op) => (
              <a
                key={op.label}
                href={waLink(op.text)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-5 py-4 text-white transition hover:bg-white/10"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.138.564 4.139 1.546 5.874L.057 23.428a.75.75 0 0 0 .515.572.752.752 0 0 0 .658-.157l5.803-2.297A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75A9.734 9.734 0 0 1 6.29 19.94l-.413-.246-4.27 1.69 1.557-4.144-.27-.427A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                  </svg>
                </span>
                <span className="text-[15px] font-semibold">{op.label}</span>
              </a>
            ))}
          </div>
        </>
      )}

      {/* botão principal */}
      <button
        type="button"
        onClick={toggleMenu}
        aria-label="Falar com a NaPlanta no WhatsApp"
        className="wa-fab fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] transition hover:scale-105"
      >
        {menuOpen
          ? <X className="h-7 w-7 text-white" />
          : <Image src="/na-simbolo.png" alt="" width={40} height={37} className="object-contain" aria-hidden="true" />
        }
      </button>
    </>
  );
}
