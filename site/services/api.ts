/**
 * Camada base de comunicação com a API REST do back office (multi).
 * Componentes NUNCA chamam endpoints direto — sempre via services/*.
 *
 * Usa fetch nativo com ISR (revalidate) — cacheia no edge da Vercel e só
 * chama o PHP de tempos em tempos, contornando a lentidão do compartilhado.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://app.naplanta.com/multi/api/v1";
const EMPRESA = process.env.NEXT_PUBLIC_EMPRESA ?? "naplanta";

export interface FetchOpts {
  /** Segundos de revalidação (ISR). Default 300s. */
  revalidate?: number;
  /** Querystring. */
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function apiGet<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { revalidate = 300, params = {} } = opts;

  const url = new URL(`${API_BASE}/${path.replace(/^\//, "")}`);
  url.searchParams.set("empresa", EMPRESA);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    next: { revalidate },
    headers: { Accept: "application/json" },
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`API ${res.status} em ${path}: ${text.slice(0, 120)}`);
  if (!text.trim()) throw new Error(`Resposta vazia da API em ${path}`);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`JSON inválido da API em ${path}`);
  }
}
