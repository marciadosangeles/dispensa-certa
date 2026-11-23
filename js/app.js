/*
 * Dispensa Certa — aplicação.
 * Rotas pelo hash: #inicio, #m-<modulo> (mudancas, triagem, regras, acesso, casos, pop), #certificado.
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
  var tq = Date.now(); /* início da pergunta atual, para medir o tempo de resposta */
  function focar() { tq = Date.now(); app.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "auto" }); }
  function letra(i, op) { return "ABCDE"[i] + ": " + op[i]; }

  /* Resposta: acrescenta o tempo desde que a pergunta apareceu. */
  function resposta(dados) {
    dados.tempo_s = Math.round((Date.now() - tq) / 1000);
    tq = Date.now();
    A.evento("resposta", dados);
  }

  /* Abandono: guarda onde a pessoa está; se sair antes de concluir, registra. */
  var emCurso = null;
  function curso(id, etapa) {
    if (!emCurso || emCurso.modulo !== id) emCurso = { modulo: id, t0: Date.now() };
    emCurso.etapa = etapa;
  }
  function cursoFim() { emCurso = null; }
  function abandono(beacon) {
    if (!emCurso) return;
    A.evento("abandono", { modulo: emCurso.modulo, etapa: emCurso.etapa, duracao_s: Math.round((Date.now() - emCurso.t0) / 1000) }, beacon);
    emCurso = null;
  }
  window.addEventListener("pagehide", function () { abandono(true); });
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
      cartaoPerfil() +
      '<section aria-labelledby="t-mod">' +
        '<div class="cab-lista"><h2 id="t-mod">Módulos</h2><span class="miudo">' + feitos + ' de ' + prontos.length + ' disponíveis concluídos</span></div>' +
        '<div class="barra" aria-hidden="true"><div style="width:' + (prontos.length ? feitos / prontos.length * 100 : 0) + '%"></div></div>' +
        '<ol class="modulos">' + DC.modulos.map(cartaoModulo).join("") + '</ol>' +
      '</section>' +
      (todosFeitos() ? '<section class="cartao destaque"><h2>Você concluiu todos os módulos</h2><p>Gere seu certificado de conclusão para imprimir ou salvar em PDF.</p>' +
        '<div class="acoes"><a class="botao" href="#certificado">Ver meu certificado</a></div></section>' : "");
    ligarPerfil();
  }
  /* Perfil opcional: aparece até a pessoa responder ou recusar. */
  var UFS = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");
  var QUEM = ["Farmacêutico(a)", "Estudante em estágio", "Atendente ou balconista", "Outro"];
  var FARM = ["Farmácia ou drogaria privada", "Farmácia pública (SUS)", "Farmácia hospitalar", "Farmácia de manipulação", "Não trabalho em farmácia"];
  function opcoes(lista) {
    return '<option value="">Prefiro não dizer</option>' + lista.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join("");
  }
  function cartaoPerfil() {
    if (ler("dc-perfil", null)) return "";
    return '<section class="cartao perfil" id="perfil" aria-labelledby="t-perfil">' +
      '<h2 id="t-perfil">Conte um pouco sobre você (opcional)</h2>' +
      '<p class="miudo">As respostas ajudam a adaptar o conteúdo. São anônimas e você pode pular.</p>' +
      '<div class="campos">' +
      '<label for="pf-quem">Você é<select id="pf-quem">' + opcoes(QUEM) + '</select></label>' +
      '<label for="pf-farm">Onde atua<select id="pf-farm">' + opcoes(FARM) + '</select></label>' +
      '<label for="pf-uf">Estado<select id="pf-uf">' + opcoes(UFS) + '</select></label>' +
      '</div><div class="acoes"><button class="botao" type="button" id="pf-salvar">Salvar</button>' +
      '<button class="botao fantasma" type="button" id="pf-pular">Prefiro não responder</button></div></section>';
  }
  function ligarPerfil() {
    var b = document.getElementById("pf-salvar"); if (!b) return;
    b.onclick = function () {
      var v = { quem: document.getElementById("pf-quem").value, farmacia: document.getElementById("pf-farm").value, uf: document.getElementById("pf-uf").value };
      gravar("dc-perfil", v);
      A.evento("perfil", {});
      fecharPerfil("Obrigado! Suas respostas foram salvas.");
    };
    document.getElementById("pf-pular").onclick = function () { gravar("dc-perfil", { recusou: true }); fecharPerfil(""); };
  }
  function fecharPerfil(msg) {
    var c = document.getElementById("perfil");
    if (msg) { c.innerHTML = '<p class="miudo" role="status">' + esc(msg) + '</p>'; setTimeout(function () { c.remove(); }, 2500); }
    else c.remove();
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
      curso(m.id, "introdução");
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
      curso(m.id, "triagem");
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
      curso(m.id, "pergunta " + (qi + 1));
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
        resposta({ modulo: m.id, item: q.id, acertou: certo, opcao: letra(i, q.op) });
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
      cursoFim();
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
      curso(m.id, "introdução");
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
      curso(m.id, "caso " + (i + 1));
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
        resposta({ modulo: m.id, item: c.id, acertou: certo, opcao: b.dataset.r === "1" ? "dispensar" : "não dispensar" });
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
      cursoFim();
      salvarProgresso(m.id, { feito: true, acertos: acertos, total: total, em: new Date().toISOString() });
      A.evento("modulo_fim", { modulo: m.id, valor: acertos + "/" + total, duracao_s: dur });
      telaFim(m, acertos, total, acertos >= 6 ? "Você está tomando boas decisões no balcão." : "Vale rever a triagem da receita e tentar de novo.");
    }

    intro();
  }

  /* ---------- Módulos 1, 3, 4 e 6: roteiro em etapas ---------- */
  function moduloRoteiro(id) {
    var m = modulo(id), r = DC.roteiros[id], t0 = Date.now(), acertos = 0, total = 0, k = -1;
    var N = r.etapas.length + 1;
    A.evento("modulo_inicio", { modulo: m.id });

    function intro() {
      curso(m.id, "introdução");
      app.innerHTML = cabecalho(m, 1, N) +
        '<p class="lead">' + esc(r.lead) + '</p>' +
        '<div class="cartao"><h2>Nesta sessão você vai</h2><ul class="lista">' +
        r.itens.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join("") +
        '<li>fazer uma pausa de 1 minuto no final.</li></ul></div>' +
        '<div class="acoes"><button class="botao" type="button" id="ir">Começar</button></div>';
      document.getElementById("ir").onclick = proxima;
      focar();
    }
    function proxima() {
      k++;
      if (k >= r.etapas.length) return fim();
      var e = r.etapas[k];
      curso(m.id, "etapa " + (k + 2) + ": " + e.tipo);
      var topo = cabecalho(m, k + 2, N) + (e.titulo ? '<h2 class="h2">' + esc(e.titulo) + '</h2>' : "") + (e.texto ? '<p>' + esc(e.texto) + '</p>' : "");
      ({ leitura: leitura, classificar: classificar, vf: vf, ordenar: ordenar, checklist: checklist, perguntas: perguntas })[e.tipo](e, topo);
      focar();
    }
    function botaoSeguir(liberado) {
      var ultimo = k === r.etapas.length - 1;
      return '<div class="acoes"><button class="botao" type="button" id="seguir"' + (liberado || rapido ? "" : " disabled") + '>' +
        (ultimo ? "Concluir o módulo" : "Continuar") + '</button></div>';
    }
    function ligarSeguir() { var b = document.getElementById("seguir"); if (b) b.onclick = proxima; }

    function leitura(e, topo) {
      var corpo = "";
      if (e.linha) corpo += '<ol class="tempo">' + e.linha.map(function (l) {
        return '<li class="' + (l[2] || "") + '"><span class="data">' + esc(l[0]) + '</span><span>' + esc(l[1]) + '</span></li>';
      }).join("") + '</ol>';
      if (e.regras) corpo += '<dl class="regras">' + e.regras.map(function (g) {
        return '<div><dt>' + esc(g[0]) + '</dt><dd>' + esc(g[1]) + '</dd></div>';
      }).join("") + '</dl>';
      app.innerHTML = topo + corpo + botaoSeguir(true);
      ligarSeguir();
    }

    function classificar(e, topo) {
      var feitos = 0;
      app.innerHTML = topo + '<ul class="classes">' + e.itens.map(function (it) {
        return '<li id="cl-' + it[0] + '"><p>' + esc(it[1]) + '</p><div class="segmentos" role="group" aria-label="Escolha o sistema">' +
          e.grupos.map(function (g, gi) { return '<button type="button" data-it="' + it[0] + '" data-g="' + gi + '">' + esc(g) + '</button>'; }).join("") +
          '</div><p class="nota" aria-live="polite"></p></li>';
      }).join("") + '</ul>' + botaoSeguir(false);
      ligarSeguir();
      app.querySelector(".classes").addEventListener("click", function (ev) {
        var b = ev.target.closest("button"); if (!b || b.disabled) return;
        var it = e.itens.filter(function (x) { return x[0] === b.dataset.it; })[0];
        var li = document.getElementById("cl-" + it[0]), certo = +b.dataset.g === it[2];
        total++; if (certo) acertos++; feitos++;
        li.querySelectorAll("button").forEach(function (x) {
          x.disabled = true;
          if (+x.dataset.g === it[2]) x.classList.add("certa"); else if (x === b) x.classList.add("errada");
        });
        li.querySelector(".nota").textContent = certo ? "Certo." : "A resposta é: " + e.grupos[it[2]] + ".";
        resposta({ modulo: m.id, item: it[0], acertou: certo, opcao: e.grupos[+b.dataset.g] });
        if (feitos === e.itens.length) document.getElementById("seguir").disabled = false;
      });
    }

    function vf(e, topo) {
      var i = 0;
      function uma() {
        var q = e.lista[i];
        curso(m.id, "afirmação " + (i + 1));
        app.innerHTML = topo + '<p class="miudo">Afirmação ' + (i + 1) + ' de ' + e.lista.length + '</p>' +
          '<article class="receita papel afirma"><p>' + esc(q.p) + '</p></article>' +
          '<div class="acoes decide"><button class="botao" type="button" id="v" data-r="1">Verdadeiro</button>' +
          '<button class="botao fantasma" type="button" id="f" data-r="0">Falso</button></div><div id="retorno" aria-live="polite"></div>';
        app.querySelector(".decide").addEventListener("click", function (ev) {
          var b = ev.target.closest("button"); if (!b || b.disabled) return;
          var certo = (b.dataset.r === "1") === q.v;
          total++; if (certo) acertos++;
          app.querySelectorAll(".decide button").forEach(function (x) { x.disabled = true; });
          b.classList.add(certo ? "certa" : "errada");
          resposta({ modulo: m.id, item: q.id, acertou: certo, opcao: b.dataset.r === "1" ? "verdadeiro" : "falso" });
          var ultima = i === e.lista.length - 1;
          document.getElementById("retorno").innerHTML =
            '<div class="retorno ' + (certo ? "ok" : "nao") + '"><b>' + (certo ? "Certo." : "Não é bem assim.") + '</b> É ' + (q.v ? "verdadeiro" : "falso") + '. ' + esc(q.e) + '</div>' +
            '<div class="acoes"><button class="botao" type="button" id="prox">' + (ultima ? "Continuar" : "Próxima afirmação") + '</button></div>';
          var prox = document.getElementById("prox");
          prox.onclick = function () { if (ultima) proxima(); else { i++; uma(); focar(); } };
          prox.focus();
        });
      }
      uma();
    }

    function ordenar(e, topo) {
      var ordem = [2, 4, 0, 5, 1, 3].filter(function (n) { return n < e.passos.length; });
      var conferido = false;
      function desenhar() {
        app.innerHTML = topo + '<ol class="ordem">' + ordem.map(function (n, pos) {
          var marca = conferido ? (n === pos ? " certo" : " errado") : "";
          return '<li class="' + marca + '"><span class="pos">' + (pos + 1) + '</span><span class="txt">' + esc(e.passos[n]) + '</span>' +
            (conferido ? "" : '<span class="setas"><button type="button" class="seta" data-p="' + pos + '" data-d="-1" aria-label="Subir: ' + esc(e.passos[n]) + '"' + (pos === 0 ? " disabled" : "") + '>↑</button>' +
            '<button type="button" class="seta" data-p="' + pos + '" data-d="1" aria-label="Descer: ' + esc(e.passos[n]) + '"' + (pos === ordem.length - 1 ? " disabled" : "") + '>↓</button></span>') + '</li>';
        }).join("") + '</ol>' +
          (conferido ? '<div id="retorno"></div>' + botaoSeguir(true) : '<div class="acoes"><button class="botao" type="button" id="conferir">Conferir a ordem</button></div>');
        if (conferido) {
          var certos = ordem.filter(function (n, pos) { return n === pos; }).length, tudo = certos === ordem.length;
          document.getElementById("retorno").innerHTML = '<div class="retorno ' + (tudo ? "ok" : "nao") + '"><b>' + (tudo ? "Ordem certa." : certos + " de " + ordem.length + " na posição certa.") + '</b> ' +
            (tudo ? "" : "A ordem correta é: " + e.passos.map(function (p, i) { return (i + 1) + ". " + esc(p); }).join("; ") + ".") + '</div>';
          ligarSeguir();
        } else {
          document.getElementById("conferir").onclick = function () {
            conferido = true;
            var tudo = ordem.every(function (n, pos) { return n === pos; });
            total++; if (tudo) acertos++;
            resposta({ modulo: m.id, item: "ordem", acertou: tudo, opcao: ordem.map(function (n) { return n + 1; }).join("-") });
            desenhar();
          };
          app.querySelector(".ordem").addEventListener("click", function (ev) {
            var b = ev.target.closest(".seta"); if (!b || b.disabled) return;
            var p = +b.dataset.p, d = +b.dataset.d, t = ordem[p];
            ordem[p] = ordem[p + d]; ordem[p + d] = t;
            desenhar();
            var alvo = app.querySelectorAll(".seta")[(p + d) * 2 + (d < 0 ? 0 : 1)];
            if (alvo && !alvo.disabled) alvo.focus();
          });
        }
      }
      desenhar();
    }

    function checklist(e, topo) {
      var st = ler("dc-pop", {});
      app.innerHTML = topo + '<div class="barra" aria-hidden="true"><div id="cb"></div></div><p class="miudo" id="ct"></p>' +
        '<ul class="ck">' + e.itens.map(function (t, n) {
          return '<li><label for="ck' + n + '"><input type="checkbox" id="ck' + n + '"' + (st[n] ? " checked" : "") + '><span>' + esc(t) + '</span></label></li>';
        }).join("") + '</ul>' + botaoSeguir(true);
      function conta() {
        var d = e.itens.filter(function (_, n) { return st[n]; }).length;
        document.getElementById("cb").style.width = (d / e.itens.length * 100) + "%";
        document.getElementById("ct").textContent = d + " de " + e.itens.length + " itens prontos";
      }
      app.querySelector(".ck").addEventListener("change", function (ev) { st[ev.target.id.slice(2)] = ev.target.checked; gravar("dc-pop", st); conta(); });
      conta(); ligarSeguir();
    }

    function perguntas(e, topo) {
      var i = 0;
      function uma() {
        var q = e.lista[i];
        curso(m.id, "pergunta " + (i + 1));
        app.innerHTML = topo + '<p class="miudo">Pergunta ' + (i + 1) + ' de ' + e.lista.length + '</p>' +
          '<fieldset class="questao"><legend>' + esc(q.p) + '</legend>' +
          q.op.map(function (o, n) { return '<button type="button" class="opcao-q" id="op-' + n + '" data-i="' + n + '">' + esc(o) + '</button>'; }).join("") +
          '</fieldset><div id="retorno" aria-live="polite"></div>';
        app.querySelector(".questao").addEventListener("click", function (ev) {
          var b = ev.target.closest(".opcao-q"); if (!b || b.disabled) return;
          var certo = +b.dataset.i === q.c;
          total++; if (certo) acertos++;
          app.querySelectorAll(".opcao-q").forEach(function (x) {
            x.disabled = true;
            if (+x.dataset.i === q.c) x.classList.add("certa"); else if (x === b) x.classList.add("errada");
          });
          resposta({ modulo: m.id, item: q.id, acertou: certo, opcao: letra(+b.dataset.i, q.op) });
          var ultima = i === e.lista.length - 1;
          document.getElementById("retorno").innerHTML =
            '<div class="retorno ' + (certo ? "ok" : "nao") + '"><b>' + (certo ? "Isso mesmo." : "Não é bem assim.") + '</b> ' + esc(q.e) + '</div>' +
            '<div class="acoes"><button class="botao" type="button" id="prox">' + (ultima ? (k === r.etapas.length - 1 ? "Ver resultado" : "Continuar") : "Próxima pergunta") + '</button></div>';
          var prox = document.getElementById("prox");
          prox.onclick = function () { if (ultima) proxima(); else { i++; uma(); focar(); } };
          prox.focus();
        });
      }
      uma();
    }

    function fim() {
      var dur = segundos(t0);
      cursoFim();
      salvarProgresso(m.id, { feito: true, acertos: acertos, total: total, em: new Date().toISOString() });
      A.evento("modulo_fim", { modulo: m.id, valor: acertos + "/" + total, duracao_s: dur });
      telaFim(m, acertos, total, r.fim);
    }

    intro();
  }

  /* ---------- certificado ---------- */
  function todosFeitos() {
    return DC.modulos.every(function (m) { return progresso[m.id] && progresso[m.id].feito; });
  }
  function telaCertificado() {
    if (!todosFeitos() && !rapido) { location.hash = "#inicio"; return; }
    var soma = DC.modulos.reduce(function (s, m) { var p = progresso[m.id] || {}; return [s[0] + (p.acertos || 0), s[1] + (p.total || 0)]; }, [0, 0]);
    var minutos = DC.modulos.reduce(function (s, m) { return s + m.min; }, 0);
    var datas = DC.modulos.map(function (m) { return (progresso[m.id] || {}).em; }).filter(Boolean).sort();
    var data = new Date(datas.length ? datas[datas.length - 1] : Date.now()).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
    app.innerHTML =
      '<div class="nao-imprime"><p class="trilha"><a href="#inicio">Módulos</a> <span aria-hidden="true">›</span> Certificado</p>' +
      '<h1>Seu certificado</h1>' +
      '<label class="campo" for="nome-cert">Nome para o certificado <span class="miudo">(fica só na tela: não é salvo nem enviado)</span></label>' +
      '<input id="nome-cert" type="text" autocomplete="off" maxlength="80" placeholder="Digite seu nome"></div>' +
      '<section class="certificado" aria-label="Certificado de conclusão">' +
        '<img src="img/icone.svg" alt="" width="56" height="56">' +
        '<p class="cert-tit">Certificado de conclusão</p>' +
        '<p>Certificamos que</p><p class="cert-nome" id="cert-nome">&nbsp;</p>' +
        '<p>concluiu os ' + DC.modulos.length + ' módulos do curso <b>Dispensa Certa: SNCR e RDC nº 1.000/2025 na farmácia</b>, com carga estimada de ' + minutos + ' minutos e ' + soma[0] + ' acertos em ' + soma[1] + ' questões.</p>' +
        '<p class="cert-data">' + esc(data) + '</p>' +
        '<p class="cert-rodape">Material educativo de autoria de Márcia dos Angeles Luna Leite. Não substitui certificação oficial.</p>' +
      '</section>' +
      '<div class="acoes nao-imprime"><button class="botao" type="button" id="imprimir">Imprimir ou salvar em PDF</button><a class="botao fantasma" href="#inicio">Voltar aos módulos</a></div>';
    var campo = document.getElementById("nome-cert"), alvo = document.getElementById("cert-nome");
    campo.addEventListener("input", function () { alvo.textContent = campo.value.trim() || " "; });
    document.getElementById("imprimir").onclick = function () { window.print(); };
    A.evento("certificado", { valor: soma[0] + "/" + soma[1] });
    focar();
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
    abandono(false);
    var h = (hash === undefined ? location.hash : hash).replace("#", "");
    if (h === "m-triagem") return moduloTriagem();
    if (h === "m-casos") return moduloCasos();
    if (/^m-(mudancas|regras|acesso|pop)$/.test(h)) return moduloRoteiro(h.slice(2));
    if (h === "certificado") return telaCertificado();
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

  document.getElementById("refazer-perfil").addEventListener("click", function () {
    try { localStorage.removeItem("dc-perfil"); } catch (e) {}
    document.getElementById("dlg-privacidade").close();
    if (location.hash === "#inicio") rota(true); else location.hash = "#inicio";
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
