"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Empreendimento } from "@/data/lancamentos";

export function LancamentosCarousel({ items }: { items: Empreendimento[] }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (items.length <= 2) return;
    const id = setInterval(() => {
      setOffset((prev) => {
        const next = prev + 2;
        return next >= items.length ? 0 : next;
      });
    }, 10000);
    return () => clearInterval(id);
  }, [items.length]);

  const visible = items.length <= 2
    ? items
    : [items[offset % items.length], items[(offset + 1) % items.length]];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {visible.map((e) => (
        <Link
          key={e.slug}
          href={e.url || "/lancamentos"}
          className="group relative block overflow-hidden rounded-2xl shadow-card ring-1 ring-black/5 transition-opacity duration-500"
        >
          <div className="relative aspect-[16/9]">
            <Image
              src={e.cover}
              alt={e.nome}
              fill
              sizes="(max-width:768px) 100vw, 50vw"
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
  );
}
