# NaPlanta.com — Frontend (Next.js 15)

Site público headless da NaPlanta Imobiliária. **Camada de apresentação** — não
tem regra de negócio nem banco: consome a **API REST do back office** (`multi`, PHP).

- **Back office / API:** `multi/api/v1` (servido em `app.naplanta.com` / hoje `virtualnaplanta.com.br/multi`)
- **Hospedagem:** Vercel (ISR/SSR/Next Image nativos)
- **Stack:** Next.js 15 · React 19 · TypeScript · Tailwind · framer-motion · TanStack Query · Zustand

## Rodar localmente
```bash
cd site
cp .env.example .env.local   # ajuste NEXT_PUBLIC_WHATSAPP e a base da API se preciso
npm install
npm run dev                  # http://localhost:3000
```
> Requer Node 18.18+ (recomendado 20+). A API já está no ar, então o `dev` puxa imóveis reais.

## Variáveis de ambiente
| var | descrição |
|---|---|
| `NEXT_PUBLIC_API_BASE` | base da API REST do back office |
| `NEXT_PUBLIC_EMPRESA` | empresa (multiempresa) — `naplanta` |
| `NEXT_PUBLIC_WHATSAPP` | número do WhatsApp (DDI+DDD+nº, só dígitos) |
| `NEXT_PUBLIC_SITE_URL` | URL pública (SEO/canonical) |

## Deploy na Vercel
1. `git push` do repositório.
2. Na Vercel: **New Project** → importe o repo → **Root Directory = `site`**.
3. Configure as Environment Variables (as do `.env.example`).
4. Deploy. Domínio: aponte `naplanta.com` para a Vercel quando for ao ar.

## Estrutura
```
app/            rotas (App Router) — page.tsx = Home
components/     UI reutilizável (Header, Footer, PropertyCard, SearchBar…)
services/       comunicação com a API (api, properties, facets) — componentes só usam isto
types/          tipos espelhando a API
lib/            helpers (format, utils)
public/         logos e estáticos
```

## Status / próximos passos
- [x] Setup + identidade (vermelho/preto/branco) + layout (header/footer/WhatsApp)
- [x] Home: hero + busca + destaques (recentes) + cidades + CTA — consumindo a API real
- [ ] `/imoveis` listagem com filtros instantâneos + infinite scroll
- [ ] `/imovel/[id]` detalhe (galeria, mapa, POIs, corretor, agendar visita)
- [ ] `/lancamentos`, `/sobre`, `/contato` (form → endpoint `leads`)
- [ ] Busca por IA, favoritos, blog, SEO JSON-LD, PWA
