"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

// Fallback fixo: garante que o botão nunca some, mesmo sem env var no deploy.
const WPP_FALLBACK = "5548991531668";

export function WhatsAppFab() {
  const wpp = process.env.NEXT_PUBLIC_WHATSAPP || WPP_FALLBACK;
  const [show, setShow] = useState(false);

  const href = wpp
    ? `https://wa.me/${wpp}?text=${encodeURIComponent("Olá! Quero falar com o atendimento da NaPlanta.")}`
    : "";

  useEffect(() => {
    if (!wpp) return;
    if (sessionStorage.getItem("waTeaserOff")) return;
    // Aparece 3 vezes, em momentos diferentes, e some sozinha. Não insiste depois.
    const horarios = [5000, 30000, 75000];
    const timers: ReturnType<typeof setTimeout>[] = [];
    horarios.forEach((t, idx) => {
      timers.push(
        setTimeout(() => {
          if (sessionStorage.getItem("waTeaserOff")) return;
          setShow(true);
          timers.push(setTimeout(() => setShow(false), 8000));
          if (idx === horarios.length - 1) sessionStorage.setItem("waTeaserOff", "1");
        }, t)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [wpp]);

  function dismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShow(false);
    sessionStorage.setItem("waTeaserOff", "1");
  }

  if (!wpp) return null;

  return (
    <>
      {show && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="wa-teaser fixed bottom-[92px] right-5 z-50 flex max-w-[260px] items-center gap-3 rounded-2xl bg-white p-3 pr-8 shadow-xl ring-1 ring-black/5"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
            <Image src="/na-simbolo.png" alt="" width={26} height={24} className="object-contain" aria-hidden="true" />
          </span>
          <span className="text-sm leading-snug text-ink-soft">
            <span className="font-semibold text-ink">Olá! 👋</span> Posso te ajudar a achar o imóvel ideal?
          </span>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Fechar"
            className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-ink-muted hover:bg-neutral-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </a>
      )}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com o atendimento da NaPlanta no WhatsApp"
        className="wa-fab fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] transition hover:scale-105"
      >
        <Image src="/na-simbolo.png" alt="" width={40} height={37} className="object-contain" aria-hidden="true" />
      </a>
    </>
  );
}
