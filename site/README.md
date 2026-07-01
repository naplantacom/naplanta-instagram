# NaPlanta.com — Frontend (Next.js 15)

Site público headless da NaPlanta Imobiliária. **Camada de apresentação** — não
tem regra de negócio nem banco: consome a **API REST do back office** (`multi`, PHP).

- **Back office / API:** `app.naplanta.com/multi/api/v1` (empresa `naplanta`)
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
| `NEXT_PUBLIC_API_BASE` | base da API REST do back office — **`https://app.naplanta.com/multi/api/v1`** (há fallback igual embutido em `services/api.ts`) |
| `NEXT_PUBLIC_EMPRESA` | empresa (multiempresa) — `naplanta` |
| `NEXT_PUBLIC_WHATSAPP` | número do WhatsApp (DDI+DDD+nº, só dígitos) |
| `NEXT_PUBLIC_SITE_URL` | URL pública (SEO/canonical) |

> ⚠️ `NEXT_PUBLIC_*` é **baked no build**. Ao trocar na Vercel, é preciso **Redeploy**.

## Deploy na Vercel
- **Root Directory = `site`**. Auto-deploy a cada `git push` na `main`.
- Env vars conforme a tabela acima.
- Domínio: `naplanta.com` → Vercel.

## Estrutura
```
app/            rotas (App Router) — page.tsx = Home; imovel/[id]/[slug] = detalhe
components/     UI reutilizável (Header, Footer, PropertyCard, Gallery, WhatsAppFab…)
services/       comunicação com a API (api, properties, facets, site) — componentes só usam isto
lib/            helpers (format: formatBRL, extensoReais…)
public/         logos e estáticos
```

## Recursos & convenções

### Visual
- Fundo global **cinza-claro `#e5e7eb`** (`app/globals.css` → `--background`); cards brancos com `shadow-card` (definida em `tailwind.config.ts`).
- Cards de spec do imóvel com **hover** (leve subida + fundo branco + ícone no vermelho da marca).

### Descontos (promoção)
- Configurados no **módulo Portais → aba Descontos** (por código do imóvel). A API entrega `desconto_tipo`, `desconto_valor` e `preco_promocional`.
- **Selo "Oferta Especial"** (galeria + lateral) mostra o **desconto conforme a aba**: `- R$ X` (valor fixo) ou `X% DE DESCONTO` (percentual).
- **Card do valor** (arredondado, borda dourada) mostra o **preço final promocional** + o valor **por extenso** (`extensoReais()` em `lib/format.ts`).

### Botão flutuante de WhatsApp (`components/WhatsAppFab.tsx`)
- **Arrastável na vertical** (arraste ≠ clique).
- **Modo Copa** ⚽ (opcional): vira bola e comemora um gol a cada 10s. Controlado pelo admin, **sem deploy**.

### Flags do site (Extras) — controle pelo admin
Chaves de recurso do site vêm do back office, sem precisar de deploy:
```
Portais → aba "Extras do site" (checkbox)
  → site_config.json (chave "flags")
  → GET /api/v1/config.php  ({ modo_copa: bool })
  → services/site.ts getSiteConfig()  (ISR 60s)
  → layout.tsx passa a flag como prop ao componente
```
Para adicionar nova flag (ex.: banner sazonal): checkbox no Portais + handler `save_site_flags`, expor em `config.php`, ler em `getSiteConfig()`.

## Status / próximos passos
- [x] Setup + identidade + layout (header/footer/WhatsApp)
- [x] Home: hero + busca + destaques + cidades + CTA (API real)
- [x] `/imovel/[id]/[slug]` detalhe (galeria, specs, descontos, simulador, leads)
- [x] Descontos + selo Oferta Especial + valor por extenso
- [x] Botão WhatsApp arrastável + Modo Copa (flag do Portais)
- [ ] `/imoveis` listagem com filtros instantâneos + infinite scroll
- [ ] Banners sazonais (via Flags/Extras)
- [ ] Busca por IA, favoritos, blog, PWA
