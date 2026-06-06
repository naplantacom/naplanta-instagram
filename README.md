# NaPlanta · Gerador de Posts Instagram

Ferramenta web para gerar templates de Feed e Story para Instagram a partir do feed XML da NaPlanta Imobiliária.

## Arquivos

| Arquivo | Função |
|---------|--------|
| `index.html` | Interface completa (frontend) |
| `proxy.php` | Backend PHP — lê XML, faz cache, encurta links |

## Como usar

### HostGator (produção)
1. Faça upload de ambos os arquivos para `/public_html/naplanta/`
2. Abra `index.html` num editor e troque:
   ```js
   var API_URL = 'https://SEU-DOMINIO.COM.BR/naplanta/proxy.php';
   ```
3. Acesse `https://seusite.com.br/naplanta/`

### Desenvolvimento local com PHP
```bash
php -S localhost:8080
# Acesse http://localhost:8080
```

### Testar só o frontend (sem PHP)
```bash
npx serve .
# Acesse http://localhost:3000
# Obs: sem proxy.php os imóveis não carregam — use o HostGator
```

## Funcionalidades

- 🏠 Carrega todos os imóveis do XML (`naplanta-chaves-na-mao-6873-ambos.xml`)
- 🔍 Busca por código (#1 a #100000), bairro, tipo ou título
- 📸 Seleção múltipla de fotos — gera um post por foto selecionada
- 🖼️ Templates Feed 1:1 (1080×1080px) e Story 9:16 (1080×1920px)
- 📲 Compartilhamento direto via Web Share API (abre Instagram com imagem)
- 🎬 Vídeo slideshow com efeito Ken Burns (Chrome/Edge)
- 📝 Legenda automática com 5 hashtags
- 🔗 Link do imóvel encurtado via TinyURL
- 📞 WhatsApp com mensagem pré-preenchida incluindo código do imóvel

## Configuração

No `index.html`, linha ~120:
```js
var API_URL = 'https://SEU-DOMINIO.COM.BR/naplanta/proxy.php';
var WA_NUMBER = '5548991531668'; // número WhatsApp (sem + e sem espaços)
```

No `proxy.php`, linha ~10:
```php
$XML_URL = 'https://universal-ftp2.s3.us-west-2.amazonaws.com/...xml';
$CACHE_TTL = 1800; // cache em segundos (30 min)
```

## Identidade Visual

- Vermelho: `#E60000`
- Preto: `#0A0A0A`
- Logo: branca (embutida em base64 no index.html)
- Fontes: DM Sans (Google Fonts)

## Requisitos do servidor

- PHP 7.4+
- `allow_url_fopen = On` (para buscar o XML)
- `curl` habilitado (fallback se file_get_contents falhar)
- Pasta com permissão de escrita (para cache JSON)
