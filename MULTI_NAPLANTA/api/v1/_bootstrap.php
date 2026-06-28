<?php
/**
 * API REST pública v1 — NaPlanta.com
 * ----------------------------------
 * Camada de dados PÚBLICA (read-only) para o frontend headless (Next.js/Vercel).
 * NÃO exige login. Expõe apenas campos seguros dos imóveis disponíveis.
 *
 * Fonte: tabela `imoveis` (mesmo banco do back office), via core/imoveis_lib.
 * Dados sensíveis (matrícula, cartório, proprietários, anotações, e-mail/% do
 * corretor) NUNCA saem por aqui.
 *
 * Endpoints:
 *   GET /api/v1/properties.php            → lista + filtros + paginação
 *   GET /api/v1/properties.php?id=<cod>   → detalhe + similares
 *   GET /api/v1/facets.php                → cidades, bairros, tipos (p/ filtros)
 *
 * Convenções:
 *   - Sempre JSON UTF-8, CORS liberado (GET).
 *   - Erros: { "error": "...", "code": <http> }.
 */

ini_set('serialize_precision', '-1'); // floats no JSON na forma mais curta (10.8, não 10.8000…01)

require_once dirname(__DIR__, 2) . '/core/imoveis_lib.php';

// ── CORS / headers ──────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: public, max-age=60'); // ISR do front cuida do cache pesado
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }

// ── Helpers de saída ────────────────────────────────────────────────────────
function api_out($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function api_err(string $msg, int $code = 400): void {
    api_out(['error' => $msg, 'code' => $code], $code);
}

// ── Empresa + PDO ───────────────────────────────────────────────────────────
function api_empresa(): string {
    $e = preg_replace('/[^a-z0-9_\-]/i', '', (string)($_GET['empresa'] ?? 'naplanta'));
    return $e !== '' ? $e : 'naplanta';
}
function api_pdo(): PDO {
    static $pdo = null;
    if ($pdo === null) $pdo = imo_pdo(api_empresa());
    return $pdo;
}

// ── Coluna existe? (cache) — p/ campos opcionais como `destaque` ─────────────
function api_col_existe(string $coluna): bool {
    static $cache = [];
    if (isset($cache[$coluna])) return $cache[$coluna];
    try {
        $st = api_pdo()->prepare(
            "SELECT 1 FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'imoveis' AND COLUMN_NAME = ? LIMIT 1"
        );
        $st->execute([$coluna]);
        return $cache[$coluna] = (bool)$st->fetchColumn();
    } catch (Throwable $e) {
        return $cache[$coluna] = false;
    }
}

// ── Curadoria do site (módulo Portais → aba Site) ────────────────────────────
// site_config.json: { "qualif": { "<codigo>": "oculto"|"normal"|"destaque"|"banner" } }
function api_site_qualif(): array {
    static $map = null;
    if ($map !== null) return $map;
    $map = [];
    if (function_exists('auth_empresa_dir_id')) {
        $f = auth_empresa_dir_id(api_empresa()) . '/site_config.json';
        if (is_file($f)) {
            $j = json_decode((string) @file_get_contents($f), true);
            if (is_array($j) && isset($j['qualif']) && is_array($j['qualif'])) $map = $j['qualif'];
        }
    }
    return $map;
}
// Códigos de imóvel marcados com um dos qualificadores informados.
function api_site_codigos(array $qualifs): array {
    $out = [];
    foreach (api_site_qualif() as $cod => $q) {
        if (in_array($q, $qualifs, true)) $out[] = (string) $cod;
    }
    return $out;
}

// ── Descontos por imóvel (módulo Portais → aba Descontos) ───────────────────
// descontos_config.json: { "<codigo>": { "tipo": "percentual"|"valor", "valor": X } }
function api_descontos(): array {
    static $map = null;
    if ($map !== null) return $map;
    $map = [];
    if (function_exists('auth_empresa_dir_id')) {
        $f = auth_empresa_dir_id(api_empresa()) . '/descontos_config.json';
        if (is_file($f)) {
            $j = json_decode((string) @file_get_contents($f), true);
            if (is_array($j)) $map = $j;
        }
    }
    return $map;
}

// ── URL base p/ servir fotos (endpoint público já existente) ─────────────────
function api_foto_base(): string {
    $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    // .../api/v1/_bootstrap.php → sobe 2 níveis até a raiz do sistema (multi)
    $dir  = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/'); // .../api/v1
    $root = preg_replace('#/api/v1$#', '', $dir);
    return $proto . '://' . ($_SERVER['HTTP_HOST'] ?? '') . $root . '/proxy_base.php';
}

// ── Normaliza UMA linha do banco → objeto público do imóvel ──────────────────
function api_imovel_publico(array $r, bool $detalhe = false): array {
    // fotos: nomes locais → URLs absolutas no endpoint público de foto
    $fotos = [];
    $fj = json_decode((string)($r['fotos'] ?? ''), true);
    if (is_array($fj)) {
        foreach ($fj as $f) {
            if (!is_string($f) || $f === '') continue;
            $fotos[] = (strpos($f, 'http') === 0)
                ? api_foto_base() . '?action=img&u=' . urlencode($f)               // serve pelo nosso domínio (sem Imoview no navegador)
                : api_foto_base() . '?action=foto&id=' . (int)$r['id'] . '&f=' . urlencode($f);
        }
    }

    $finalidade = trim((string)($r['finalidade'] ?? ''));
    $finL    = mb_strtolower($finalidade);
    $venda   = round((float)($r['valor_venda'] ?? 0), 2);
    $locacao = round((float)($r['valor_locacao'] ?? 0), 2);
    // A finalidade manda. Defeito comum do Imoview: aluguel vem em valor_venda.
    if (strpos($finL, 'loca') !== false) {            // Locação
        if (!$locacao && $venda) $locacao = $venda;   // aluguel veio em valor_venda
        $venda = 0;
        $transacao = 'locacao';
    } elseif ($finL === 'venda') {                     // Venda
        if (!$venda && $locacao) $venda = $locacao;
        $locacao = 0;
        $transacao = 'venda';
    } else {                                           // Ambos / desconhecido
        $transacao = $venda > 0 ? 'venda' : 'locacao';
    }

    $out = [
        'id'           => (string)($r['codigo_imoview'] ?: $r['id']),
        'titulo'       => (string)($r['titulo'] ?? ''),
        'tipo'         => (string)($r['tipo'] ?? ''),
        'finalidade'   => $finalidade,
        'destinacao'   => strtoupper(trim((string)($r['destinacao'] ?? ''))),
        'transacao'    => $transacao,
        'preco_venda'  => $venda,
        'preco_locacao'=> $locacao,
        'condominio'   => round((float)($r['valor_condominio'] ?? 0), 2),
        'iptu'         => round((float)($r['valor_iptu'] ?? 0), 2),
        'taxa_lixo'    => round((float)($r['valor_taxa_lixo'] ?? 0), 2),
        'seguro'       => round((float)($r['valor_seguro'] ?? 0), 2),
        'iptu_vaga'          => round((float)($r['valor_iptu_vaga'] ?? 0), 2),
        'iptu_parcelas'      => (int)($r['iptu_tipo'] ?? 0),
        'iptu_vaga_parcelas' => (int)($r['iptu_vaga_tipo'] ?? 0),
        'taxa_lixo_parcelas' => (int)($r['taxa_lixo_tipo'] ?? 0),
        'seguro_parcelas'    => (int)($r['seguro_tipo'] ?? 0),
        'bairro'       => (string)($r['bairro'] ?? ''),
        'cidade'       => (string)($r['cidade'] ?? ''),
        'estado'       => (string)($r['estado'] ?? ''),
        'quartos'      => (int)($r['quartos'] ?? 0),
        'suites'       => (int)($r['suites'] ?? 0),
        'banheiros'    => (int)($r['banheiros'] ?? 0),
        'vagas'        => (int)($r['vagas_garagem'] ?? 0),
        'area_interna' => (float)($r['area_interna'] ?? 0),
        'area_total'   => (float)($r['area_total'] ?? 0),
        'condominio_nome' => (string)($r['nome_condominio'] ?? ''),
        'destaque'     => in_array(api_site_qualif()[(string)($r['codigo_imoview'] ?? '')] ?? '', ['destaque', 'banner'], true),
        'capa'         => $fotos[0] ?? null,
        'fotos_total'  => count($fotos),
    ];

    // Desconto configurado no módulo Portais → aba Descontos
    $codigo = (string)($r['codigo_imoview'] ?? $r['id'] ?? '');
    $desc   = api_descontos()[$codigo] ?? null;
    if (is_array($desc) && ($desc['valor'] ?? 0) > 0) {
        $precoBase = $transacao === 'locacao' ? $locacao : $venda;
        $tipo      = ($desc['tipo'] ?? 'percentual') === 'valor' ? 'valor' : 'percentual';
        $dVal      = (float)$desc['valor'];
        $precoPromo = $tipo === 'percentual'
            ? round($precoBase * (1 - $dVal / 100), 2)
            : round($precoBase - $dVal, 2);
        if ($precoPromo > 0 && $precoPromo < $precoBase) {
            $out['desconto_tipo']      = $tipo;
            $out['desconto_valor']     = $dVal;
            $out['preco_promocional']  = $precoPromo;
        }
    }

    if ($detalhe) {
        $caracRaw = json_decode((string)($r['caracteristicas'] ?? ''), true);
        $caracNomes = [];
        if (is_array($caracRaw)) {
            foreach ($caracRaw as $k => $v) {
                if (!is_int($k)) { if ($v) $caracNomes[] = (string) $k; }       // {nome: true}
                elseif (is_string($v) && $v !== '') $caracNomes[] = $v;          // ["nome", ...]
                elseif (is_array($v) && !empty($v['nome'])) $caracNomes[] = (string) $v['nome']; // [{nome:...}]
            }
        }
        $cap   = json_decode((string)($r['captador'] ?? ''), true);
        $out += [
            'descricao'    => (string)($r['descricao'] ?? ''),
            'andar'        => (string)($r['andar'] ?? ''),
            'salas'        => (int)($r['salas'] ?? 0),
            'varandas'     => (int)($r['varandas'] ?? 0),
            'area_externa' => (float)($r['area_externa'] ?? 0),
            'aceita_financiamento' => !empty($r['aceita_financiamento']),
            'aceita_permuta'       => !empty($r['aceita_permuta']),
            'lat'          => ($r['latitude']  ?? '') !== '' ? (float)$r['latitude']  : null,
            'lng'          => ($r['longitude'] ?? '') !== '' ? (float)$r['longitude'] : null,
            'video_url'    => (string)($r['video_url'] ?? ''),
            'tour_url'     => (string)($r['tour_url'] ?? ''),
            'caracteristicas' => $caracNomes,
            'fotos'        => $fotos,
            'corretor'     => is_array($cap) ? [
                'nome'     => (string)($cap['nome'] ?? ''),
                'creci'    => (string)($cap['creci'] ?? ''),
                'telefone' => (string)($cap['telefone'] ?? ''),
            ] : null,
        ];
    }
    return $out;
}
