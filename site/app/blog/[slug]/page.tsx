import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getPosts } from "@/services/blog";
import { formatDate } from "@/lib/format";
import { BlogCover } from "@/components/BlogCover";
import type { Post } from "@/types/blog";

export const revalidate = 1800;

async function findPost(slug: string): Promise<Post | null> {
  try {
    const { posts } = await getPosts(100);
    return posts.find((p) => p.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await findPost(slug);
  if (!p) return { title: "Artigo" };
  return { title: p.titulo, description: p.resumo, openGraph: { images: p.capa ? [p.capa] : [], title: p.titulo } };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await findPost(slug);

  return (
    <article className="container py-10">
      <Link href="/blog" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Voltar ao blog
      </Link>

      {!p ? (
        <p className="rounded-2xl bg-neutral-50 p-10 text-center text-ink-muted">Artigo não encontrado.</p>
      ) : (
        <div className="mx-auto max-w-3xl">
          {p.categoria && (
            <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">{p.categoria}</span>
          )}
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">{p.titulo}</h1>
          {p.data && <p className="mt-2 text-sm text-ink-muted">{formatDate(p.data)}</p>}

          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-ink">
            {p.capa ? (
              <Image src={p.capa} alt={p.titulo} fill sizes="(max-width:1024px) 100vw, 768px" className="object-cover" priority />
            ) : (
              <BlogCover categoria={p.categoria} titulo={p.titulo} className="h-full w-full" />
            )}
          </div>

          <div
            className="mt-6 text-ink-soft leading-relaxed [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1.5 [&_a]:font-medium [&_a]:text-brand hover:[&_a]:text-brand-600"
            dangerouslySetInnerHTML={{ __html: p.conteudo || `<p>${p.resumo}</p>` }}
          />

          <div className="mt-10 rounded-2xl bg-neutral-50 p-6 text-center">
            <p className="text-ink-muted">Quer ajuda para encontrar o imóvel ideal?</p>
            <Link href="/contato" className="mt-3 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">
              Falar com a NaPlanta
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}
