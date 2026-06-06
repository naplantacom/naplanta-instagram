<?php
/**
 * NaPlanta - Proxy XML + Cache
 * Hospede este arquivo no HostGator na pasta /public_html/naplanta/
 * Ele busca o XML automaticamente e faz cache por 30 minutos
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store');

// ── ENCURTADOR DE LINK ────────────────────────────────────────────────────────
// Endpoint: proxy.php?action=shortlink&url=...
// NOTA: Links wa.me NAO devem ser encurtados — retorna direto
if (isset($_GET['action']) && $_GET['action'] === 'shortlink') {
    $url = $_GET['url'] ?? '';
    if (!$url) { echo json_encode(['error'=>'no url']); exit; }
    
    // TinyURL — encurta link do imovel para legenda
    $tinyurl = @file_get_contents('https://tinyurl.com/api-create.php?url=' . urlencode($url));
    if ($tinyurl && strpos($tinyurl, 'tinyurl.com') !== false) {
        echo json_encode(['short' => trim($tinyurl), 'service' => 'tinyurl']);
        exit;
    }
    
    // Fallback: is.gd
    $isgd = @file_get_contents('https://is.gd/create.php?format=simple&url=' . urlencode($url));
    if ($isgd && strpos($isgd, 'is.gd') !== false) {
        echo json_encode(['short' => trim($isgd), 'service' => 'is.gd']);
        exit;
    }
    
    // Fallback final: URL original
    echo json_encode(['short' => $url, 'service' => 'original']);
    exit;
}



// ── CONFIG INSTAGRAM ──────────────────────────────────────────────────────────
$IG_USER_ID = '17841400716512863';
$IG_PAGE_TOKEN = 'EAGErOLDBQlgBRvqerZAkNFIw7qYDHnOtFXkgFraQLRxadT5JsrQZAq2DStqrOBZCnkrrLxB8ZAiNbZCaSiLtbZBJ9auGF7bS23Y9JnrC2p9Iu8hY6pLB4aHnAZAccZAtLKzs9ljTZB1OHMZCZCA5ZAmHGvgDBZBz4ryIEPhRUQjmekZA2qrQGNPfzN5XSicMzUZCZBouECgc4zfivW0ZD';

// ── POSTAR NO INSTAGRAM ───────────────────────────────────────────────────────
if (isset($_POST['action']) && $_POST['action'] === 'post_instagram') {
    $image_b64 = $_POST['image']   ?? '';
    $caption   = $_POST['caption'] ?? '';

    if (!$image_b64) { echo json_encode(['error'=>'Imagem não recebida']); exit; }

    // Salva PNG temporário na pasta (deve ter permissão de escrita)
    $fname   = 'ig_tmp_' . uniqid() . '.png';
    $fpath   = __DIR__ . '/' . $fname;
    $imgdata = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $image_b64));
    file_put_contents($fpath, $imgdata);

    // URL pública do arquivo
    $proto     = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $image_url = $proto . '://' . $_SERVER['HTTP_HOST'] . rtrim(dirname($_SERVER['SCRIPT_NAME']),'/') . '/' . $fname;

    // Step 1 — Criar container de mídia
    $media_type = ($_POST['media_type'] ?? 'IMAGE') === 'STORIES' ? 'STORIES' : 'IMAGE';
    $post_fields = [
        'image_url'    => $image_url,
        'media_type'   => $media_type,
        'access_token' => $IG_PAGE_TOKEN,
    ];
    if ($media_type === "STORIES" && !empty($_POST["imovel_id"])) {
        $post_fields["link"] = "https://www.naplanta.com/imovel/imovel/" . preg_replace("/[^0-9]/", "", $_POST["imovel_id"]);
    }
    if ($media_type !== "STORIES") {
        $post_fields['caption'] = $caption; // Stories não aceitam legenda
    }
    $ch = curl_init("https://graph.facebook.com/v20.0/{$IG_USER_ID}/media");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $post_fields,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $r1 = json_decode(curl_exec($ch), true);
    curl_close($ch);

    if (isset($r1['error'])) {
        @unlink($fpath);
        echo json_encode(['error' => $r1['error']['message']]); exit;
    }

    sleep(5); // aguarda processamento do Meta

    // Step 2 — Publicar
    $ch = curl_init("https://graph.facebook.com/v20.0/{$IG_USER_ID}/media_publish");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => [
            'creation_id'  => $r1['id'],
            'access_token' => $IG_PAGE_TOKEN,
        ],
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $r2 = json_decode(curl_exec($ch), true);
    curl_close($ch);

    @unlink($fpath); // remove arquivo temporário

    if (isset($r2['error'])) {
        echo json_encode(['error' => $r2['error']['message']]); exit;
    }

    echo json_encode(['success' => true, 'post_id' => $r2['id'] ?? '']);
    exit;
}

// ── CONFIG INSTAGRAM ──────────────────────────────────────────────────────────
$IG_USER_ID = '17841400716512863';
$IG_PAGE_TOKEN = 'EAGErOLDBQlgBRvqerZAkNFIw7qYDHnOtFXkgFraQLRxadT5JsrQZAq2DStqrOBZCnkrrLxB8ZAiNbZCaSiLtbZBJ9auGF7bS23Y9JnrC2p9Iu8hY6pLB4aHnAZAccZAtLKzs9ljTZB1OHMZCZCA5ZAmHGvgDBZBz4ryIEPhRUQjmekZA2qrQGNPfzN5XSicMzUZCZBouECgc4zfivW0ZD';

// ── POSTAR NO INSTAGRAM ───────────────────────────────────────────────────────
if (isset($_POST['action']) && $_POST['action'] === 'post_instagram') {
    $image_b64 = $_POST['image']   ?? '';
    $caption   = $_POST['caption'] ?? '';
    if (!$image_b64) { echo json_encode(['error'=>'Imagem não recebida']); exit; }
    $fname   = 'ig_tmp_' . uniqid() . '.png';
    $fpath   = __DIR__ . '/' . $fname;
    $imgdata = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $image_b64));
    file_put_contents($fpath, $imgdata);
    $proto     = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $image_url = $proto . '://' . $_SERVER['HTTP_HOST'] . rtrim(dirname($_SERVER['SCRIPT_NAME']),'/') . '/' . $fname;
    $ch = curl_init("https://graph.facebook.com/v20.0/{$IG_USER_ID}/media");
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_POST=>true,
        CURLOPT_POSTFIELDS=>['image_url'=>$image_url,'caption'=>$caption,'access_token'=>$IG_PAGE_TOKEN],
        CURLOPT_SSL_VERIFYPEER=>false]);
    $r1 = json_decode(curl_exec($ch), true); curl_close($ch);
    if (isset($r1['error'])) { @unlink($fpath); echo json_encode(['error'=>$r1['error']['message']]); exit; }
    sleep(5);
    $ch = curl_init("https://graph.facebook.com/v20.0/{$IG_USER_ID}/media_publish");
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_POST=>true,
        CURLOPT_POSTFIELDS=>['creation_id'=>$r1['id'],'access_token'=>$IG_PAGE_TOKEN],
        CURLOPT_SSL_VERIFYPEER=>false]);
    $r2 = json_decode(curl_exec($ch), true); curl_close($ch);
    @unlink($fpath);
    if (isset($r2['error'])) { echo json_encode(['error'=>$r2['error']['message']]); exit; }
    echo json_encode(['success'=>true,'post_id'=>$r2['id']??'']); exit;
}

$XML_URL    = 'https://universal-ftp2.s3.us-west-2.amazonaws.com/chavesnamao/naplanta-chaves-na-mao-6873-ambos.xml';
$CACHE_FILE = __DIR__ . '/cache_imoveis.json';
$LOCK_FILE  = __DIR__ . '/cache_update.lock';
$CACHE_TTL  = 1800; // 30 minutos
$ja_respondeu = false;

// ── STALE-WHILE-REVALIDATE ────────────────────────────────────────────────────
// Se cache existe (válido ou expirado), serve imediatamente.
// Se expirado, dispara atualização em background — o usuário não espera.
if (file_exists($CACHE_FILE)) {
    $cache_age   = time() - filemtime($CACHE_FILE);
    $cache_valid = $cache_age < $CACHE_TTL;
    $cached      = file_get_contents($CACHE_FILE);

    if ($cache_valid) {
        echo $cached; exit; // Cache fresco — resposta imediata
    }

    // Cache expirado — serve stale agora, atualiza em background
    $lock_age = file_exists($LOCK_FILE) ? (time() - filemtime($LOCK_FILE)) : 999;
    $updating = ($lock_age < 60); // já tem update em andamento

    echo $cached; // usuário recebe resposta na hora
    $ja_respondeu = true;

    if ($updating) exit; // outro processo já está atualizando

    // Marca lock e libera o cliente antes de continuar
    @touch($LOCK_FILE);
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    } else {
        header('Connection: close');
        $sz = ob_get_length();
        if ($sz !== false) header('Content-Length: ' . $sz);
        ob_end_flush(); flush();
    }
}

// ── BUSCA XML (primeira carga ou atualização em background) ───────────────────
$ctx = stream_context_create([
    'http' => [
        'timeout'        => 25,
        'method'         => 'GET',
        'follow_location'=> 1,
        'user_agent'     => 'Mozilla/5.0 NaPlanta-Bot/1.0',
    ],
    'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
]);

$xml_raw = @file_get_contents($XML_URL, false, $ctx);

if (!$xml_raw && function_exists('curl_init')) {
    $ch = curl_init($XML_URL);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 25,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_USERAGENT      => 'Mozilla/5.0 NaPlanta-Bot/1.0',
    ]);
    $xml_raw = curl_exec($ch);
    curl_close($ch);
}

@unlink($LOCK_FILE);

if (!$xml_raw || strlen($xml_raw) < 100) {
    if ($ja_respondeu) exit; // background: falhou, mantém cache antigo
    if (file_exists($CACHE_FILE)) { echo file_get_contents($CACHE_FILE); exit; }
    http_response_code(503);
    echo json_encode(['erro' => 'Não foi possível buscar o XML', 'imoveis' => []]);
    exit;
}

// Parse XML
libxml_use_internal_errors(true);
$xml = simplexml_load_string($xml_raw, 'SimpleXMLElement', LIBXML_NOCDATA);

if (!$xml) {
    http_response_code(500);
    echo json_encode(['erro' => 'XML inválido', 'imoveis' => []]);
    exit;
}

// Namespaces (o XML usa namespace vivareal)
$ns = $xml->getNamespaces(true);
$listings = $xml->Listings->Listing ?? [];

$imoveis = [];

foreach ($listings as $l) {
    $id      = (string)($l->ListingID ?? '');
    $titulo  = (string)($l->Title ?? '');
    $transac = (string)($l->Details->TransactionType ?? $l->TransactionType ?? '');
    // Alguns campos ficam em Details
    $det     = $l->Details ?? $l;
    $loc     = $l->Location ?? null;
    $media   = $l->Media ?? null;

    $preco   = (int)(string)($det->ListPrice ?? 0);
    $aluguel = (int)(string)($det->RentalPrice ?? 0);
    $tipo    = (string)($det->PropertyType ?? '');
    $area    = (string)($det->ConstructedArea ?? $det->LivingArea ?? '');
    $quartos = (string)($det->Bedrooms ?? '');
    $banhos  = (string)($det->Bathrooms ?? '');
    $suites  = (string)($det->Suites ?? '');
    $vagas   = (string)($det->Garage ?? '');
    $descri  = trim((string)($det->Description ?? ''));
    $condo   = (string)($l->Building ?? '');
    $pubtype = strtoupper(trim((string)($l->PublicationType ?? $det->PublicationType ?? '')));

    $bairro  = $loc ? (string)($loc->Neighborhood ?? '') : '';
    $cidade  = $loc ? (string)($loc->City ?? '') : '';
    $estado  = $loc ? (string)($loc->State ?? '') : '';
    $lat     = $loc ? (string)($loc->Latitude ?? '') : '';
    $lng     = $loc ? (string)($loc->Longitude ?? '') : '';

    // Fotos — pega apenas a principal e mais 3
    $fotos = [];
    if ($media) {
        foreach ($media->Item as $item) {
            $medium = (string)($item['medium'] ?? 'image');
            if ($medium === 'image') {
                $fotos[] = (string)$item;
                // sem limite - todas as fotos
            }
        }
    }

    // Limpa descrição — remove rodapé genérico repetitivo
    $descri = preg_replace('/Bairro Kobrasol.*$/si', '', $descri);
    $descri = trim($descri);

    if (!$id) continue;

    $imoveis[] = [
        'id'      => $id,
        'titulo'  => $titulo,
        'tipo'    => $tipo,
        'transac' => $transac,
        'preco'   => $preco,
        'aluguel' => $aluguel,
        'area'    => $area,
        'quartos' => $quartos,
        'banhos'  => $banhos,
        'suites'  => $suites,
        'vagas'   => $vagas,
        'bairro'  => $bairro,
        'cidade'  => $cidade,
        'estado'  => $estado,
        'condo'   => $condo,
        'descri'  => mb_substr($descri, 0, 600),
        'lat'     => str_replace(',', '.', $lat),
        'lng'     => str_replace(',', '.', $lng),
        'fotos'   => $fotos,
        'pubtype' => $pubtype,
    ];
}

$resultado = [
    'total'      => count($imoveis),
    'atualizado' => date('d/m/Y H:i'),
    'imoveis'    => $imoveis,
];

$json = json_encode($resultado, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

// Salva cache
file_put_contents($CACHE_FILE, $json);

// Só envia ao cliente se ainda não respondemos (primeira carga sem cache)
if (!$ja_respondeu) {
    echo $json;
}
