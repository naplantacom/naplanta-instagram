"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";

export function Gallery({ fotos, titulo, badge }: { fotos: string[]; titulo: string; badge?: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const n = fotos.length;
  const stripRef = useRef<HTMLDivElement>(null);

  const go = useCallback((d: number) => setActive((a) => (a + d + n) % n), [n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const scrollStrip = (d: number) => stripRef.current?.scrollBy({ left: d * 260, behavior: "smooth" });

  if (!n) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-neutral-100 text-ink-muted">
        sem fotos
      </div>
    );
  }

  const arrowCls =
    "absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink shadow-md backdrop-blur transition hover:bg-white";

  return (
    <div>
      {/* IMAGEM PRINCIPAL */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-ink">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute inset-0 h-full w-full cursor-zoom-in"
          aria-label="Ampliar foto"
        >
          <Image
            src={fotos[active]}
            alt={titulo}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
          />
        </button>

        {badge && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-brand px-4 py-1.5 text-sm font-bold text-white shadow-lg">
            {badge}
          </span>
        )}
        <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
          <Expand className="h-3 w-3" /> ampliar
        </span>

        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className={`${arrowCls} left-3`}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Próxima foto" className={`${arrowCls} right-3`}>
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
              {active + 1} / {n}
            </span>
          </>
        )}
      </div>

      {/* MOSAICO DE MINIATURAS com setas */}
      {n > 1 && (
        <div className="relative mt-3">
          <div ref={stripRef} className="flex gap-2 overflow-x-auto scroll-smooth hide-scrollbar">
            {fotos.map((f, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Foto ${i + 1}`}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                  i === active ? "ring-brand" : "ring-transparent hover:ring-black/10"
                }`}
              >
                <Image src={f} alt="" fill sizes="96px" className="object-cover" />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollStrip(-1)}
            aria-label="Miniaturas anteriores"
            className="absolute left-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-md ring-1 ring-black/5"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollStrip(1)}
            aria-label="Próximas miniaturas"
            className="absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-md ring-1 ring-black/5"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* LIGHTBOX */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            <X className="h-6 w-6" />
          </button>

          {n > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); go(-1); }}
              aria-label="Foto anterior"
              className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotos[active]}
            alt={titulo}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[92vw] rounded-lg object-contain"
          />

          {n > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); go(1); }}
              aria-label="Próxima foto"
              className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          )}

          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-sm text-white">
            {active + 1} / {n}
          </span>
        </div>
      )}
    </div>
  );
}
