import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Post } from "@/types/blog";
import { formatDate } from "@/lib/format";
import { BlogCover } from "./BlogCover";

function postHref(p: Post): string {
  return p.url || `/blog/${p.slug}`;
}

function PostCard({ p }: { p: Post }) {
  const href = postHref(p);
  const external = href.startsWith("http");

  const inner = (
    <>
      <div className="relative aspect-[16/9] overflow-hidden bg-ink">
        {p.capa ? (
          <Image src={p.capa} alt={p.titulo} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <BlogCover categoria={p.categoria} titulo={p.titulo} className="h-full w-full transition duration-500 group-hover:scale-105" />
        )}
        {p.categoria && (
          <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
            {p.categoria}
          </span>
        )}
      </div>
      <div className="p-5">
        {p.data && <p className="text-xs text-ink-muted">{formatDate(p.data)}</p>}
        <h3 className="mt-1 line-clamp-2 font-display text-lg font-bold text-ink">{p.titulo}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{p.resumo}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand">
          Ler mais {external ? <ArrowUpRight className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </span>
      </div>
    </>
  );

  const cls =
    "group block overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg";

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

export function BlogSection({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <section className="container py-16">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            Mercado imobiliário de Santa Catarina
          </h2>
          <p className="mt-1 text-sm text-ink-muted">Notícias, tendências e dicas pra comprar, vender e alugar</p>
        </div>
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-600">
          Ver o blog <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}
