<?php
/**
 * cron_post.php — Postagem automática NaPlanta
 * Uso: php cron_post.php story   → posta 1 story PREMIUM
 *      php cron_post.php feed    → posta 1 feed
 *
 * Cron sugerido (2x/dia story às 9h e 18h):
 *   0 9,18 * * * php /home4/naplan18/public_html/instagram/cron_post.php story
 */

$mode = $argv[1] ?? 'story'; // 'story' ou 'feed'

// ── CONFIG ────────────────────────────────────────────────────────────────────
$IG_USER_ID  = '17841400716512863';
$PAGE_TOKEN  = 'EAGErOLDBQlgBRvqerZAkNFIw7qYDHnOtFXkgFraQLRxadT5JsrQZAq2DStqrOBZCnkrrLxB8ZAiNbZCaSiLtbZBJ9auGF7bS23Y9JnrC2p9Iu8hY6pLB4aHnAZAccZAtLKzs9ljTZB1OHMZCZCA5ZAmHGvgDBZBz4ryIEPhRUQjmekZA2qrQGNPfzN5XSicMzUZCZBouECgc4zfivW0ZD';
$XML_URL     = 'https://universal-ftp2.s3.us-west-2.amazonaws.com/chavesnamao/naplanta-chaves-na-mao-6873-ambos.xml';
$BASE_URL    = 'https://www.virtualnaplanta.com.br/instagram/'; // URL pública dos arquivos gerados
$IMOVEL_BASE = 'https://www.naplanta.com/imovel/imovel/';      // Link do imóvel no site

$POSTED_FILE = __DIR__ . '/posted_ids_' . $mode . '.json';
$STORY_GEN   = __DIR__ . '/story_generator.php';
$FEED_GEN    = __DIR__ . '/feed_generator.php';

$GRAPH_API   = "https://graph.facebook.com/v20.0/{$IG_USER_ID}";

// ── HELPERS ───────────────────────────────────────────────────────────────────
function log_msg($msg) {
    echo date('[Y-m-d H:i:s] ') . $msg . PHP_EOL;
}

function curl_post($url, $fields) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $fields,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT        => 60,
    ]);
    $res = curl_exec($ch);
    curl_close($ch);
    return json_decode($res, true);
}

// ── POSTED IDs ────────────────────────────────────────────────────────────────
$posted = [];
if (file_exists($POSTED_FILE)) {
    $posted = json_decode(file_get_contents($POSTED_FILE), true) ?? [];
}

// ── BUSCAR XML ────────────────────────────────────────────────────────────────
log_msg("Buscando XML...");
$ctx = stream_context_create(['http' => ['timeout' => 30]]);
$xml_raw = @file_get_contents($XML_URL, false, $ctx);
if (!$xml_raw) {
    log_msg("ERRO: Falha ao buscar XML.");
    exit(1);
}

$xml = new SimpleXMLElement($xml_raw);
$listings = $xml->Listings->Listing ?? [];

// ── FILTRAR IMÓVEIS ───────────────────────────────────────────────────────────
$candidatos = [];
foreach ($listings as $l) {
    $id      = (string)($l->ListingID ?? '');
    $pubtype = strtoupper(trim((string)($l->PublicationType ?? $l->Details->PublicationType ?? '')));
    $fotos   = [];
    if ($l->Media) {
        foreach ($l->Media->Item as $item) {
            if ((string)($item['medium'] ?? '') === 'image') {
                $fotos[] = (string)$item;
            }
        }
    }
    if (!$id || empty($fotos)) continue;

    // Stories: apenas PREMIUM; Feed: qualquer um
    if ($mode === 'story' && $pubtype !== 'PREMIUM') continue;

    if (!in_array($id, $posted)) {
        $candidatos[] = ['listing' => $l, 'id' => $id, 'fotos' => $fotos];
    }
}

// Se todos já foram postados, reseta
if (empty($candidatos)) {
    log_msg("Todos os imóveis já postados. Resetando histórico.");
    $posted = [];
    file_put_contents($POSTED_FILE, '[]');
    foreach ($listings as $l) {
        $id      = (string)($l->ListingID ?? '');
        $pubtype = strtoupper(trim((string)($l->PublicationType ?? $l->Details->PublicationType ?? '')));
        $fotos   = [];
        if ($l->Media) {
            foreach ($l->Media->Item as $item) {
                if ((string)($item['medium'] ?? '') === 'image') $fotos[] = (string)$item;
            }
        }
        if (!$id || empty($fotos)) continue;
        if ($mode === 'story' && $pubtype !== 'PREMIUM') continue;
        $candidatos[] = ['listing' => $l, 'id' => $id, 'fotos' => $fotos];
    }
}

if (empty($candidatos)) {
    log_msg("Nenhum imóvel disponível para postar.");
    exit(0);
}

// Escolhe um aleatório
$escolhido = $candidatos[array_rand($candidatos)];
$im_id     = $escolhido['id'];
$foto_url  = $escolhido['fotos'][0];
$listing   = $escolhido['listing'];

log_msg("Imóvel escolhido: #{$im_id} | Foto: {$foto_url}");

// ── GERAR IMAGEM ──────────────────────────────────────────────────────────────
if ($mode === 'story') {
    require_once $STORY_GEN;
    $filename = gerar_story($listing);
} else {
    require_once $FEED_GEN;
    $filename = gerar_feed($listing);
}

if (!$filename) {
    log_msg("ERRO: Falha ao gerar imagem.");
    exit(1);
}

$image_url_pub = $BASE_URL . $filename;
log_msg("Imagem gerada: {$image_url_pub}");

// ── POSTAR NO INSTAGRAM ───────────────────────────────────────────────────────
$media_type = ($mode === 'story') ? 'STORIES' : 'IMAGE';

$container_fields = [
    'image_url'    => $image_url_pub,
    'media_type'   => $media_type,
    'access_token' => $PAGE_TOKEN,
];

// Story: adiciona link "VER IMÓVEL COMPLETO →" para o site do imóvel
if ($mode === 'story') {
    $container_fields['link'] = $IMOVEL_BASE . $im_id;
    log_msg("Link do story: " . $container_fields['link']);
} else {
    // Feed: adiciona legenda
    $det    = $listing->Details ?? $listing;
    $loc    = $listing->Location ?? null;
    $bairro = $loc ? (string)($loc->Neighborhood ?? '') : '';
    $cidade = $loc ? (string)($loc->City ?? '') : '';
    $tipo   = (string)($det->PropertyType ?? '');
    $preco  = (int)(string)($det->ListPrice ?? 0);
    $alug   = (int)(string)($det->RentalPrice ?? 0);
    $valor  = $alug > 0 ? 'R$ ' . number_format($alug, 0, ',', '.') . '/mês' : 'R$ ' . number_format($preco, 0, ',', '.');

    $container_fields['caption'] =
        "🏠 {$tipo} em {$bairro}, {$cidade}/SC\n" .
        "💰 {$valor}\n\n" .
        "🔗 COD. {$im_id}\n" .
        "🔗 Mais detalhes: {$IMOVEL_BASE}{$im_id}\n\n" .
        "#naplanta #naplantaimoveis #imoveissaojose #imoveissc #imoveisflorianopolis";
}

// Step 1: criar container
$r1 = curl_post("{$GRAPH_API}/media", $container_fields);
log_msg("Resposta container: " . json_encode($r1));

if (isset($r1['error'])) {
    log_msg("ERRO ao criar container: " . $r1['error']['message']);
    exit(1);
}

$container_id = $r1['id'] ?? null;
if (!$container_id) {
    log_msg("ERRO: container_id não retornado.");
    exit(1);
}

// Step 2: publicar
sleep(3);
$r2 = curl_post("{$GRAPH_API}/media_publish", [
    'creation_id'  => $container_id,
    'access_token' => $PAGE_TOKEN,
]);
log_msg("Resposta publish: " . json_encode($r2));

if (isset($r2['id'])) {
    log_msg("✅ Postado com sucesso! Instagram ID: " . $r2['id']);
    $posted[] = $im_id;
    file_put_contents($POSTED_FILE, json_encode($posted));
} else {
    log_msg("ERRO ao publicar: " . json_encode($r2));
    exit(1);
}

// Limpa imagem gerada
@unlink(__DIR__ . '/' . $filename);
log_msg("Imagem temporária removida.");
