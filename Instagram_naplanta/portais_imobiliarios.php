<?php
header('Access-Control-Allow-Origin: *');

// ── Autenticação por cookie (mesma senha/cookie do Tráfego Pago — entra em um, entra em todos) ──
$PAINEL_SENHA  = '090721';
$_COOKIE_NAME  = 'np_auth';
$_COOKIE_TOKEN = hash('sha256', $PAINEL_SENHA . 'naplanta2024');

if (isset($_GET['logout'])) {
    setcookie($_COOKIE_NAME, '', time() - 3600, '/');
    header('Location: ' . basename(__FILE__)); exit;
}

if (isset($_POST['senha'])) {
    if ($_POST['senha'] === $PAINEL_SENHA) {
        setcookie($_COOKIE_NAME, $_COOKIE_TOKEN, time() + 60*60*24*30, '/');
        header('Location: ' . basename(__FILE__)); exit;
    } else {
        $tp_erro = true;
    }
}

$_autenticado = isset($_COOKIE[$_COOKIE_NAME]) && $_COOKIE[$_COOKIE_NAME] === $_COOKIE_TOKEN;

if (!$_autenticado) {
    $erro = !empty($tp_erro);
    ?><!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acesso — Portais Imobiliários</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
      body{display:flex;align-items:center;justify-content:center;height:100vh;background:#F2F2F0}
      .box{background:#fff;border:1px solid #E4E1DA;border-radius:14px;padding:34px;max-width:340px;width:100%;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.06)}
      .box img{height:46px;margin-bottom:18px}
      h1{font-size:1rem;margin-bottom:16px;color:#5B5B57;font-weight:600}
      input{width:100%;padding:11px;border:1px solid #DDD;border-radius:8px;font-size:.9rem;margin-bottom:12px}
      button{width:100%;padding:11px;background:linear-gradient(180deg,#D72525,#C01919);color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(200,30,30,.28)}
      .erro{color:#C0392B;font-size:.8rem;margin-bottom:10px}
    </style></head><body>
    <form class="box" method="post" action="portais_imobiliarios.php">
      <img src="https://www.virtualnaplanta.com.br/instagram/logo_naplanta.png" alt="NaPlanta">
      <h1>Acesso restrito — Portais Imobiliários</h1>
      <p style="font-size:.75rem;color:#999;margin-bottom:14px">OLX &middot; VivaReal &middot; Grupo OLX &middot; Chaves na M&atilde;o</p>
      <?php if ($erro): ?><div class="erro">Senha incorreta, tente novamente.</div><?php endif; ?>
      <input type="password" name="senha" placeholder="Senha de acesso" autofocus required>
      <button type="submit">Entrar</button>
    </form>
    </body></html><?php
    exit;
}
?><!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Portais Imobiliários — NaPlanta</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap">
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:'Inter',sans-serif}
body{background:#eef0f2;color:#222}
.container{max-width:1240px;margin:0 auto;padding:1.2rem}
header{background:#0A0A0A;padding:.7rem 2rem;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #E60000;flex-wrap:wrap;gap:.5rem;margin-bottom:1.2rem}
.header-logo img{height:36px;width:auto;display:block}
.header-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.sync-btn{padding:6px 14px;background:transparent;border:1px solid #333;border-radius:3px;color:#888;font-size:.75rem;cursor:pointer;font-family:inherit;text-decoration:none;display:inline-block}
.sync-btn:hover{border-color:#E60000;color:#E60000}
.sync-btn:disabled{opacity:.4;cursor:not-allowed}
.status-pill{font-size:.72rem;color:#555;padding:4px 10px;background:#1a1a1a;border-radius:20px;white-space:nowrap}
.status-pill.ok{color:#4caf50}.status-pill.erro{color:#E60000}
.box{background:#fff;border-radius:12px;border:1px solid #ddd;border-top:4px solid #E60000;box-shadow:0 8px 30px rgba(0,0,0,.06);padding:1.4rem}
.portais-tabs{display:flex;gap:8px;margin-bottom:.9rem}
.portais-tab{
  flex:1;padding:10px;background:#f4f5f7;border:1px solid #ddd;border-radius:6px;
  color:#888;font-family:inherit;font-size:.82rem;font-weight:700;text-transform:uppercase;
  letter-spacing:.06em;cursor:pointer;transition:all .15s;
}
.portais-tab.active{border-color:#E60000;color:#E60000;background:#fff}
.portais-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:.8rem;flex-wrap:wrap}
.portais-toolbar label{font-size:.7rem;color:#777;text-transform:uppercase;letter-spacing:.06em;font-weight:600}
.portais-toolbar select{
  padding:8px 10px;background:#fff;border:1px solid #ccc;border-radius:6px;
  color:#222;font-family:inherit;font-size:.8rem;outline:none;
}
.portais-count{font-size:.74rem;color:#777;margin-left:auto}
.portais-totais{
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;
  padding:8px 12px;background:#f4f5f7;border:1px solid #ddd;border-radius:6px;margin-bottom:.8rem;
}
.portais-totais-main{font-size:.78rem;color:#333;font-weight:700}
.portais-totais-main.over-limit{color:#E60000}
.portais-totais-break{font-size:.7rem;color:#888}
.portais-bulk{
  display:flex;align-items:center;gap:8px;margin-bottom:.9rem;padding:10px;
  background:#f4f5f7;border:1px solid #ddd;border-radius:6px;flex-wrap:wrap;
}
.portais-bulk label{font-size:.7rem;color:#777;text-transform:uppercase;letter-spacing:.06em;font-weight:600}
.portais-bulk select{
  padding:8px 10px;background:#fff;border:1px solid #ccc;border-radius:6px;
  color:#222;font-family:inherit;font-size:.8rem;outline:none;cursor:pointer;
}
.portais-bulk input{
  padding:8px 10px;background:#fff;border:1px solid #ccc;border-radius:6px;
  color:#222;font-family:inherit;font-size:.8rem;outline:none;width:120px;
}
.portais-bulk button{
  padding:8px 16px;background:#E60000;color:#fff;border:none;border-radius:6px;
  font-family:inherit;font-size:.78rem;font-weight:700;text-transform:uppercase;
  letter-spacing:.05em;cursor:pointer;
}
.portais-bulk button:hover{background:#c40000}
.portais-board{
  display:grid;grid-template-columns:repeat(5,minmax(190px,1fr));grid-template-rows:1fr;gap:14px;
  height:60vh;min-height:380px;overflow-x:auto;
}
.portais-col{display:flex;flex-direction:column;border:1px solid #ddd;border-radius:8px;overflow:hidden;background:#fbfbfc;height:100%;min-height:0;min-width:190px;transition:outline .1s}
.portais-col.drag-over{outline:2px dashed #E60000;outline-offset:-2px}
.portais-col-header{
  padding:11px 14px;color:#fff;font-weight:700;font-size:.8rem;
  display:flex;align-items:center;justify-content:space-between;text-transform:uppercase;letter-spacing:.04em;
}
.portais-col-header.q-col-todos{background:#3a3a3a}
.portais-col-header.q-col-sem{background:#9aa6b2}
.portais-col-header.q-col-destaque{background:#4a90d9}
.portais-col-header.q-col-super{background:#26a69a}
.portais-col-header.q-col-exclusivo{background:#E60000}
.portais-col-count{
  background:rgba(255,255,255,.3);border-radius:50%;min-width:24px;height:24px;padding:0 4px;
  display:flex;align-items:center;justify-content:center;font-size:.74rem;font-weight:700;
}
.portais-col-count.over-limit{background:#fff;color:#E60000}
.portais-col-body{flex:1;overflow-y:auto;padding:8px;min-height:0}
.portais-row{display:flex;flex-direction:column;gap:6px;padding:9px;border-bottom:1px solid #eee;background:#fff;cursor:grab}
.portais-row:last-child{border-bottom:none}
.portais-row.dragging{opacity:.35}
.portais-row.selected{background:#fff3cd;box-shadow:inset 3px 0 0 #E60000}
.portais-row-top{display:flex;align-items:center;gap:8px}
.portais-row img,.portais-row-ph{width:42px;height:42px;border-radius:5px;object-fit:cover;flex-shrink:0;background:#eee}
.portais-row-info{flex:1;min-width:0}
.portais-row-title{font-size:.76rem;color:#222;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.portais-row-meta{font-size:.68rem;color:#888;margin-top:2px}
.portais-row select{
  width:100%;padding:6px 8px;background:#fff;border:1px solid #ccc;border-radius:5px;
  color:#333;font-family:inherit;font-size:.7rem;outline:none;cursor:pointer;
}
.portais-row select.q-destaque{border-color:#4a90d9;color:#4a90d9}
.portais-row select.q-super{border-color:#26a69a;color:#26a69a}
.portais-row select.q-exclusivo{border-color:#E60000;color:#E60000}
.portais-row-tag{
  font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;
  padding:3px 6px;border-radius:4px;display:inline-block;width:fit-content;
  background:#eee;color:#888;
}
.portais-row-tag.q-destaque{background:#e8f1fb;color:#4a90d9}
.portais-row-tag.q-super{background:#e6f7f5;color:#26a69a}
.portais-row-tag.q-exclusivo{background:#fde8e8;color:#E60000}
.portais-col-empty{padding:16px;text-align:center;color:#aaa;font-size:.74rem}
.portais-footer{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:1.2rem;flex-wrap:wrap}
.portais-msg{font-size:.78rem;min-height:1rem}
.cad-btn{
  padding:11px 24px;background:#E60000;color:#fff;border:none;border-radius:6px;
  font-family:inherit;font-size:.8rem;font-weight:700;text-transform:uppercase;
  letter-spacing:.05em;cursor:pointer;text-decoration:none;text-align:center;
}
.cad-btn:hover{background:#c40000}
.cad-btn.alt{background:#444}
.cad-btn.alt:hover{background:#222}
.loading-msg,.empty-state{text-align:center;padding:2.5rem;color:#999;font-size:.85rem;grid-column:1/-1}
@media(max-width:1100px){.portais-board{grid-template-columns:repeat(5,200px)}}
@media(max-width:560px){.portais-board{height:70vh}.portais-col{height:100%}}
</style>
</head>
<body>
<header>
  <div class="header-logo">
    <img src="https://www.virtualnaplanta.com.br/instagram/logo_naplanta.png" alt="NaPlanta"/>
  </div>
  <div class="header-right">
    <span class="status-pill ok" id="status-pill">&#127970; Portais Imobili&aacute;rios</span>
    <a class="sync-btn" href="index.html">&larr; Voltar para Home</a>
    <button class="sync-btn" id="sync-btn" onclick="carregarTudo()">&#8635; Atualizar</button>
    <a class="sync-btn" href="meta_ads.php" target="_blank">&#128226; Tr&aacute;fego Pago</a>
    <a class="sync-btn" href="google_ads.php" target="_blank">&#128269; Google Ads</a>
    <a class="sync-btn" href="whatsapp_disparo.php" target="_blank">&#128172; WhatsApp</a>
    <a class="sync-btn" href="?logout=1">Sair</a>
  </div>
</header>
<div class="container">
  <div class="box">
    <div class="portais-tabs portais-secao-tabs">
      <button class="portais-tab active" data-secao="anuncios" onclick="trocarPortaisSecao('anuncios')">Anúncios</button>
      <button class="portais-tab" data-secao="config" onclick="trocarPortaisSecao('config')">Configurações</button>
      <button class="portais-tab" data-secao="descontos" onclick="trocarPortaisSecao('descontos')">Descontos</button>
    </div>

    <div id="portais-secao-anuncios">
      <div class="portais-tabs portais-portal-tabs">
        <button class="portais-tab active" data-portal="olx" onclick="trocarPortaisPortal('olx')">Grupo OLX / VivaReal</button>
        <button class="portais-tab" data-portal="chaves" onclick="trocarPortaisPortal('chaves')">Chaves na Mão</button>
      </div>
      <div class="portais-tabs">
        <button class="portais-tab active" data-tab="venda" onclick="trocarPortaisTab('venda')">Venda</button>
        <button class="portais-tab" data-tab="aluguel" onclick="trocarPortaisTab('aluguel')">Aluguel</button>
      </div>
      <div class="portais-toolbar">
        <label for="portais-limit">Total de anúncios no portal</label>
        <select id="portais-limit" onchange="alterarPortaisLimit(this.value)"></select>
        <span class="portais-count" id="portais-count"></span>
      </div>
      <div class="portais-totais" id="portais-totais"></div>
      <div class="portais-bulk">
        <label for="portais-bulk-select">Aplicar a todos nesta aba</label>
        <select id="portais-bulk-select"></select>
        <button onclick="aplicarPortaisQualifTodos()">Aplicar a Todos</button>
      </div>
      <div class="portais-bulk">
        <label for="portais-codigo-input">Incluir por código</label>
        <input type="text" id="portais-codigo-input" placeholder="Ex: 1210" inputmode="numeric" onkeydown="if(event.key==='Enter')adicionarPortaisPorCodigo();">
        <select id="portais-codigo-select"></select>
        <button onclick="adicionarPortaisPorCodigo()">Adicionar</button>
      </div>
      <div class="portais-board" id="portais-list">
        <div class="loading-msg"><span class="spinner-inline"></span>Carregando imóveis...</div>
      </div>
      <div class="portais-footer">
        <span class="portais-msg" id="portais-msg"></span>
        <a class="cad-btn alt" id="portais-xml-btn" href="feed_olx.php" target="_blank">Exportar XML (Grupo OLX)</a>
        <button class="cad-btn" id="portais-save-btn" onclick="salvarPortaisConfig()">Salvar Configuração</button>
      </div>
    </div>

    <div id="portais-secao-config" style="display:none">
      <div class="portais-tabs portais-portal-tabs">
        <button class="portais-tab active" data-portal="olx" onclick="trocarPortaisPortal('olx')">Grupo OLX / VivaReal</button>
        <button class="portais-tab" data-portal="chaves" onclick="trocarPortaisPortal('chaves')">Chaves na Mão</button>
      </div>
      <div class="portais-toolbar">
        <label for="portais-endereco">Endereço enviado na carga (Venda)</label>
        <select id="portais-endereco" onchange="alterarPortaisEndereco(this.value)">
          <option value="completo">Completo (rua e número)</option>
          <option value="aproximado">Somente bairro e cidade</option>
        </select>
      </div>
      <div class="portais-toolbar">
        <label for="portais-endereco-aluguel">Endereço enviado na carga (Aluguel)</label>
        <select id="portais-endereco-aluguel" onchange="alterarPortaisEnderecoAluguel(this.value)">
          <option value="completo">Completo (rua e número)</option>
          <option value="aproximado">Somente bairro e cidade</option>
        </select>
      </div>
      <div class="portais-toolbar">
        <label for="portais-renovacao" style="text-transform:none;font-weight:400;display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="checkbox" id="portais-renovacao" onchange="alterarPortaisRenovacao(this.checked)" style="width:16px;height:16px;cursor:pointer">
          Renovação automática (gira fotos e descrição diariamente, sem alterar o cadastro no Imoview)
        </label>
      </div>
      <div class="portais-totais" id="portais-config-status">Carregando configuração salva...</div>
      <div class="portais-footer">
        <span class="portais-msg" id="portais-config-msg"></span>
        <button class="cad-btn" id="portais-config-save-btn" onclick="salvarPortaisConfig()">Salvar Configuração</button>
      </div>
    </div>

    <div id="portais-secao-descontos" style="display:none">
      <div class="portais-bulk">
        <label for="portais-desc-codigo">Código do imóvel</label>
        <input type="text" id="portais-desc-codigo" placeholder="Ex: 1039" inputmode="numeric" onkeydown="if(event.key==='Enter')aplicarPortaisDesconto();">
        <label for="portais-desc-tipo">Tipo</label>
        <select id="portais-desc-tipo">
          <option value="percentual">% (percentual)</option>
          <option value="valor">R$ (valor fixo)</option>
        </select>
        <label for="portais-desc-valor">Valor</label>
        <input type="number" id="portais-desc-valor" placeholder="Ex: 10" min="0" step="0.01" style="width:100px">
        <button onclick="aplicarPortaisDesconto()">Aplicar Desconto</button>
      </div>
      <div class="portais-msg" id="portais-desc-msg" style="margin-bottom:.8rem"></div>
      <div class="portais-board" id="portais-desc-list" style="display:block;height:auto;min-height:0">
        <div class="loading-msg">Carregando descontos...</div>
      </div>
    </div>
  </div>
</div>
<script>
var API_URL='https://www.virtualnaplanta.com.br/instagram/proxy_imoview.php';
var todosImoveis=[];
var portaisTabAtual='venda';
var portaisPortalAtual='olx';
var portaisSecaoAtual='anuncios';

var PORTAIS_DEFS={
  olx:{
    label:'Grupo OLX / VivaReal',
    configAction:'olx',
    limits:[150,300],
    defaultLimit:150,
    xmlUrl:'feed_olx.php',
    xmlLabel:'Exportar XML (Grupo OLX)',
    colunas:[
      {key:'sem',       label:'Sem Destaque'},
      {key:'destaque',  label:'Destaque'},
      {key:'super',     label:'Super Destaque'},
      {key:'exclusivo', label:'Destaque Exclusivo'}
    ]
  },
  chaves:{
    label:'Chaves na Mão',
    configAction:'chaves',
    limits:[100,200,300],
    defaultLimit:100,
    xmlUrl:'feed_chaves.php',
    xmlLabel:'Exportar XML (Chaves na Mão)',
    colunas:[
      {key:'sem',       label:'Sem Destaque'},
      {key:'destaque',  label:'Destaque'}
    ]
  }
};

var portaisConfigs={
  olx:   {limit:PORTAIS_DEFS.olx.defaultLimit,    qualif:{}, endereco:'completo', endereco_aluguel:'completo', renovacao:true},
  chaves:{limit:PORTAIS_DEFS.chaves.defaultLimit, qualif:{}, endereco:'completo', endereco_aluguel:'completo', renovacao:true}
};

var descontosConfig={};

function escXml(s){
  if(!s)return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function fmtR(n){return n?new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(n):'';}
function imgErr(el){el.style.display='none';}

var portaisSelecionados={};

function trocarPortaisTab(tab){
  portaisTabAtual=tab;
  portaisSelecionados={};
  document.querySelectorAll('.portais-tabs:not(.portais-portal-tabs) .portais-tab').forEach(function(b){b.classList.toggle('active',b.dataset.tab===tab);});
  renderPortais();
}

function trocarPortaisSecao(secao){
  portaisSecaoAtual=secao;
  document.querySelectorAll('.portais-secao-tabs .portais-tab').forEach(function(b){b.classList.toggle('active',b.dataset.secao===secao);});
  document.getElementById('portais-secao-anuncios').style.display=(secao==='anuncios')?'':'none';
  document.getElementById('portais-secao-config').style.display=(secao==='config')?'':'none';
  document.getElementById('portais-secao-descontos').style.display=(secao==='descontos')?'':'none';
  if(secao==='descontos')renderPortaisDescontos();
}

function trocarPortaisPortal(portal){
  portaisPortalAtual=portal;
  portaisSelecionados={};
  document.querySelectorAll('.portais-portal-tabs .portais-tab').forEach(function(b){b.classList.toggle('active',b.dataset.portal===portal);});
  montarSeletoresPortal();
  renderPortais();
}

function montarSeletoresPortal(){
  var def=PORTAIS_DEFS[portaisPortalAtual];
  var cfg=portaisConfigs[portaisPortalAtual];

  // Opções de limite total do feed
  var limitSel=document.getElementById('portais-limit');
  limitSel.innerHTML=def.limits.map(function(l){return '<option value="'+l+'">'+l+'</option>';}).join('');
  if(def.limits.indexOf(cfg.limit)===-1)cfg.limit=def.defaultLimit;
  limitSel.value=String(cfg.limit);

  // Opção de endereço enviado na carga (completo ou somente bairro/cidade) — Venda e Aluguel separados
  if(cfg.endereco!=='completo'&&cfg.endereco!=='aproximado')cfg.endereco='completo';
  if(cfg.endereco_aluguel!=='completo'&&cfg.endereco_aluguel!=='aproximado')cfg.endereco_aluguel='completo';
  document.getElementById('portais-endereco').value=cfg.endereco;
  document.getElementById('portais-endereco-aluguel').value=cfg.endereco_aluguel;

  // Renovação automática (gira fotos/descrição/título diariamente)
  if(typeof cfg.renovacao!=='boolean')cfg.renovacao=true;
  document.getElementById('portais-renovacao').checked=cfg.renovacao;

  atualizarPortaisConfigStatus();

  // Opções de qualificação para "Aplicar a todos"
  var bulkSel=document.getElementById('portais-bulk-select');
  bulkSel.innerHTML=def.colunas.map(function(c){return '<option value="'+c.key+'">'+c.label+'</option>';}).join('');

  // Opções de destino para "Incluir por código" (colunas de qualificação + Todos os Anúncios)
  var codigoSel=document.getElementById('portais-codigo-select');
  codigoSel.innerHTML=def.colunas.map(function(c){return '<option value="'+c.key+'">'+c.label+'</option>';}).join('')+
    '<option value="todos">Todos os Anúncios (remover)</option>';

  // Botão de exportação do XML
  var xmlBtn=document.getElementById('portais-xml-btn');
  xmlBtn.href=def.xmlUrl;
  xmlBtn.textContent=def.xmlLabel;

  // Ajusta o número de colunas do quadro (Todos os Anúncios + qualificações)
  document.getElementById('portais-list').style.gridTemplateColumns='repeat('+(def.colunas.length+1)+',minmax(190px,1fr))';
}

function alterarPortaisLimit(v){
  portaisConfigs[portaisPortalAtual].limit=parseInt(v,10);
  renderPortais();
}

function alterarPortaisEndereco(v){
  portaisConfigs[portaisPortalAtual].endereco=(v==='aproximado')?'aproximado':'completo';
}

function alterarPortaisEnderecoAluguel(v){
  portaisConfigs[portaisPortalAtual].endereco_aluguel=(v==='aproximado')?'aproximado':'completo';
}

function alterarPortaisRenovacao(v){
  portaisConfigs[portaisPortalAtual].renovacao=!!v;
}

// Mostra, na tela de Configurações, exatamente o que está salvo no servidor
// para o portal selecionado (independente do que está marcado nos campos
// ainda não salvos), para o usuário conseguir confirmar se o "Salvar
// Configuração" realmente persistiu.
function atualizarPortaisConfigStatus(cfgSalva){
  var el=document.getElementById('portais-config-status');
  if(!el)return;
  var def=PORTAIS_DEFS[portaisPortalAtual];
  var cfg=cfgSalva||portaisConfigs[portaisPortalAtual];
  var endereco=(cfg.endereco==='aproximado')?'Somente bairro e cidade':'Completo (rua e número)';
  var enderecoAluguel=(cfg.endereco_aluguel==='aproximado')?'Somente bairro e cidade':'Completo (rua e número)';
  var renovacao=(typeof cfg.renovacao==='boolean'?cfg.renovacao:true)?'Ativada':'Desativada';
  el.innerHTML=
    '<div class="portais-totais-main">Configuração salva no servidor — '+def.label+'</div>'+
    '<div class="portais-totais-break">Endereço (Venda): '+endereco+' · Endereço (Aluguel): '+enderecoAluguel+' · Renovação automática: '+renovacao+' · Limite no feed: '+(cfg.limit||def.defaultLimit)+'</div>';
}

function rotuloDesconto(d){
  if(!d)return '';
  if(d.tipo==='valor')return '-'+fmtR(d.valor)+' OFF';
  var v=(d.valor%1===0)?d.valor.toFixed(0):d.valor;
  return '-'+v+'% OFF';
}

function aplicarPortaisDesconto(){
  var input=document.getElementById('portais-desc-codigo');
  var tipo=document.getElementById('portais-desc-tipo').value;
  var valorInput=document.getElementById('portais-desc-valor');
  var msg=document.getElementById('portais-desc-msg');
  var codigo=(input.value||'').trim();
  var valor=parseFloat(valorInput.value);

  if(!codigo){msg.style.color='#E60000';msg.textContent='Informe o código do imóvel.';return;}
  if(!todosImoveis.find(function(i){return String(i.id)===codigo;})){
    msg.style.color='#E60000';msg.textContent='Imóvel #'+escXml(codigo)+' não encontrado.';return;
  }
  if(!valor||valor<=0){msg.style.color='#E60000';msg.textContent='Informe um valor de desconto maior que zero.';return;}

  msg.style.color='#777';msg.textContent='Salvando...';
  fetch(API_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'save_desconto_imovel',codigo:codigo,tipo:tipo,valor:valor})
  })
    .then(function(r){return r.json();})
    .then(function(d){
      if(d&&d.success){
        descontosConfig[codigo]={tipo:tipo,valor:valor};
        msg.style.color='#2e7d32';
        msg.textContent='✓ Desconto aplicado ao imóvel #'+escXml(codigo)+'.';
        input.value='';valorInput.value='';
        renderPortaisDescontos();
      }else{
        msg.style.color='#E60000';
        msg.textContent='Erro: '+(d&&d.error?d.error:'desconhecido');
      }
    })
    .catch(function(){msg.style.color='#E60000';msg.textContent='Erro de conexão ao salvar.';});
}

function removerPortaisDesconto(codigo){
  var msg=document.getElementById('portais-desc-msg');
  fetch(API_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'save_desconto_imovel',codigo:codigo,remover:true})
  })
    .then(function(r){return r.json();})
    .then(function(d){
      if(d&&d.success){
        delete descontosConfig[codigo];
        msg.style.color='#2e7d32';
        msg.textContent='✓ Desconto removido do imóvel #'+escXml(codigo)+'.';
        renderPortaisDescontos();
      }else{
        msg.style.color='#E60000';
        msg.textContent='Erro: '+(d&&d.error?d.error:'desconhecido');
      }
    })
    .catch(function(){msg.style.color='#E60000';msg.textContent='Erro de conexão ao remover.';});
}

function renderPortaisDescontos(){
  var box=document.getElementById('portais-desc-list');
  var codigos=Object.keys(descontosConfig);
  if(!codigos.length){
    box.innerHTML='<div class="empty-state">Nenhum imóvel com desconto configurado.</div>';
    return;
  }
  box.innerHTML='';
  codigos.forEach(function(codigo){
    var d=descontosConfig[codigo];
    var im=todosImoveis.find(function(i){return String(i.id)===String(codigo);});
    var row=document.createElement('div');
    row.className='portais-row';
    row.style.flexDirection='row';
    row.style.alignItems='center';
    row.style.justifyContent='space-between';
    var imgHtml=(im&&im.fotos&&im.fotos[0])?'<img src="'+im.fotos[0]+'" loading="lazy" onerror="imgErr(this)"/>':'<div class="portais-row-ph"></div>';
    row.innerHTML=
      '<div class="portais-row-top" style="flex:1">'+imgHtml+
        '<div class="portais-row-info">'+
          '<div class="portais-row-title">#'+escXml(codigo)+' — '+escXml(im?im.titulo:'Imóvel não encontrado')+'</div>'+
          '<div class="portais-row-meta">'+escXml(im?im.bairro:'')+'</div>'+
        '</div>'+
      '</div>'+
      '<div class="portais-row-tag q-exclusivo" style="margin-right:10px">'+escXml(rotuloDesconto(d))+'</div>';
    var btn=document.createElement('button');
    btn.className='cad-btn alt';
    btn.textContent='Remover';
    btn.onclick=function(){removerPortaisDesconto(codigo);};
    row.appendChild(btn);
    box.appendChild(row);
  });
}

function aplicarPortaisQualifTodos(){
  var val=document.getElementById('portais-bulk-select').value;
  var cfg=portaisConfigs[portaisPortalAtual];
  var transacVal=portaisTabAtual==='venda'?'For Sale':'For Rent';
  var lista=todosImoveis.filter(function(im){return (im.transac||'')===transacVal;});
  lista.forEach(function(im){cfg.qualif[im.id]=val;});
  renderPortais();
}

function adicionarPortaisPorCodigo(){
  var input=document.getElementById('portais-codigo-input');
  var destino=document.getElementById('portais-codigo-select').value;
  var msg=document.getElementById('portais-msg');
  var codigo=(input.value||'').trim();
  if(!codigo){
    msg.style.color='#E60000';msg.textContent='Informe o código do imóvel.';
    return;
  }
  var cfg=portaisConfigs[portaisPortalAtual];
  var im=todosImoveis.find(function(i){return String(i.id)===codigo;});
  if(!im){
    msg.style.color='#E60000';msg.textContent='Imóvel #'+escXml(codigo)+' não encontrado.';
    return;
  }
  if(destino==='todos')delete cfg.qualif[im.id];
  else cfg.qualif[im.id]=destino;

  // Muda para a aba (Venda/Aluguel) correspondente ao imóvel, se necessário
  var tabAlvo=(im.transac||'')==='For Rent'?'aluguel':'venda';
  if(tabAlvo!==portaisTabAtual){
    portaisTabAtual=tabAlvo;
    document.querySelectorAll('.portais-tabs:not(.portais-portal-tabs) .portais-tab').forEach(function(b){b.classList.toggle('active',b.dataset.tab===tabAlvo);});
  }

  input.value='';
  msg.style.color='#2e7d32';
  msg.textContent='✓ Imóvel #'+escXml(codigo)+' movido para "'+rotuloQualifDestino(destino)+'".';
  renderPortais();
}

function rotuloQualifDestino(key){
  if(key==='todos')return 'Todos os Anúncios';
  return rotuloQualif(key);
}

function rotuloQualif(q){
  if(!q)return 'Não definido';
  var def=PORTAIS_DEFS[portaisPortalAtual];
  var c=def.colunas.find(function(c){return c.key===q;});
  return c?c.label:'Não definido';
}

function criarCard(im,transacVal,cfg,modoTodos){
  var q=cfg.qualif[im.id]||(modoTodos?'':'sem');
  var preco=transacVal==='For Rent'?fmtR(im.aluguel)+'/mês':fmtR(im.preco);
  var row=document.createElement('div');row.className='portais-row';
  var idStr=String(im.id);
  if(portaisSelecionados[idStr])row.classList.add('selected');
  row.draggable=true;
  row.dataset.id=im.id;
  row.onclick=function(e){
    if(e.target.tagName==='SELECT')return;
    if(portaisSelecionados[idStr]){delete portaisSelecionados[idStr];row.classList.remove('selected');}
    else{portaisSelecionados[idStr]=true;row.classList.add('selected');}
  };
  row.ondragstart=function(e){
    var ids=portaisSelecionados[idStr]?Object.keys(portaisSelecionados):[idStr];
    e.dataTransfer.setData('text/plain',JSON.stringify(ids));
    e.dataTransfer.effectAllowed='move';
    row.classList.add('dragging');
  };
  row.ondragend=function(){row.classList.remove('dragging');};
  var imgHtml=im.fotos&&im.fotos[0]?'<img src="'+im.fotos[0]+'" loading="lazy" onerror="imgErr(this)"/>':'<div class="portais-row-ph"></div>';
  row.innerHTML=
    '<div class="portais-row-top">'+imgHtml+
      '<div class="portais-row-info">'+
        '<div class="portais-row-title">#'+escXml(im.id)+' — '+escXml(im.titulo)+'</div>'+
        '<div class="portais-row-meta">'+escXml(im.bairro)+' · '+preco+'</div>'+
      '</div>'+
    '</div>';
  if(modoTodos){
    row.innerHTML+='<div class="portais-row-tag q-'+q+'">'+rotuloQualif(q)+'</div>';
  }else{
    var def=PORTAIS_DEFS[portaisPortalAtual];
    row.innerHTML+=
      '<select class="q-'+q+'" data-id="'+escXml(im.id)+'">'+
        def.colunas.map(function(c){return '<option value="'+c.key+'"'+(q===c.key?' selected':'')+'>'+c.label+'</option>';}).join('')+
      '</select>';
    var sel=row.querySelector('select');
    sel.onchange=function(){
      cfg.qualif[this.dataset.id]=this.value;
      renderPortais();
    };
  }
  return row;
}

function criarColuna(key,label,itens,transacVal,cfg,modoTodos,countLabel){
  var colEl=document.createElement('div');colEl.className='portais-col';
  var header=document.createElement('div');header.className='portais-col-header q-col-'+key;
  header.innerHTML='<span>'+label+'</span><span class="portais-col-count">'+(countLabel||itens.length)+'</span>';
  colEl.appendChild(header);
  var body=document.createElement('div');body.className='portais-col-body';body.dataset.col=key;
  body.ondragover=function(e){e.preventDefault();colEl.classList.add('drag-over');};
  body.ondragleave=function(){colEl.classList.remove('drag-over');};
  body.ondrop=function(e){
    e.preventDefault();colEl.classList.remove('drag-over');
    var raw=e.dataTransfer.getData('text/plain');
    if(!raw)return;
    var ids;
    try{ids=JSON.parse(raw);if(!Array.isArray(ids))ids=[String(ids)];}catch(err){ids=[raw];}
    ids.forEach(function(id){
      if(key==='todos')delete cfg.qualif[id];
      else cfg.qualif[id]=key;
      delete portaisSelecionados[id];
    });
    renderPortais();
  };
  if(!itens.length){
    body.innerHTML='<div class="portais-col-empty">Nenhum imóvel</div>';
  }else{
    itens.forEach(function(im){
      body.appendChild(criarCard(im,transacVal,cfg,modoTodos));
    });
  }
  colEl.appendChild(body);
  return colEl;
}

function renderPortais(){
  var def=PORTAIS_DEFS[portaisPortalAtual];
  var cfg=portaisConfigs[portaisPortalAtual];
  if(!cfg.qualif)cfg.qualif={};
  document.getElementById('portais-limit').value=String(cfg.limit||def.defaultLimit);
  var transacVal=portaisTabAtual==='venda'?'For Sale':'For Rent';
  var lista=todosImoveis.filter(function(im){return (im.transac||'')===transacVal;});
  lista.sort(function(a,b){return parseInt(b.id||0,10)-parseInt(a.id||0,10);});
  var limit=cfg.limit||def.defaultLimit;
  var totalImoveis=todosImoveis.length;
  var box=document.getElementById('portais-list');
  box.style.gridTemplateColumns='repeat('+(def.colunas.length+1)+',minmax(190px,1fr))';

  // Preserva a posição de rolagem de cada coluna ao re-renderizar
  var scrollPos={};
  box.querySelectorAll('.portais-col-body').forEach(function(b){scrollPos[b.dataset.col]=b.scrollTop;});

  // ── Totais GLOBAIS (Venda + Aluguel somados) — o limite do feed vale para a soma das duas abas ──
  var totaisGlobais={};
  def.colunas.forEach(function(c){totaisGlobais[c.key]={venda:0,aluguel:0};});
  todosImoveis.forEach(function(im){
    var q=cfg.qualif[im.id];
    if(!totaisGlobais[q])return;
    if((im.transac||'')==='For Sale')totaisGlobais[q].venda++;
    else totaisGlobais[q].aluguel++;
  });
  var totalGeralVenda=0, totalGeralAluguel=0;
  def.colunas.forEach(function(c){
    totalGeralVenda  +=totaisGlobais[c.key].venda;
    totalGeralAluguel+=totaisGlobais[c.key].aluguel;
  });
  var totalGeral=totalGeralVenda+totalGeralAluguel;
  var overLimit=totalGeral>limit;
  var totalNoFeed=Math.min(limit,totalGeral);

  var totaisEl=document.getElementById('portais-totais');
  var porColuna=def.colunas.map(function(c){
    var t=totaisGlobais[c.key];
    return c.label+': '+(t.venda+t.aluguel);
  }).join(' · ');
  totaisEl.innerHTML=
    '<div class="portais-totais-main'+(overLimit?' over-limit':'')+'">'+
      'Total no feed (Venda + Aluguel): '+totalNoFeed+'/'+limit+
      (overLimit?' — excedido em '+(totalGeral-limit):'')+
    '</div>'+
    '<div class="portais-totais-break">Venda: '+totalGeralVenda+' · Aluguel: '+totalGeralAluguel+' · '+porColuna+'</div>';

  box.innerHTML='';
  if(!lista.length){
    document.getElementById('portais-count').textContent='0 imóveis nesta aba · '+totalImoveis+' no total';
    box.innerHTML='<div class="empty-state">Nenhum imóvel nesta categoria.</div>';
    return;
  }

  // Só entram nas colunas de qualificação os imóveis que o usuário arrastou/selecionou explicitamente.
  // Os demais ficam em "Todos os Anúncios" até serem movidos. Um imóvel pertence a uma única coluna por vez.
  var grupos={};
  def.colunas.forEach(function(c){grupos[c.key]=[];});
  var naoDefinidos=[];
  lista.forEach(function(im){
    var q=cfg.qualif[im.id];
    if(grupos[q])grupos[q].push(im);
    else naoDefinidos.push(im);
  });

  document.getElementById('portais-count').textContent=
    lista.length+' imóveis nesta aba ('+(transacVal==='For Sale'?'Venda':'Aluguel')+') · '+totalImoveis+' no total';

  // Coluna "Todos os Anúncios" — apenas imóveis ainda não classificados
  box.appendChild(criarColuna('todos','Todos os Anúncios',naoDefinidos,transacVal,cfg,true));

  // Colunas de qualificação — juntas (Venda + Aluguel) devem respeitar o limite
  def.colunas.forEach(function(c){
    var col=criarColuna(c.key,c.label,grupos[c.key],transacVal,cfg);
    if(overLimit)col.querySelector('.portais-col-count').classList.add('over-limit');
    box.appendChild(col);
  });

  // Restaura a posição de rolagem de cada coluna
  box.querySelectorAll('.portais-col-body').forEach(function(b){
    if(scrollPos[b.dataset.col])b.scrollTop=scrollPos[b.dataset.col];
  });
}

function salvarPortaisConfig(){
  var def=PORTAIS_DEFS[portaisPortalAtual];
  var portalSalvo=portaisPortalAtual; // captura para o caso do usuário trocar de aba enquanto salva
  var cfg=portaisConfigs[portalSalvo];
  var btns=[document.getElementById('portais-save-btn'),document.getElementById('portais-config-save-btn')];
  var msgs=[document.getElementById('portais-msg'),document.getElementById('portais-config-msg')];
  btns.forEach(function(b){b.disabled=true;b.textContent='Salvando...';});
  msgs.forEach(function(msg){msg.style.color='#777';msg.textContent='Salvando...';});
  fetch(API_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'save_'+def.configAction+'_config',config:cfg})
  })
    .then(function(r){return r.json();})
    .then(function(d){
      if(!(d&&d.success)){
        msgs.forEach(function(msg){
          msg.style.color='#E60000';
          msg.textContent='Erro ao salvar: '+(d&&d.error?d.error:'desconhecido');
        });
        return;
      }
      // Após salvar, busca de volta a configuração gravada no servidor para
      // confirmar de fato o que ficou persistido (evita ficar na dúvida se
      // o clique em "Salvar Configuração" funcionou).
      var actionGet='get_'+def.configAction+'_config';
      return fetch(API_URL+'?action='+actionGet)
        .then(function(r){return r.json();})
        .then(function(dConfirma){
          if(dConfirma&&typeof dConfirma==='object'){
            portaisConfigs[portalSalvo]=dConfirma;
            if(portaisPortalAtual===portalSalvo)montarSeletoresPortal();
          }
          msgs.forEach(function(msg){
            msg.style.color='#2e7d32';
            msg.textContent='✓ Configuração salva e confirmada no servidor! Feed: '+def.xmlUrl;
          });
        })
        .catch(function(){
          // Salvou com sucesso, mas não conseguiu confirmar a releitura.
          msgs.forEach(function(msg){
            msg.style.color='#2e7d32';
            msg.textContent='✓ Configuração salva (não foi possível confirmar a releitura). Feed: '+def.xmlUrl;
          });
        });
    })
    .catch(function(){msgs.forEach(function(msg){msg.style.color='#E60000';msg.textContent='Erro de conexão ao salvar.';});})
    .finally(function(){btns.forEach(function(b){b.disabled=false;b.textContent='Salvar Configuração';});});
}

function carregarTudo(){
  document.getElementById('portais-list').innerHTML='<div class="loading-msg">Carregando imóveis...</div>';
  Promise.all([
    fetch(API_URL).then(function(r){return r.json();}),
    fetch(API_URL+'?action=get_olx_config').then(function(r){return r.json();}).catch(function(){return {limit:PORTAIS_DEFS.olx.defaultLimit,qualif:{}};}),
    fetch(API_URL+'?action=get_chaves_config').then(function(r){return r.json();}).catch(function(){return {limit:PORTAIS_DEFS.chaves.defaultLimit,qualif:{}};}),
    fetch(API_URL+'?action=get_descontos_config').then(function(r){return r.json();}).catch(function(){return {};})
  ]).then(function(res){
    var dImoveis=res[0], dOlx=res[1], dChaves=res[2], dDescontos=res[3];
    todosImoveis=(dImoveis&&dImoveis.imoveis)?dImoveis.imoveis:[];
    if(dOlx&&dOlx.qualif)portaisConfigs.olx=dOlx;
    if(dChaves&&dChaves.qualif)portaisConfigs.chaves=dChaves;
    descontosConfig=(dDescontos&&typeof dDescontos==='object')?dDescontos:{};
    montarSeletoresPortal();
    if(!todosImoveis.length){
      document.getElementById('portais-list').innerHTML='<div class="empty-state">Não foi possível carregar os imóveis. Verifique o proxy_imoview.php.</div>';
      return;
    }
    renderPortais();
    if(portaisSecaoAtual==='descontos')renderPortaisDescontos();
  }).catch(function(){
    document.getElementById('portais-list').innerHTML='<div class="empty-state">Erro de conexão ao carregar imóveis.</div>';
  });
}

montarSeletoresPortal();
carregarTudo();
</script>
</body>
</html>
