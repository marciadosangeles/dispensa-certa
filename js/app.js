/*
 * Dispensa Certa — aplicação.
 * Rotas pelo hash: #inicio, #m-triagem, #m-casos.
 * Modos: ?rapido (pausas de 3 s, atividades liberadas, sem envio),
 *        ?teste (sem envio), ?diagnostico (painel técnico, sem envio automático).
 */
(function () {
  var A = window.DCAnalytics;
  var app = document.getElementById("app");
  var rapido = A.modo.rapido;

  /* ---------- utilidades ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function ler(chave, padrao) {
    try { var v = localStorage.getItem(chave); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; }
  }
  function gravar(chave, v) { try { localStorage.setItem(chave, JSON.stringify(v)); } catch (e) {} }
  var progresso = ler("dc-progresso", {});
  function salvarProgresso(id, dados) { progresso[id] = dados; gravar("dc-progresso", progresso); }
  function modulo(id) { return DC.modulos.filter(function (m) { return m.id === id; })[0]; }
  function focar() { app.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "auto" }); }
  function segundos(t0) { return Math.round((Date.now() - t0) / 1000); }

  /* ---------- tema ---------- */
  var botaoTema = document.getElementById("botao-tema");
  function temaAtual() {
    var t = document.documentElement.dataset.theme;
    if (t) return t;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function marcarTema() {
    var escuro = temaAtual() === "dark";
    botaoTema.setAttribute("aria-pressed", escuro ? "true" : "false");
    botaoTema.setAttribute("aria-label", escuro ? "Usar modo claro" : "Usar modo escuro");
  }
  botaoTema.addEventListener("click", function () {
    var novo = temaAtual() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = novo;
    try { localStorage.setItem("dc-tema", novo); } catch (e) {}
    marcarTema();
  });
  marcarTema();

  /* ---------- tela inicial ---------- */
  function telaInicio() {
    var prontos = DC.modulos.filter(function (m) { return m.pronto; });
    var feitos = prontos.filter(function (m) { return progresso[m.id] && progresso[m.id].feito; }).length;
    app.innerHTML =
      '<section class="abertura">' +
        '<div class="abertura-texto">' +
          '<h1>Confira receitas controladas eletrônicas com segurança</h1>' +
          '<p class="lead">Um curso curto sobre o SNCR e a RDC nº 1.000/2025 para farmacêuticos e estagiários. Sessões de cerca de 5 minutos, com casos de balcão e uma pausa para se movimentar ao fim de cada uma.</p>' +
          '<p class="selo">Atualizado com a RDC nº 1.046/2026: transição até 3/3/2027</p>' +
        '</div>' +
        desenhoReceita() +
      '</section>' +
      '<section aria-labelledby="t-mod">' +
        '<div class="cab-lista"><h2 id="t-mod">Módulos</h2><span class="miudo">' + feitos + ' de ' + prontos.length + ' disponíveis concluídos</span></div>' +
        '<div class="barra" aria-hidden="true"><div style="width:' + (prontos.length ? feitos / prontos.length * 100 : 0) + '%"></div></div>' +
        '<ol class="modulos">' + DC.modulos.map(cartaoModulo).join("") + '</ol>' +
      '</section>';
  }
  function cartaoModulo(m) {
    var p = progresso[m.id];
    var estado = !m.pronto ? "Em breve" : (p && p.feito ? "Concluído" : "Começar");
    var detalhe = p && p.feito && p.total ? " · " + p.acertos + " de " + p.total + " acertos" : "";
    var inner =
      '<span class="num" aria-hidden="true">' + m.num + '</span>' +
      '<span class="mod-txt"><b>' + esc(m.titulo) + '</b><span>' + esc(m.resumo) + '</span>' +
      '<span class="mod-meta">Cerca de ' + m.min + ' min' + detalhe + '</span></span>' +
      '<span class="estado ' + (p && p.feito ? "feito" : "") + '">' + estado + '</span>';
    if (!m.pronto) return '<li class="mod off" aria-disabled="true"><div class="mod-in">' + inner + '</div></li>';
    return '<li class="mod"><a class="mod-in" href="#m-' + m.id + '">' + inner + '</a></li>';
  }
  function desenhoReceita() {
    return '<figure class="figura" aria-hidden="true"><svg viewBox="0 0 320 260" role="presentation">' +
      '<ellipse cx="166" cy="242" rx="120" ry="10" class="sombra"/>' +
      '<rect x="70" y="40" width="170" height="196" rx="10" class="folha-b"/>' +
      '<rect x="52" y="22" width="170" height="196" rx="10" class="folha-a"/>' +
      '<rect x="52" y="22" width="170" height="34" rx="10" class="faixa"/><rect x="52" y="44" width="170" height="12" class="faixa"/>' +
      '<rect x="68" y="72" width="110" height="9" rx="4" class="txt"/><rect x="68" y="90" width="138" height="7" rx="3" class="txt2"/>' +
      '<rect x="68" y="104" width="124" height="7" rx="3" class="txt2"/><rect x="68" y="118" width="96" height="7" rx="3" class="txt2"/>' +
      '<g class="digitos">' + Array.from({ length: 14 }, function (_, i) { return '<rect x="' + (68 + i * 10) + '" y="140" width="7" height="14" rx="1.5"/>'; }).join("") + '</g>' +
      '<rect x="68" y="176" width="70" height="2" class="txt2"/><path d="M70 172c8-10 14 6 22-2s12 4 20-4" class="assin"/>' +
      '<circle cx="232" cy="190" r="40" class="selo-c"/><path d="M214 190l12 12 24-26" class="check"/>' +
      '</svg></figure>';
  }

  /* ---------- moldura de módulo ---------- */
  function cabecalho(m, etapa, total) {
    return '<p class="trilha"><a href="#inicio">Módulos</a> <span aria-hidden="true">›</span> Módulo ' + m.num + '</p>' +
      '<h1>' + esc(m.titulo) + '</h1>' +
      (total ? '<div class="etapas" aria-label="Etapa ' + etapa + ' de ' + total + '">' +
        Array.from({ length: total }, function (_, i) { return '<span class="' + (i < etapa ? "on" : "") + '"></span>'; }).join("") +
        '<em>Etapa ' + etapa + ' de ' + total + '</em></div>' : "");
  }

  /* ---------- Módulo 2: Triagem ---------- */
  function moduloTriagem() {
    var m = modulo("triagem"), t0 = Date.now(), vistos = {}, acertos = 0, qi = 0;
    A.evento("modulo_inicio", { modulo: m.id });

    function intro() {
      app.innerHTML = cabecalho(m, 1, 3) +
        '<p class="lead">Cinco tipos de receita podem chegar ao balcão de controlados. Cada um tem um caminho de conferência diferente até a entrega.</p>' +
        '<div class="cartao"><h2>Nesta sessão você vai</h2><ul class="lista">' +
        '<li>explorar os 5 tipos de receita e seus passos de conferência;</li>' +
        '<li>responder 4 perguntas rápidas de fixação;</li><li>fazer uma pausa de 1 minuto no final.</li></ul></div>' +
        '<div class="acoes"><button class="botao" type="button" id="ir">Começar a triagem</button></div>';
      document.getElementById("ir").onclick = atividade;
      focar();
    }

    function atividade() {
      app.innerHTML = cabecalho(m, 2, 3) +
        '<h2 class="h2">Que receita chegou ao balcão?</h2>' +
        '<p>Toque em cada tipo para ver o caminho. Explore os cinco para continuar.</p>' +
        '<div class="chips" role="group" aria-label="Tipo de receita">' +
        DC.tipos.map(function (t) {
          return '<button type="button" class="chip" id="tipo-' + t.id + '" data-id="' + t.id + '" aria-pressed="false">' +
            '<i class="amostra ' + t.cor + '" aria-hidden="true"></i><span>' + esc(t.nome) + '</span><b class="visto" aria-hidden="true">✓</b></button>';
        }).join("") + '</div>' +
        '<div id="painel" class="painel" aria-live="polite"></div>' +
        '<div class="acoes"><button class="botao" type="button" id="seguir" disabled>Continuar para as perguntas</button>' +
        '<span class="miudo" id="faltam"></span></div>';
      var seguir = document.getElementById("seguir");
      function atualizar() {
        var n = Object.keys(vistos).length, falta = DC.tipos.length - n;
        seguir.disabled = !(falta === 0 || rapido);
        document.getElementById("faltam").textContent = falta > 0 ? "Faltam " + falta + " de " + DC.tipos.length : "Todos explorados";
      }
      function mostrar(id) {
        var t = DC.tipos.filter(function (x) { return x.id === id; })[0];
        vistos[id] = true;
        app.querySelectorAll(".chip").forEach(function (b) {
          b.setAttribute("aria-pressed", b.dataset.id === id ? "true" : "false");
          if (vistos[b.dataset.id]) b.classList.add("ja");
        });
        document.getElementById("painel").innerHTML =
          '<ol class="rota">' + t.passos.map(function (p, i) {
            return '<li class="' + (i === t.passos.length - 1 ? "fim " + t.veredito[0] : "") + '"><b>' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span></li>';
          }).join("") + '</ol>' +
          '<p class="veredito ' + t.veredito[0] + '">' + esc(t.veredito[1]) + '</p>';
        atualizar();
      }
      app.querySelector(".chips").addEventListener("click", function (e) {
        var b = e.target.closest(".chip"); if (b) mostrar(b.dataset.id);
      });
      seguir.onclick = function () { qi = 0; acertos = 0; pergunta(); };
      atualizar();
      focar();
    }

    function pergunta() {
      var q = DC.fixacaoTriagem[qi];
      app.innerHTML = cabecalho(m, 3, 3) +
        '<p class="miudo">Pergunta ' + (qi + 1) + ' de ' + DC.fixacaoTriagem.length + '</p>' +
        '<fieldset class="questao"><legend>' + esc(q.p) + '</legend>' +
        q.op.map(function (o, i) { return '<button type="button" class="opcao-q" id="op-' + i + '" data-i="' + i + '">' + esc(o) + '</button>'; }).join("") +
        '</fieldset><div id="retorno" aria-live="polite"></div>';
      app.querySelector(".questao").addEventListener("click", function (e) {
        var b = e.target.closest(".opcao-q"); if (!b || b.disabled) return;
        var i = +b.dataset.i, certo = i === q.c;
        if (certo) acertos++;
        app.querySelectorAll(".opcao-q").forEach(function (x) {
          x.disabled = true;
          if (+x.dataset.i === q.c) x.classList.add("certa");
          else if (x === b) x.classList.add("errada");
        });
        A.evento("resposta", { modulo: m.id, item: q.id, acertou: certo });
        var ultima = qi === DC.fixacaoTriagem.length - 1;
        document.getElementById("retorno").innerHTML =
          '<div class="retorno ' + (certo ? "ok" : "nao") + '"><b>' + (certo ? "Isso mesmo." : "Não é bem assim.") + '</b> ' + esc(q.e) + '</div>' +
          '<div class="acoes"><button class="botao" type="button" id="prox">' + (ultima ? "Ver resultado" : "Próxima pergunta") + '</button></div>';
        var prox = document.getElementById("prox");
        prox.onclick = function () { if (ultima) fim(); else { qi++; pergunta(); } };
        prox.focus();
      });
      focar();
    }

    function fim() {
      var total = DC.fixacaoTriagem.length, dur = segundos(t0);
      salvarProgresso(m.id, { feito: true, acertos: acertos, total: total, em: new Date().toISOString() });
      A.evento("modulo_fim", { modulo: m.id, valor: acertos + "/" + total, duracao_s: dur });
      telaFim(m, acertos, total, "Você reconheceu os cinco tipos de receita e o caminho de cada um.");
    }

    intro();
  }

  /* ---------- Módulo 5: Casos ---------- */
  function moduloCasos() {
    var m = modulo("casos"), t0 = Date.now(), i = 0, acertos = 0;
    A.evento("modulo_inicio", { modulo: m.id });

    function intro() {
      app.innerHTML = cabecalho(m, 1, 2) +
        '<p class="lead">Oito situações do dia a dia. Leia a receita e decida: você dispensaria?</p>' +
        '<div class="cartao"><h2>Lembre antes de começar</h2><ul class="lista">' +
        '<li>Só receita “autorizada” no SNCR é atendida.</li>' +
        '<li>Controlados da Portaria 344 exigem assinatura ICP-Brasil.</li>' +
        '<li>Receita em papel não precisa de número do SNCR.</li></ul></div>' +
        '<div class="acoes"><button class="botao" type="button" id="ir">Ver o primeiro caso</button></div>';
      document.getElementById("ir").onclick = caso;
      focar();
    }

    function caso() {
      var c = DC.casos[i];
      app.innerHTML = cabecalho(m, 2, 2) +
        '<div class="placar"><span>Caso ' + (i + 1) + ' de ' + DC.casos.length + '</span><span>' + acertos + ' acerto' + (acertos === 1 ? "" : "s") + '</span></div>' +
        '<div class="barra" aria-hidden="true"><div style="width:' + (i / DC.casos.length * 100) + '%"></div></div>' +
        '<article class="receita ' + c.cor + '"><small>' + esc(c.tipo) + '</small><p>' + esc(c.txt) + '</p></article>' +
        '<div class="acoes decide"><button class="botao" type="button" id="sim" data-r="1">Dispensar</button>' +
        '<button class="botao fantasma" type="button" id="nao" data-r="0">Não dispensar</button></div>' +
        '<div id="retorno" aria-live="polite"></div>';
      app.querySelector(".decide").addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b || b.disabled) return;
        var certo = (b.dataset.r === "1") === c.dispensa;
        if (certo) acertos++;
        app.querySelectorAll(".decide button").forEach(function (x) { x.disabled = true; });
        b.classList.add(certo ? "certa" : "errada");
        A.evento("resposta", { modulo: m.id, item: c.id, acertou: certo });
        var ultimo = i === DC.casos.length - 1;
        document.getElementById("retorno").innerHTML =
          '<div class="retorno ' + (certo ? "ok" : "nao") + '"><b>' + (certo ? "Certo." : "Não é bem assim.") + '</b> ' +
          (c.dispensa ? "A resposta é dispensar. " : "A resposta é não dispensar. ") + esc(c.e) + '</div>' +
          '<div class="acoes"><button class="botao" type="button" id="prox">' + (ultimo ? "Ver resultado" : "Próximo caso") + '</button></div>';
        var prox = document.getElementById("prox");
        prox.onclick = function () { if (ultimo) fim(); else { i++; caso(); } };
        prox.focus();
      });
      focar();
    }

    function fim() {
      var total = DC.casos.length, dur = segundos(t0);
      salvarProgresso(m.id, { feito: true, acertos: acertos, total: total, em: new Date().toISOString() });
      A.evento("modulo_fim", { modulo: m.id, valor: acertos + "/" + total, duracao_s: dur });
      telaFim(m, acertos, total, acertos >= 6 ? "Você está tomando boas decisões no balcão." : "Vale rever a triagem da receita e tentar de novo.");
    }

    intro();
  }

  /* ---------- fim de módulo e pausa ---------- */
  function telaFim(m, acertos, total, frase) {
    app.innerHTML =
      '<p class="trilha"><a href="#inicio">Módulos</a> <span aria-hidden="true">›</span> Módulo ' + m.num + '</p>' +
      '<div class="resultado"><p class="grande">' + acertos + ' de ' + total + '</p><h1>Módulo concluído</h1><p class="lead">' + esc(frase) + '</p></div>' +
      '<div class="acoes"><button class="botao" type="button" id="pausa">Fazer a pausa de 1 minuto</button>' +
      '<a class="botao fantasma" href="#inicio">Voltar aos módulos</a>' +
      '<a class="botao fantasma" href="#m-' + m.id + '" id="refazer">Refazer</a></div>';
    document.getElementById("pausa").onclick = function () { pausa(m); };
    document.getElementById("refazer").onclick = function (e) { e.preventDefault(); rota(true); };
    focar();
  }

  var timer = null;
  function pausa(m) {
    var p = DC.pausas[Math.floor(Math.random() * DC.pausas.length)];
    var total = rapido ? 3 : 60, resta = total;
    app.innerHTML =
      '<div class="pausa"><h1>Pausa para se movimentar</h1>' +
      '<div class="relogio" role="timer" aria-live="off"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="aro"/><circle cx="60" cy="60" r="52" class="aro-on" id="aro" pathLength="100"/></svg><span id="seg">' + resta + '</span></div>' +
      '<h2 class="h2">' + esc(p.t) + '</h2><p class="lead">' + esc(p.d) + '</p>' +
      '<div class="acoes centro"><button class="botao fantasma" type="button" id="pular">Pular a pausa</button></div></div>';
    var seg = document.getElementById("seg"), aro = document.getElementById("aro");
    function desenhar() { seg.textContent = resta; aro.style.strokeDashoffset = 100 - (resta / total) * 100; }
    desenhar();
    clearInterval(timer);
    timer = setInterval(function () {
      resta--; desenhar();
      if (resta <= 0) { clearInterval(timer); A.evento("pausa_feita", { modulo: m.id }); fimPausa(); }
    }, 1000);
    document.getElementById("pular").onclick = function () { clearInterval(timer); A.evento("pausa_pulada", { modulo: m.id }); location.hash = "#inicio"; };
    focar();
  }
  function fimPausa() {
    app.innerHTML = '<div class="pausa"><h1>Pronto, pausa feita</h1><p class="lead">Quando quiser, siga para o próximo módulo.</p>' +
      '<div class="acoes centro"><a class="botao" href="#inicio">Voltar aos módulos</a></div></div>';
    focar();
  }

  /* ---------- rotas ---------- */
  function rota(forcar, hash) {
    clearInterval(timer);
    var h = (hash === undefined ? location.hash : hash).replace("#", "");
    if (h === "m-triagem") return moduloTriagem();
    if (h === "m-casos") return moduloCasos();
    if (h && h !== "inicio" && !forcar) { history.replaceState(null, "", location.pathname + location.search + "#inicio"); }
    progresso = ler("dc-progresso", {});
    telaInicio();
    if (forcar !== true) focar();
  }
  window.addEventListener("hashchange", function (e) {
    var h = new URL(e.newURL).hash;
    if (h === location.hash) rota(false, h); /* ignora mudanças já superadas */
  });

  /* ---------- rodapé, diálogos e aviso de dados ---------- */
  document.getElementById("ano").textContent = new Date().getFullYear();
  document.querySelectorAll("[data-abre]").forEach(function (b) {
    b.addEventListener("click", function () {
      var d = document.getElementById("dlg-" + b.dataset.abre);
      if (d.showModal) d.showModal(); else d.setAttribute("open", "");
    });
  });
  document.querySelectorAll("dialog").forEach(function (d) {
    d.addEventListener("click", function (e) { if (e.target === d || e.target.hasAttribute("data-fecha")) d.close(); });
  });

  var opt = document.getElementById("opt-out"), aviso = document.getElementById("aviso-dados");
  opt.checked = A.optOut();
  opt.addEventListener("change", function () { A.setOptOut(opt.checked); diagnostico(); });
  var visto = ler("dc-aviso-visto", false);
  if (!visto && !A.optOut()) aviso.hidden = false;
  document.getElementById("aviso-ok").onclick = function () { gravar("dc-aviso-visto", true); aviso.hidden = true; };
  document.getElementById("aviso-nao").onclick = function () {
    A.setOptOut(true); opt.checked = true; gravar("dc-aviso-visto", true); aviso.hidden = true; diagnostico();
  };

  /* ---------- painel ?diagnostico ---------- */
  var painel = document.getElementById("diagnostico"), ultimoTeste = "";
  function diagnostico() {
    if (!A.modo.diagnostico) return;
    painel.hidden = false;
    var b = A.bloqueios(), cfg = A.config;
    painel.innerHTML = '<div class="coluna"><h2>Diagnóstico</h2>' +
      '<dl><dt>Versão</dt><dd>' + esc(cfg.versao || "") + '</dd>' +
      '<dt>GoatCounter</dt><dd>' + esc(cfg.goatcounter || "não configurado") + '</dd>' +
      '<dt>Planilha</dt><dd>' + (cfg.planilhaURL ? "configurada" : "planilhaURL vazia") + '</dd>' +
      '<dt>Envio automático</dt><dd>' + (b.length ? "bloqueado: " + esc(b.join(", ")) : "ativo") + '</dd></dl>' +
      '<div class="acoes"><button class="botao" type="button" id="linha-teste">Enviar linha de teste à planilha</button><span class="miudo" id="lt">' + (ultimoTeste ? "Resultado: " + esc(ultimoTeste) : "") + '</span></div>' +
      '<h3>Últimos eventos</h3><ul class="log">' + (A.registro().map(function (r) {
        return '<li>' + esc(r.hora) + ' · ' + esc(r.ev) + ' · ' + (r.enviado ? "enviado" : "não enviado") + (r.motivo ? " (" + esc(r.motivo) + ")" : "") + '</li>';
      }).join("") || "<li>Nenhum evento ainda.</li>") + '</ul></div>';
    document.getElementById("linha-teste").onclick = function () {
      ultimoTeste = A.linhaDeTeste(); diagnostico();
    };
  }
  document.addEventListener("dc-registro", diagnostico);

  /* ---------- início ---------- */
  A.contador(document.getElementById("contador"));
  A.iniciar();
  A.evento("visita", { item: location.hash.replace("#", "") || "inicio" });
  diagnostico();
  if (!location.hash) history.replaceState(null, "", location.pathname + location.search + "#inicio");
  rota(true);
})();
