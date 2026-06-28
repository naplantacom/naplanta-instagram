import type { MetadataRoute } from "next";
import { listProperties } from "@/services/properties";
import { getPosts } from "@/services/blog";
import { slugify } from "@/lib/format";

export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://naplanta.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const estaticas = [
    "", "/imoveis", "/financiamento", "/lancamentos", "/contato", "/anuncie",
    "/sobre", "/blog", "/politica-privacidade", "/documentos", "/ouvidoria", "/trabalhe-conosco",
  ];
  const urls: MetadataRoute.Sitemap = estaticas.map((p) => ({
    url: SITE + p,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  // Imóveis (a parte mais importante para SEO) — pagina todas as páginas
  try {
    const first = await listProperties({ per_page: 48, page: 1 }, 3600);
    const all = [...first.data];
    for (let p = 2; p <= (first.total_pages || 1); p++) {
      const r = await listProperties({ per_page: 48, page: p }, 3600);
      all.push(...r.data);
    }
    for (const im of all) {
      urls.push({
        url: `${SITE}/imovel/${im.id}/${slugify(im.titulo)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // sem imóveis no sitemap se a API falhar
  }

  // Posts do blog (só os internos)
  try {
    const { posts } = await getPosts(100, 3600);
    for (const p of posts) {
      if (!p.url) urls.push({ url: `${SITE}/blog/${p.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.5 });
    }
  } catch {
    // ignora
  }

  return urls;
}
