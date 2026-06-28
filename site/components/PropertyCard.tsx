import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Car, Maximize, Star } from "lucide-react";
import type { PropertyCard as Card } from "@/types/property";
import { priceLabel, area, slugify } from "@/lib/format";

export function PropertyCard({ imovel }: { imovel: Card }) {
  const href = `/imovel/${imovel.id}/${slugify(imovel.titulo)}`;
  const local = [imovel.bairro, imovel.cidade].filter(Boolean).join(", ");

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        {imovel.capa ? (
          <Image
            src={imovel.capa}
            alt={imovel.titulo}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">sem foto</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {imovel.transacao === "locacao" ? "Locação" : "Venda"}
        </span>
        {imovel.destaque && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">
            <Star className="h-3 w-3 fill-current" /> Destaque
          </span>
        )}
        {imovel.fotos_total > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white">
            {imovel.fotos_total} fotos
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-lg font-semibold text-ink">{priceLabel(imovel)}</p>
        <h3 className="mt-1 line-clamp-2 text-sm text-ink-soft">{imovel.titulo}</h3>
        {local && <p className="mt-1 text-sm text-ink-muted">{local}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-neutral-100 pt-3 text-sm text-ink-muted">
          {imovel.quartos > 0 && (
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-4 w-4" /> {imovel.quartos}
            </span>
          )}
          {imovel.banheiros > 0 && (
            <span className="inline-flex items-center gap-1">
              <Bath className="h-4 w-4" /> {imovel.banheiros}
            </span>
          )}
          {imovel.vagas > 0 && (
            <span className="inline-flex items-center gap-1">
              <Car className="h-4 w-4" /> {imovel.vagas}
            </span>
          )}
          {imovel.area_interna > 0 && (
            <span className="inline-flex items-center gap-1">
              <Maximize className="h-4 w-4" /> {area(imovel.area_interna)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
