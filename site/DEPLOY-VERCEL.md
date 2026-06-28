# Deploy do site na Vercel

O **site** (Next.js) vai pra **Vercel**. O **back office + API** continua no HostGator
(`virtualnaplanta.com.br/multi` → futuro `app.naplanta.com`). São coisas separadas.

> Build já testado localmente (`npm run build` → 9 páginas, 0 erros). A Vercel roda o mesmo build.

## 1. Subir o site (Vercel CLI — só a pasta `site/`, sem GitHub)
No Terminal:
```bash
cd "/Users/macbook/Library/Mobile Documents/com~apple~CloudDocs/naplanta-code/site"
npx vercel login        # abre o navegador → entre (ou crie conta grátis)
npx vercel              # 1ª vez: cria o projeto
#   - Set up and deploy? Y
#   - Which scope? sua conta
#   - Link to existing project? N
#   - Project name? naplanta-site (ou enter)
#   - In which directory is your code? ./   (já estamos em site/)
#   - Framework: Next.js (detectado) — aceite os defaults
```
Isso gera um deploy de **preview** (uma URL .vercel.app pra testar).

## 2. Variáveis de ambiente (na Vercel)
Vercel → seu projeto → **Settings → Environment Variables** (marque *Production*):

| Nome | Valor |
|---|---|
| `NEXT_PUBLIC_API_BASE` | `https://www.virtualnaplanta.com.br/multi/api/v1` *(troque p/ `https://app.naplanta.com/api/v1` quando o subdomínio subir)* |
| `NEXT_PUBLIC_EMPRESA` | `naplanta` |
| `NEXT_PUBLIC_WHATSAPP` | `5548991531668` |
| `NEXT_PUBLIC_SITE_URL` | `https://naplanta.com` |

## 3. Deploy de produção
```bash
npx vercel --prod
```

## 4. Domínio `naplanta.com` → Vercel
Vercel → projeto → **Settings → Domains** → adicione `naplanta.com` e `www.naplanta.com`.
A Vercel mostra os registros DNS exatos. Em geral:
```
A      naplanta.com      76.76.21.21
CNAME  www               cname.vercel-dns.com
```
Esses registros vão no **DNS onde o naplanta.com é gerenciado** (hoje Imoview/Universal;
ou HostGator, se você virar os nameservers).

### ⚠️ Mapa de DNS atualizado (mudou com o site na Vercel)
- **`naplanta.com`** (raiz/www) → **Vercel** (o site). [A/CNAME acima]
- **`app.naplanta.com`** → **HostGator** (back office + API). [A → 162.241.203.96]
- **MX (e-mail)** → **Google Workspace** (não mexer). [5 registros ASPMX]

## Próximos deploys (rotina)
Sempre que mudar o site:
```bash
cd "…/site"
npx vercel --prod
```
(ou conectar o repo depois pra deploy automático no git push).
