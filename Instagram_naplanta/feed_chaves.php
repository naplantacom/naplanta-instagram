<?php
/**
 * NaPlanta - Gerador de Feed XML (formato VivaReal/VRSync) via API Imoview em tempo real
 * Portal: Chaves na Mão
 *
 * Substitui o feed estático hospedado em S3
 * (https://universal-ftp2.s3.us-west-2.amazonaws.com/chavesnamao/naplanta-chaves-na-mao-6873-ambos.xml)
 * que demora para refletir alterações — este gera o XML na hora, a partir da
 * API do Imoview, então qualquer mudança no painel já aparece no próximo
 * carregamento do feed.
 *
 * Diferenças em relação ao feed_olx.php (Grupo OLX/VivaReal):
 *  - Apenas 2 níveis de qualificação: Sem Destaque (STANDARD) e Destaque (PREMIUM)
 *  - Limite total configurável em 100/200/300 (chaves_config.json)
 *
 * Para usar: aponte o portal "Chaves na Mão" para a URL pública deste arquivo,
 * ex: https://www.virtualnaplanta.com.br/instagram/feed_chaves.php
 */

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: no-store');

// ── CONFIG ────────────────────────────────────────────────────────────────────
$IMOVIEW_CHAVE = 'ce7a626282831e304b63307b5d1e88b9';
$IMOVIEW_URL   = 'https://api.imoview.com.br/Imovel/RetornarImoveisDisponiveis';
$REGISTROS_POR_PAGINA = 20;
$CACHE_FILE = __DIR__ . '/cache_feed_chaves.xml';
$CACHE_TTL  = 600; // 10 minutos

$PROVIDER   = 'NAPLANTA.COM ';
$EMAIL      = 'aluguel@naplanta.com';
$TELEFONE   = '48991531668';
$LOGO       = 'https://cdn.imoview.com.br/naplanta/logo-1726085996.png';

// ── CACHE ─────────────────────────────────────────────────────────────────────
if (file_exists($CACHE_FILE) && (time() - filemtime($CACHE_FILE)) < $CACHE_TTL) {
    echo file_get_contents($CACHE_FILE);
    exit;
}

// ── BUSCA NA API IMOVIEW (mesma lógica do proxy_imoview.php) ─────────────────
function imoview_buscar_pagina($finalidade, $pagina, $registros) {
    global $IMOVIEW_URL, $IMOVIEW_CHAVE;
    $payload = json_encode([
        'finalidade'      => $finalidade,
        'numeropagina'    => $pagina,
        'numeroregistros' => $registros,
        'exibiranexos'    => true,
    ]);
    $ch = curl_init($IMOVIEW_URL);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => ['chave: ' . $IMOVIEW_CHAVE, 'Content-Type: application/json'],
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $resp = curl_exec($ch);
    curl_close($ch);
    return json_decode($resp, true);
}
function imoview_buscar_todos($finalidade) {
    global $REGISTROS_POR_PAGINA;
    $todos = []; $pagina = 1;
    do {
        $r = imoview_buscar_pagina($finalidade, $pagina, $REGISTROS_POR_PAGINA);
        if (!$r || empty($r['lista'])) break;
        $todos = array_merge($todos, $r['lista']);
        $pagina++;
    } while (count($todos) < (int)($r['quantidade'] ?? 0));
    return $todos;
}
function valor_int($s) {
    $n = str_replace(',', '.', preg_replace('/[^\d,]/', '', (string)$s));
    return (int) round((float)$n);
}

// ── MAPEAMENTO Imoview -> VivaReal/OLX (Details/PropertyType) ────────────────
// codigotipo do Imoview => [UsageType, PropertyType-suffix]
function mapear_tipo($im) {
    $destinacao = strtolower((string)($im['destinacao'] ?? ''));
    $tipo       = strtolower((string)($im['tipo'] ?? ''));

    $usage = 'Residential';
    if (strpos($destinacao, 'comerc') !== false && strpos($destinacao, 'residen') !== false) $usage = 'Residential / Commercial';
    elseif (strpos($destinacao, 'comerc') !== false) $usage = 'Commercial';
    elseif (strpos($destinacao, 'industr') !== false) $usage = 'Commercial';
    elseif (strpos($destinacao, 'rural') !== false) $usage = 'Residential';

    // Mapa de tipo -> sufixo do PropertyType (categoria/subtipo no schema VRSync)
    $map = [
        'apartamento'        => 'Residential / Apartment',
        'casa'               => 'Residential / Home',
        'sobrado'            => 'Residential / Sobrado',
        'cobertura'          => 'Residential / Penthouse',
        'flat'               => 'Residential / Flat',
        'condom'             => 'Residential / Condo',
        'terreno'            => 'Residential / Land Lot',
        'lote'               => 'Residential / Land Lot',
        'sítio'              => 'Residential / Farm',
        'sitio'              => 'Residential / Farm',
        'chácara'            => 'Residential / Farm',
        'chacara'            => 'Residential / Farm',
        'fazenda'            => 'Residential / Farm',
        'rancho'             => 'Residential / Farm',
        'loja'               => 'Commercial / Business',
        'sala'               => 'Commercial / Office',
        'galp'               => 'Commercial / Industrial',
        'ponto comercial'    => 'Commercial / Business',
        'prédio'             => 'Commercial / Business',
        'predio'             => 'Commercial / Business',
    ];
    $property_type = 'Residential / Apartment'; // fallback razoável
    foreach ($map as $chave => $valor) {
        if (strpos($tipo, $chave) !== false) { $property_type = $valor; break; }
    }
    // Ajusta UsageType conforme prefixo do PropertyType encontrado
    if (strpos($property_type, 'Commercial') === 0 && $usage === 'Residential') $usage = 'Commercial';

    return [$usage, $property_type];
}

// ── ITENS DE ÁREA COMUM E ÁREA PRIVATIVA (Features do VRSync) ────────────────
// Mapeia as comodidades booleanas retornadas pela API do Imoview para os
// códigos de "Feature" do schema VRSync (VivaReal/Grupo OLX/Chaves na Mão).
// Cobre tanto itens de área comum do condomínio (piscina, salão de festas,
// academia etc.) quanto itens da área privativa do imóvel (mobiliado, closet,
// área de serviço etc.). Ajustar/completar conforme o manual do portal.
if (!function_exists('montar_features')) {
    function montar_features($im) {
        $map = [
            // Área comum / condomínio
            'piscina'          => 'POOL',
            'academia'         => 'GYM',
            'salaofestas'      => 'PARTY_HALL',
            'salaojogos'       => 'GAMES_ROOM',
            'playground'       => 'PLAYGROUND',
            'churrasqueira'    => 'BARBECUE_GRILL',
            'sauna'            => 'SAUNA',
            'quadratenis'      => 'TENNIS_COURT',
            'quadraesportiva'  => 'SPORTS_COURT',
            'quadrasquash'     => 'SQUASH_COURT',
            'homecinema'       => 'HOME_THEATER',
            'salamassagem'     => 'SPA',
            'hidromassagem'    => 'HOT_TUB',
            'portaria24horas'  => 'CONCIERGE_24H',
            'seguranca24horas' => 'SECURITY_24H',
            'portaoeletronico' => 'ELECTRONIC_GATE',
            'circuitotv'       => 'VIDEO_MONITORING',
            'quintal'          => 'BACKYARD',
            'gramado'          => 'GARDEN',
            // Área privativa / unidade
            'mobiliado'        => 'FURNISHED',
            'arcondicionado'   => 'AIR_CONDITIONING',
            'areaservico'      => 'SERVICE_AREA',
            'closet'           => 'CLOSET',
            'escritorio'       => 'OFFICE',
            'lavabo'           => 'TOILET_FOR_EMPLOYEES',
            'lavanderia'       => 'LAUNDRY_ROOM',
            'armariocozinha'   => 'KITCHEN_CABINETS',
            'armarioquarto'    => 'BUILT_IN_WARDROBE',
            'armariobanheiro'  => 'BUILT_IN_WARDROBE',
            'box'              => 'SHOWER',
            'despensa'         => 'PANTRY',
            'rouparia'         => 'TROUSSEAU',
            'varandagourmet'   => 'GOURMET_BALCONY',
            'espacogourmet'    => 'GOURMET_AREA',
            'jardim'           => 'GARDEN',
            'lareira'          => 'FIREPLACE',
            'wifi'             => 'WI_FI',
            'interfone'        => 'INTERCOM',
            'gascanalizado'    => 'GAS_PIPELINE',
            'permiteanimais'   => 'PETS_ALLOWED',
            'vistamar'         => 'SEA_VIEW',
            'vistamontanha'    => 'MOUNTAIN_VIEW',
            'vistalago'        => 'LAKE_VIEW',
        ];
        $features = [];
        foreach ($map as $campo => $codigo) {
            if (!empty($im[$campo])) $features[] = $codigo;
        }
        if ((int)($im['numeroelevador'] ?? 0) > 0) $features[] = 'ELEVATOR';
        return array_values(array_unique($features));
    }
}

function xml_escape($s) { return htmlspecialchars((string)$s, ENT_QUOTES | ENT_XML1, 'UTF-8'); }
function cdata($s) { return '<![CDATA[' . str_replace(']]>', ']]]]><![CDATA[>', (string)$s) . ']]>'; }
function lat_lng_virgula($v) {
    // VRSync usa vírgula decimal: "-27,5944706"
    $v = (string)$v;
    return $v === '' ? '' : str_replace('.', ',', $v);
}

// ── BUSCA DADOS ───────────────────────────────────────────────────────────────
$venda   = imoview_buscar_todos(2);
$aluguel = imoview_buscar_todos(1);
$todos   = array_merge(
    array_map(function($i){ $i['_eh_aluguel'] = false; return $i; }, $venda),
    array_map(function($i){ $i['_eh_aluguel'] = true;  return $i; }, $aluguel)
);

if (count($todos) === 0 && file_exists($CACHE_FILE)) {
    echo file_get_contents($CACHE_FILE);
    exit;
}

// ── PORTAIS IMOBILIÁRIOS — aplica destaques e limite total definidos na tela ──
$CHAVES_CONFIG_FILE = __DIR__ . '/chaves_config.json';
$chaves_config      = file_exists($CHAVES_CONFIG_FILE) ? json_decode(file_get_contents($CHAVES_CONFIG_FILE), true) : null;
$chaves_config      = $chaves_config ?: ['limit' => 100, 'qualif' => [], 'endereco' => 'completo', 'endereco_aluguel' => 'completo'];
$qualif_map         = is_array($chaves_config['qualif'] ?? null) ? $chaves_config['qualif'] : [];
$limit_total        = (int)($chaves_config['limit'] ?? 100);
$endereco_modo_venda   = (($chaves_config['endereco'] ?? 'completo') === 'aproximado') ? 'aproximado' : 'completo';
$endereco_modo_aluguel = (($chaves_config['endereco_aluguel'] ?? 'completo') === 'aproximado') ? 'aproximado' : 'completo';
$renovacao_ativa       = !isset($chaves_config['renovacao']) || $chaves_config['renovacao'] !== false;

// ── DESCONTOS POR IMÓVEL — badge "-X% OFF" / "-R$ X OFF" na foto de capa ─────
$DESCONTOS_CONFIG_FILE = __DIR__ . '/descontos_config.json';
$descontos_config = file_exists($DESCONTOS_CONFIG_FILE) ? json_decode(file_get_contents($DESCONTOS_CONFIG_FILE), true) : [];
$descontos_config = is_array($descontos_config) ? $descontos_config : [];

if (!function_exists('texto_desconto')) {
    function texto_desconto($desconto) {
        if (!is_array($desconto)) return '';
        $tipo  = $desconto['tipo'] ?? '';
        $valor = (float)($desconto['valor'] ?? 0);
        if ($valor <= 0) return '';
        if ($tipo === 'valor') {
            return '-R$ ' . number_format($valor, 0, ',', '.') . ' OFF';
        }
        $valor = (fmod($valor, 1) === 0.0) ? (int)$valor : $valor;
        return '-' . $valor . '% OFF';
    }
}
if (!function_exists('badge_url')) {
    function badge_url($urlFoto, $textoBadge) {
        return 'https://www.virtualnaplanta.com.br/instagram/feed_badge.php?src=' . rawurlencode($urlFoto) . '&txt=' . rawurlencode($textoBadge);
    }
}

// Renovação automática "orgânica": gira a ordem das fotos e dos parágrafos da
// descrição a cada dia (com base na data + código do imóvel), sem alterar nada
// no cadastro do Imoview. Desligar a opção na tela "Portais Imobiliários" faz
// o feed voltar a sair exatamente como no Imoview.
if (!function_exists('renovacao_organica')) {
    function renovacao_organica($im, $ativo) {
        if (!$ativo) return $im;
        $codigo = (int)($im['codigo'] ?? 0);
        $dia    = (int)date('z'); // 0-365, muda todo dia

        // 1) Rotaciona a ordem das fotos (a capa muda diariamente)
        if (!empty($im['fotos']) && is_array($im['fotos']) && count($im['fotos']) > 1) {
            $n = count($im['fotos']);
            $offset = ($dia + $codigo) % $n;
            $im['fotos'] = array_merge(array_slice($im['fotos'], $offset), array_slice($im['fotos'], 0, $offset));
        }

        // 2) Reordena os parágrafos da descrição (mesmo conteúdo, ordem diferente)
        $desc = (string)($im['descricao'] ?? '');
        $partes = preg_split('/\r\n|\r|\n/', $desc);
        $partes = array_values(array_filter($partes, function ($p) { return trim($p) !== ''; }));
        if (count($partes) > 1) {
            $offset = ($dia + $codigo + 1) % count($partes);
            $partes = array_merge(array_slice($partes, $offset), array_slice($partes, 0, $offset));
            $im['descricao'] = implode("\n", $partes);
        }

        return $im;
    }
}

// Ordem de prioridade da qualificacao (maior primeiro) — Chaves na Mão so tem 2 niveis
$ordem_qualif = ['destaque' => 2, 'sem' => 1];

// Mapa qualificacao -> PublicationType (VRSync)
$publication_map = [
    'sem'       => 'STANDARD',
    'destaque'  => 'PREMIUM',
];

usort($todos, function ($a, $b) use ($qualif_map, $ordem_qualif) {
    $qa = $ordem_qualif[$qualif_map[(string)($a['codigo'] ?? '')] ?? 'sem'] ?? 1;
    $qb = $ordem_qualif[$qualif_map[(string)($b['codigo'] ?? '')] ?? 'sem'] ?? 1;
    if ($qa !== $qb) return $qb - $qa; // maior destaque primeiro
    return (int)($b['codigo'] ?? 0) - (int)($a['codigo'] ?? 0); // mais recentes primeiro
});

$todos = array_slice($todos, 0, $limit_total);

// ── MONTA O XML ───────────────────────────────────────────────────────────────
$now = date('Y-m-d\TH:i:s');
$out = [];
$out[] = '<?xml version="1.0" encoding="UTF-8"?>';
$out[] = '<ListingDataFeed xmlns="http://www.vivareal.com/schemas/1.0/VRSync" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.vivareal.com/schemas/1.0/VRSync http://xml.vivareal.com/vrsync.xsd">';
$out[] = '  <Header>';
$out[] = '    <Provider>' . xml_escape($PROVIDER) . '</Provider>';
$out[] = '    <Email>' . xml_escape($EMAIL) . '</Email>';
$out[] = '    <ContactName>' . xml_escape($PROVIDER) . '</ContactName>';
$out[] = '    <Telephone>' . xml_escape($TELEFONE) . '</Telephone>';
$out[] = '    <PublishDate>' . $now . '</PublishDate>';
$out[] = '    <Logo>' . xml_escape($LOGO) . '</Logo>';
$out[] = '  </Header>';
$out[] = '  <Listings>';

foreach ($todos as $im) {
    $eh_aluguel = $im['_eh_aluguel'];
    $im = renovacao_organica($im, $renovacao_ativa);
    $endereco_modo = $eh_aluguel ? $endereco_modo_aluguel : $endereco_modo_venda;
    list($usage, $property_type) = mapear_tipo($im);

    $preco       = valor_int($im['valor'] ?? 0);
    $list_price  = $eh_aluguel ? 0 : $preco;
    $rent_price  = $eh_aluguel ? $preco : 0;
    $condominio  = valor_int($im['valorcondominio'] ?? 0);
    $iptu        = valor_int($im['valoriptu'] ?? 0);
    // Quando o Imoview não tem o valor do IPTU cadastrado (ou é 0), o portal
    // pede um valor simbólico mínimo em vez de "0" para não reprovar o anúncio.
    if ($iptu <= 0) $iptu = 10;

    // Qualificacao definida na tela "Portais Imobiliarios" tem prioridade.
    // Se o imovel nao foi qualificado por la, cai no fallback antigo: classifica
    // PREMIUM x STANDARD com base no campo "destaque" do Imoview
    // (valores possíveis: "Simples", "Destaque", "Super destaque",
    //  "Premiere (Destaque especial)", "Premiere (Destaque premium)")
    $codigo_im = (string)($im['codigo'] ?? '');
    if (isset($qualif_map[$codigo_im])) {
        $publication_type = $publication_map[$qualif_map[$codigo_im]] ?? 'STANDARD';
    } else {
        $destaque_txt      = strtolower(trim((string)($im['destaque'] ?? '')));
        $publication_type  = ($destaque_txt !== '' && $destaque_txt !== 'simples') ? 'PREMIUM' : 'STANDARD';
    }

    $out[] = '    <Listing>';
    $out[] = '      <ListingID>' . xml_escape($im['codigo'] ?? '') . '</ListingID>';
    $out[] = '      <Title>' . cdata($im['titulo'] ?? '') . '</Title>';
    $out[] = '      <TransactionType>' . ($eh_aluguel ? 'For Rent' : 'For Sale') . '</TransactionType>';
    $out[] = '      <PublicationType>' . $publication_type . '</PublicationType>';
    $out[] = '      <DetailViewUrl></DetailViewUrl>';
    $out[] = '      <VirtualTourLink>' . xml_escape($im['urlvideo'] ?? '') . '</VirtualTourLink>';
    $out[] = '      <Building>' . xml_escape($im['nomecondominio'] ?? $im['edificio'] ?? '') . '</Building>';
    $out[] = '      <Status>';
    $out[] = '        <PropertyStatus>Available</PropertyStatus>';
    $out[] = '        <StatusDate>' . $now . '</StatusDate>';
    $out[] = '        <ClosingPrice currency="BRL">0</ClosingPrice>';
    $out[] = '      </Status>';
    $out[] = '      <Details>';
    $out[] = '        <UsageType>' . xml_escape($usage) . '</UsageType>';
    $out[] = '        <PropertyType>' . xml_escape($property_type) . '</PropertyType>';
    $out[] = '        <ListPrice currency="BRL">' . $list_price . '</ListPrice>';
    $out[] = '        <RentalPrice currency="BRL" period="Monthly">' . $rent_price . '</RentalPrice>';
    $out[] = '        <PropertyAdministrationFee currency="BRL" period="Monthly">' . $condominio . '</PropertyAdministrationFee>';
    $out[] = '        <AvailableDate>' . $now . '</AvailableDate>';
    $area_construida = (int)round((float)str_replace(',', '.', (string)($im['areaprincipal'] ?? 0)));
    $area_interna    = (int)round((float)str_replace(',', '.', (string)($im['areainterna'] ?? $im['areaprincipal'] ?? 0)));
    $area_terreno    = (int)round((float)str_replace(',', '.', (string)($im['areaterreno'] ?? 0)));
    $num_quartos     = (int)($im['numeroquartos'] ?? 0);
    $num_banheiros   = (int)($im['numerobanhos'] ?? 0);
    $num_suites      = (int)($im['numerosuites'] ?? 0);
    $num_vagas       = (int)($im['numerovagas'] ?? 0);
    // Campos com faixa de validação (ex.: área útil 10–5000, quartos/banheiros 1–40)
    // só devem ser enviados quando houver valor real — em terrenos/lotes/sítios não se aplicam.
    if ($area_construida > 0) $out[] = '        <ConstructedArea unit="square metres">' . $area_construida . '</ConstructedArea>';
    if ($area_terreno > 0)    $out[] = '        <LotArea unit="square metres">' . $area_terreno . '</LotArea>';
    if ($area_interna > 0)    $out[] = '        <LivingArea unit="square metres">' . $area_interna . '</LivingArea>';
    $out[] = '        <DevelopmentLevel>' . (strpos($property_type, 'Land Lot') !== false ? 'Land' : 'Built') . '</DevelopmentLevel>';
    $out[] = '        <YearBuilt>' . (int)($im['anoconstrucao'] ?? 0) . '</YearBuilt>';
    if ($num_quartos > 0)   $out[] = '        <Bedrooms>' . $num_quartos . '</Bedrooms>';
    if ($num_banheiros > 0) $out[] = '        <Bathrooms>' . $num_banheiros . '</Bathrooms>';
    if ($num_suites > 0)    $out[] = '        <Suites>' . $num_suites . '</Suites>';
    if ($num_vagas > 0)     $out[] = '        <Garage type="Parking Space">' . $num_vagas . '</Garage>';
    $out[] = '        <Floors>' . (int)($im['numeroandares'] ?? 0) . '</Floors>';
    $out[] = '        <UnitFloor>' . (int)($im['numeroandar'] ?? 0) . '</UnitFloor>';
    $out[] = '        <UnitNumber></UnitNumber>';
    $out[] = '        <Iptu currency="BRL" period="Monthly">' . $iptu . '</Iptu>';
    $out[] = '        <Description>' . cdata($im['descricao'] ?? '') . '</Description>';
    $features = montar_features($im);
    if (!empty($features)) {
        $out[] = '        <Features>';
        foreach ($features as $feat) {
            $out[] = '          <Feature>' . xml_escape($feat) . '</Feature>';
        }
        $out[] = '        </Features>';
    }
    $out[] = '      </Details>';
    $out[] = '      <Location displayAddress="' . ($endereco_modo === 'aproximado' ? 'Neighborhood' : 'Street') . '">';
    $out[] = '        <Country abbreviation="BR">Brasil</Country>';
    $out[] = '        <State abbreviation="' . xml_escape($im['estado'] ?? '') . '">' . xml_escape($im['estado'] ?? '') . '</State>';
    $out[] = '        <City>' . xml_escape($im['cidade'] ?? '') . '</City>';
    $out[] = '        <Zone></Zone>';
    $out[] = '        <Neighborhood>' . xml_escape($im['bairro'] ?? '') . '</Neighborhood>';
    $out[] = '        <Address>' . ($endereco_modo === 'aproximado' ? '' : xml_escape($im['endereco'] ?? '')) . '</Address>';
    // O Imoview retorna o número/complemento mascarados ("***") por privacidade
    // — não enviar esse valor mascarado ao portal (campo fica vazio).
    $numero_im = (string)($im['numero'] ?? '');
    $numero_ok = ($numero_im !== '' && strpos($numero_im, '*') === false) ? $numero_im : '';
    $out[] = '        <StreetNumber>' . ($endereco_modo === 'aproximado' ? '' : xml_escape($numero_ok)) . '</StreetNumber>';
    $out[] = '        <Complement></Complement>';
    $out[] = '        <PostalCode>' . xml_escape(str_replace('-', '', (string)($im['cep'] ?? ''))) . '</PostalCode>';
    $out[] = '        <Latitude>' . lat_lng_virgula($im['latitude'] ?? '') . '</Latitude>';
    $out[] = '        <Longitude>' . lat_lng_virgula($im['longitude'] ?? '') . '</Longitude>';
    $out[] = '      </Location>';
    $out[] = '      <ContactInfo>';
    $out[] = '        <Name>' . xml_escape($PROVIDER) . '</Name>';
    $out[] = '        <OfficeName>' . xml_escape($PROVIDER) . '</OfficeName>';
    $out[] = '        <Email>' . xml_escape($EMAIL) . '</Email>';
    $out[] = '        <Telephone>' . xml_escape($TELEFONE) . '</Telephone>';
    $out[] = '        <Website></Website>';
    $out[] = '        <Logo>' . xml_escape($LOGO) . '</Logo>';
    $out[] = '      </ContactInfo>';
    $out[] = '      <Media>';
    $texto_badge = texto_desconto($descontos_config[$codigo_im] ?? null);
    if (!empty($im['fotos']) && is_array($im['fotos'])) {
        foreach ($im['fotos'] as $i => $f) {
            $url = $f['url'] ?? $f['urlp'] ?? $f['urlm'] ?? '';
            if (!$url) continue;
            $primary = ($i === 0) ? 'true' : 'false';
            // Foto de capa do anúncio recebe a badge de desconto (quando configurado)
            if ($i === 0 && $texto_badge !== '') $url = badge_url($url, $texto_badge);
            $out[] = '        <Item medium="image" caption="" primary="' . $primary . '">' . xml_escape($url) . '</Item>';
        }
    }
    $out[] = '      </Media>';
    $out[] = '    </Listing>';
}

$out[] = '  </Listings>';
$out[] = '</ListingDataFeed>';

$xml = implode("\n", $out);
file_put_contents($CACHE_FILE, $xml);
echo $xml;
