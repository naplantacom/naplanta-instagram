import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getPosts } from "@/services/blog";
import { formatDate } from "@/lib/format";
import { BlogCover } from "@/components/BlogCover";
import type { Post } from "@/types/blog";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Blog — Mercado imobiliário de Santa Catarina",
  description: "Notícias, tendências e dicas sobre o mercado imobiliário de Santa Catarina.",
};

function href(p: Post) {
  return p.url || `/blog/${p.slug}`;
}

export default async function BlogPage() {
  let posts: Post[] = [];
  try {
    posts = (await getPosts(50)).posts;
  } catch {
    // segue vazio
  }

  return (
    <>
      <section className="border-b border-black/5 bg-neutral-50">
        <div className="container py-12">
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Blog</h1>
          <p className="mt-2 max-w-2xl text-ink-muted">Mercado imobiliário de Santa Catarina — notícias, tendências e dicas.</p>
        </div>
      </section>

      <section className="container py-12">
        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((p) => {
              const h = href(p);
              const ext = h.startsWith("http");
              const inner = (
                <>
                  <div className="relative aspect-[16/9] overflow-hidden bg-ink">
                    {p.capa ? (
                      <Image src={p.capa} alt={p.titulo} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <BlogCover categoria={p.categoria} titulo={p.titulo} className="h-full w-full transition duration-500 group-hover:scale-105" />
                    )}
                    {p.categoria && (
                      <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">{p.categoria}</span>
                    )}
                  </div>
                  <div className="p-5">
                    {p.data && <p className="text-xs text-ink-muted">{formatDate(p.data)}</p>}
                    <h2 className="mt-1 line-clamp-2 font-display text-lg font-bold text-ink">{p.titulo}</h2>
                    <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{p.resumo}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand">
                      Ler mais {ext ? <ArrowUpRight className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                    </span>
                  </div>
                </>
              );
              const cls = "group block overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg";
              return ext ? (
                <a key={p.id} href={h} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
              ) : (
                <Link key={p.id} href={h} className={cls}>{inner}</Link>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl bg-neutral-50 p-10 text-center text-ink-muted">Em breve, novos conteúdos por aqui.</p>
        )}
      </section>
    </>
  );
}
