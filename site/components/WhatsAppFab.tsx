"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const WPP_FALLBACK = "5548991531668";

const OPCOES = [
  {
    label: "Locação",
    text: "Olá! Quero falar sobre imóveis para alugar com a NaPlanta.",
  },
  {
    label: "Vendas",
    text: "Olá! Quero falar sobre imóveis à venda com a NaPlanta.",
  },
];

// ⚽ modoCopa (vem do módulo Portais → Extras): quando ligado, o botão vira bola
// e comemora um gol a cada 10s. Desligado = botão normal (verde, arrastável).
export function WhatsAppFab({ modoCopa = false }: { modoCopa?: boolean }) {
  const wpp = process.env.NEXT_PUBLIC_WHATSAPP || WPP_FALLBACK;
  const [teaser, setTeaser] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [dy, setDy] = useState(0);

  const menuOpenRef = useRef(false);
  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  // teaser balão (mantido)
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

  // ⚽ Comemoração de gol a cada 10s (pausa enquanto o menu estiver aberto)
  useEffect(() => {
    if (!modoCopa) return;
    const iv = setInterval(() => {
      if (menuOpenRef.current) return;
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 1600);
    }, 10000);
    return () => clearInterval(iv);
  }, [modoCopa]);

  // Arrastar o botão na vertical (para cima / para baixo)
  const drag = useRef({ active: false, startY: 0, startDy: 0, moved: false });
  function onPointerDown(e: React.PointerEvent) {
    drag.current = { active: true, startY: e.clientY, startDy: dy, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current.active) return;
    const delta = e.clientY - drag.current.startY;
    if (Math.abs(delta) > 4) drag.current.moved = true;
    const maxUp = -(window.innerHeight - 140); // não sobe além do topo
    const next = Math.max(maxUp, Math.min(0, drag.current.startDy + delta));
    setDy(next);
  }
  function onPointerUp() {
    drag.current.active = false;
  }

  function dismissTeaser(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setTeaser(false);
    sessionStorage.setItem("waTeaserOff", "1");
  }

  function handleClick() {
    // Se foi arraste, não abre o menu.
    if (drag.current.moved) {
      drag.current.moved = false;
      return;
    }
    setTeaser(false);
    setMenuOpen((v) => !v);
  }

  function waLink(text: string) {
    return `https://wa.me/${wpp}?text=${encodeURIComponent(text)}`;
  }

  if (!wpp) return null;

  const follow = { transform: `translateY(${dy}px)` };
  const modoBola = modoCopa && celebrating && !menuOpen;

  return (
    <>
      {/* GOOOL! */}
      {modoBola && (
        <div className="pointer-events-none fixed bottom-[96px] right-3 z-50" style={follow}>
          <div
            className="gol-pop select-none rounded-full px-4 py-2 text-lg font-extrabold text-white shadow-xl"
            style={{ background: "linear-gradient(135deg,#009C3B 0%,#FEDF00 100%)", textShadow: "0 1px 3px rgba(0,0,0,.35)" }}
          >
            ⚽ GOOOL!
          </div>
        </div>
      )}

      {/* teaser balão */}
      {teaser && !menuOpen && !modoBola && (
        <div
          className="fixed bottom-[92px] right-5 z-50 flex max-w-[260px] items-center gap-3 rounded-2xl bg-white p-3 pr-8 shadow-xl ring-1 ring-black/5"
          style={follow}
        >
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
          <div className="fixed bottom-[92px] right-5 z-50 overflow-hidden rounded-2xl bg-[#1e6b46] shadow-2xl" style={follow}>
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

      {/* botão principal (arrastável) */}
      <div className="fixed bottom-5 right-5 z-50" style={follow}>
        <button
          type="button"
          onClick={handleClick}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          aria-label="Falar com a NaPlanta no WhatsApp (arraste para reposicionar)"
          style={{ touchAction: "none" }}
          className={`wa-fab relative flex h-16 w-16 cursor-grab items-center justify-center rounded-full transition hover:scale-105 active:cursor-grabbing ${
            modoBola ? "bg-white" : "bg-[#25D366]"
          }`}
        >
          <span className={modoBola ? "wa-kick flex items-center justify-center" : "flex items-center justify-center"}>
            {modoBola ? (
              <span className="wa-ball select-none text-5xl leading-none">⚽</span>
            ) : menuOpen ? (
              <X className="h-7 w-7 text-white" />
            ) : (
              <Image src="/na-simbolo.png" alt="" width={40} height={37} className="object-contain" aria-hidden="true" />
            )}
          </span>
        </button>
      </div>
    </>
  );
}
