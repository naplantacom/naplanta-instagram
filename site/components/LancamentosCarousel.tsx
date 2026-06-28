"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Empreendimento } from "@/data/lancamentos";

export function LancamentosCarousel({ items }: { items: Empreendimento[] }) {
  // Duplica para loop contínuo
  const track = [...items, ...items];

  return (
    <div className="overflow-hidden">
      <style>{`
        @keyframes lp-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .lp-track {
          display: flex;
          gap: 24px;
          width: max-content;
          animation: lp-scroll ${items.length * 4}s linear infinite;
        }
        .lp-track:hover { animation-play-state: paused; }
        .lp-card {
          width: 420px;
          flex-shrink: 0;
        }
        @media (max-width: 640px) {
          .lp-card { width: 80vw; }
        }
      `}</style>

      <div className="lp-track">
        {track.map((e, i) => (
          <Link
            key={`${e.slug}-${i}`}
            href={e.url || "/lancamentos"}
            className="lp-card group relative block overflow-hidden rounded-2xl shadow-card ring-1 ring-black/5"
          >
            <div className="relative aspect-[16/9]">
              <Image
                src={e.cover}
                alt={e.nome}
                fill
                sizes="420px"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />
              <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                {e.status}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h3 className="font-display text-2xl font-bold">{e.nome}</h3>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/80">
                  <MapPin className="h-4 w-4" /> {e.local}
                </p>
                <p className="mt-1 text-sm font-semibold text-brand-200">{e.precoDe}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
