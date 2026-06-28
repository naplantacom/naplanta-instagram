import { redirect, notFound } from "next/navigation";
import { getProperty } from "@/services/properties";
import { slugify } from "@/lib/format";

export const revalidate = 60;

export default async function ImovelShortUrl({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let result;
  try {
    result = await getProperty(id, 60);
  } catch {
    notFound();
  }

  if (!result?.data) notFound();

  const slug = slugify(result.data.titulo);
  redirect(`/imovel/${id}/${slug}`);
}
