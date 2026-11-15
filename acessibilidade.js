(function () {
  'use strict';

  var CHAVE = 'entregeracoes-acessibilidade';
  var NIVEIS = [100, 115, 130, 150];
  var VELOCIDADE_VOZ = 0.9;
  var raiz = document.documentElement;
  var estado = { nivel: 0, contraste: false, grande: false };

  function carregar() {
    try {
      var s = JSON.parse(localStorage.getItem(CHAVE));
      if (s && typeof s === 'object') {
        var n = parseInt(s.nivel, 10);
        if (n >= 0 && n < NIVEIS.length) estado.nivel = n;
        estado.contraste = s.contraste === true;
        estado.grande = s.grande === true;
      }
    } catch (e) {}
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) {}
  }

  var ui = {};

  function aplicar() {
    var pct = NIVEIS[estado.nivel];
    raiz.style.fontSize = pct === 100 ? '' : pct + '%';
    raiz.classList.toggle('ac-zoom', pct >= 130);
    raiz.classList.toggle('ac-contraste', estado.contraste);
    raiz.classList.toggle('ac-grande', estado.grande);
    raiz.classList.toggle('ac-menu-compacto', pct >= 130 || estado.grande);

    if (!ui.menos) return;
    marcarDesativado(ui.menos, estado.nivel === 0);
    marcarDesativado(ui.mais, estado.nivel === NIVEIS.length - 1);
    ui.contraste.setAttribute('aria-pressed', estado.contraste);
    ui.contraste.querySelector('.ac-estado').textContent = estado.contraste ? 'Ligado' : 'Desligado';
    ui.grande.setAttribute('aria-pressed', estado.grande);
    ui.grande.querySelector('.ac-estado').textContent = estado.grande ? 'Ligado' : 'Desligado';
  }
  function marcarDesativado(botao, desativado) {
    botao.setAttribute('aria-disabled', desativado ? 'true' : 'false');
  }
  function avisar(texto) { if (ui.aviso) ui.aviso.textContent = texto; }

  function mudarNivel(delta) {
    var novo = Math.max(0, Math.min(NIVEIS.length - 1, estado.nivel + delta));
    if (novo === estado.nivel) {
      avisar(delta > 0 ? 'As letras já estão no tamanho máximo.' : 'As letras já estão no tamanho mínimo.');
      return;
    }
    estado.nivel = novo;
    aplicar(); salvar();
    avisar('Letras em ' + NIVEIS[novo] + '%.');
  }

  var suportaVoz = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  var sintese = suportaVoz ? window.speechSynthesis : null;
  var voz = null;
  var sessao = 0;
  var atual = null;
  var botaoAtivo = null;

  function escolherVoz() {
    if (!sintese) return;
    var vozes = sintese.getVoices();
    voz = vozes.filter(function (v) { return v.lang && v.lang.replace('_', '-').toLowerCase() === 'pt-br'; })[0]
       || vozes.filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf('pt') === 0; })[0]
       || null;
  }

  function quebrar(trechos) {
    var fila = [];
    trechos.forEach(function (t) {
      var frases = t.match(/[^.!?;:]+[.!?;:]*\s*/g) || [t];
      var bloco = '';
      frases.forEach(function (f) {
        if ((bloco + f).length > 180 && bloco) { fila.push(bloco.trim()); bloco = ''; }
        bloco += f;
      });
      if (bloco.trim()) fila.push(bloco.trim());
    });
    return fila;
  }

  function trechosDe(elemento) {
    var saida = [];
    elemento.querySelectorAll('h1,h2,h3,p,figcaption,legend').forEach(function (el) {
      if (el.closest('[aria-hidden="true"], .ac-ouvir, .ac-painel')) return;
      var t = el.textContent.replace(/\s+/g, ' ').trim();
      if (!t) return;
      if (!/[.!?:;]$/.test(t)) t += '.';
      saida.push(t);
    });
    return saida;
  }

  function rotuloDoBotao(b, ativo) {
    b.setAttribute('aria-pressed', ativo);
    var txt = b.querySelector('.ac-texto');
    txt.textContent = ativo ? 'Parar leitura' : b.getAttribute('data-rotulo');
  }

  function parar() {
    sessao++;
    if (sintese) sintese.cancel();
    atual = null;
    if (botaoAtivo) { rotuloDoBotao(botaoAtivo, false); botaoAtivo = null; }
  }

  function falarFila(fila, id) {
    if (id !== sessao) return;
    if (!fila.length) { parar(); return; }
    var u = new SpeechSynthesisUtterance(fila.shift());
    u.lang = 'pt-BR';
    u.rate = VELOCIDADE_VOZ;
    if (voz) u.voice = voz;
    u.onend = function () { falarFila(fila, id); };
    u.onerror = function () { if (id === sessao) parar(); };
    atual = u;
    sintese.speak(u);
  }

  function ouvir(elemento, botao) {
    if (!suportaVoz) return;
    if (botaoAtivo === botao) { parar(); return; }
    parar();
    var trechos = trechosDe(elemento);
    if (!trechos.length) return;
    escolherVoz();
    botaoAtivo = botao;
    rotuloDoBotao(botao, true);
    falarFila(quebrar(trechos), sessao);
  }

  var ICONE_FALANTE = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function criarBotaoOuvir(rotulo, classe) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = classe;
    b.setAttribute('data-rotulo', rotulo);
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = ICONE_FALANTE + '<span class="ac-texto"></span>';
    b.querySelector('.ac-texto').textContent = rotulo;
    return b;
  }

  function adicionarBotoesOuvir() {
    if (!suportaVoz) return;
    var alvos = document.querySelectorAll('main > section, [data-ouvir]');
    alvos.forEach(function (alvo) {
      var b = criarBotaoOuvir(alvo.hasAttribute('data-ouvir') ? 'Ouvir este texto' : 'Ouvir esta seção', 'ac-ouvir');
      b.addEventListener('click', function () { ouvir(alvo, b); });
      var titulo = alvo.querySelector('h1,h2,h3');
      if (titulo) titulo.insertAdjacentElement('afterend', b);
      else alvo.insertBefore(b, alvo.firstChild);
    });
  }

  function criarPainel() {
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'ac-fab';
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'ac-painel');
    fab.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><circle cx="12" cy="4" r="2" fill="currentColor"/><path d="M4 8.5l8 1.5 8-1.5M12 10v5l-3 6M12 15l3 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Acessibilidade</span>';

    var painel = document.createElement('div');
    painel.id = 'ac-painel';
    painel.className = 'ac-painel';
    painel.setAttribute('role', 'dialog');
    painel.setAttribute('aria-labelledby', 'ac-titulo');
    painel.hidden = true;
    painel.innerHTML =
      '<div class="ac-topo">' +
        '<p class="ac-titulo" id="ac-titulo">Acessibilidade</p>' +
        '<button type="button" class="ac-btn ac-fechar">Fechar</button>' +
      '</div>' +
      '<div class="ac-grupo" role="group" aria-labelledby="ac-r1">' +
        '<span class="ac-rotulo" id="ac-r1">Tamanho das letras</span>' +
        '<div class="ac-linha">' +
          '<button type="button" class="ac-btn ac-menos" data-acao="menos" aria-label="Diminuir as letras">A-</button>' +
          '<button type="button" class="ac-btn ac-normal" data-acao="normal" aria-label="Tamanho original das letras">A</button>' +
          '<button type="button" class="ac-btn ac-mais" data-acao="mais" aria-label="Aumentar as letras">A+</button>' +
        '</div>' +
      '</div>' +
      '<div class="ac-grupo" role="group" aria-labelledby="ac-r2">' +
        '<span class="ac-rotulo" id="ac-r2">Cores</span>' +
        '<button type="button" class="ac-btn ac-alternar" data-acao="contraste" aria-pressed="false">' +
          '<span>Alto contraste</span><span class="ac-estado">Desligado</span></button>' +
      '</div>' +
      '<div class="ac-grupo" role="group" aria-labelledby="ac-r3">' +
        '<span class="ac-rotulo" id="ac-r3">Botões</span>' +
        '<button type="button" class="ac-btn ac-alternar" data-acao="grande" aria-pressed="false">' +
          '<span>Botões grandes e tela simples</span><span class="ac-estado">Desligado</span></button>' +
      '</div>' +
      '<div class="ac-grupo" role="group" aria-labelledby="ac-r4" id="ac-grupo-voz">' +
        '<span class="ac-rotulo" id="ac-r4">Leitura em voz alta</span>' +
      '</div>' +
      '<button type="button" class="ac-btn ac-padrao" data-acao="padrao">Voltar ao padrão</button>' +
      '<p class="ac-aviso" role="status" aria-live="polite"></p>';

    document.body.appendChild(fab);
    document.body.appendChild(painel);

    var grupoVoz = painel.querySelector('#ac-grupo-voz');
    if (suportaVoz) {
      var bPagina = criarBotaoOuvir('Ouvir a página', 'ac-btn ac-ouvir-pagina');
      bPagina.addEventListener('click', function () { ouvir(document.getElementById('conteudo') || document.body, bPagina); });
      grupoVoz.appendChild(bPagina);
    } else {
      var p = document.createElement('p');
      p.className = 'ac-aviso';
      p.textContent = 'Este navegador não tem leitura em voz alta.';
      grupoVoz.appendChild(p);
    }

    ui.menos = painel.querySelector('[data-acao="menos"]');
    ui.mais = painel.querySelector('[data-acao="mais"]');
    ui.contraste = painel.querySelector('[data-acao="contraste"]');
    ui.grande = painel.querySelector('[data-acao="grande"]');
    ui.aviso = painel.querySelector('.ac-aviso[role="status"]');

    painel.addEventListener('click', function (e) {
      var b = e.target.closest('[data-acao]');
      if (!b) return;
      var acao = b.getAttribute('data-acao');
      if (acao === 'menos') mudarNivel(-1);
      else if (acao === 'mais') mudarNivel(1);
      else if (acao === 'normal') { estado.nivel = 0; aplicar(); salvar(); avisar('Letras no tamanho original.'); }
      else if (acao === 'contraste') {
        estado.contraste = !estado.contraste; aplicar(); salvar();
        avisar(estado.contraste ? 'Alto contraste ligado.' : 'Alto contraste desligado.');
      } else if (acao === 'grande') {
        estado.grande = !estado.grande; aplicar(); salvar();
        avisar(estado.grande ? 'Botões grandes ligados.' : 'Botões grandes desligados.');
      } else if (acao === 'padrao') {
        estado.nivel = 0; estado.contraste = false; estado.grande = false;
        aplicar(); salvar(); avisar('Tudo voltou ao padrão.');
      }
    });

    function abrir() {
      painel.hidden = false;
      fab.setAttribute('aria-expanded', 'true');
      painel.querySelector('.ac-fechar').focus();
    }
    function fechar(devolverFoco) {
      painel.hidden = true;
      fab.setAttribute('aria-expanded', 'false');
      if (devolverFoco) fab.focus();
    }
    fab.addEventListener('click', function () { painel.hidden ? abrir() : fechar(true); });
    painel.querySelector('.ac-fechar').addEventListener('click', function () { fechar(true); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !painel.hidden) fechar(true);
    });
    document.addEventListener('click', function (e) {
      if (!painel.hidden && !painel.contains(e.target) && !fab.contains(e.target)) fechar(false);
    });
  }

  carregar();
  aplicar();
  criarPainel();
  adicionarBotoesOuvir();
  aplicar();

  if (sintese) {
    escolherVoz();
    if (sintese.addEventListener) sintese.addEventListener('voiceschanged', escolherVoz);
    window.addEventListener('pagehide', function () { sintese.cancel(); });
  }
})();
