/*
 * Dispensa Certa — análise de uso com privacidade.
 *
 * Regras:
 *  - Nada é enviado com ?teste, ?rapido, em ?diagnostico (exceto o botão de linha de teste),
 *    em arquivo local (file://), em localhost ou quando a pessoa escolhe "Não enviar meus dados".
 *  - GoatCounter: visitas e eventos, sem cookies.
 *  - Planilha Google (Apps Script): uma linha por evento, sem dados pessoais.
 */
(function () {
  var cfg = window.DC_CONFIG || {};
  var q = new URLSearchParams(location.search);
  var modo = {
    teste: q.has("teste"),
    rapido: q.has("rapido"),
    diagnostico: q.has("diagnostico")
  };
  var local = location.protocol === "file:" || /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname);

  function optOut() {
    try { return localStorage.getItem("dc-nao-enviar") === "1"; } catch (e) { return false; }
  }
  function setOptOut(v) {
    try { v ? localStorage.setItem("dc-nao-enviar", "1") : localStorage.removeItem("dc-nao-enviar"); } catch (e) {}
  }

  /* Motivos que bloqueiam o envio automático. Lista vazia = pode enviar. */
  function bloqueios() {
    var m = [];
    if (local) m.push("arquivo local ou localhost");
    if (modo.teste) m.push("modo ?teste");
    if (modo.rapido) m.push("modo ?rapido");
    if (modo.diagnostico) m.push("modo ?diagnostico");
    if (optOut()) m.push("pessoa escolheu não enviar dados");
    return m;
  }
  function podeEnviar() { return bloqueios().length === 0; }

  /* Código aleatório por sessão da aba: não identifica a pessoa. */
  function sessao() {
    try {
      var s = sessionStorage.getItem("dc-sessao");
      if (!s) {
        var a = new Uint8Array(6); crypto.getRandomValues(a);
        s = Array.from(a, function (b) { return b.toString(16).padStart(2, "0"); }).join("");
        sessionStorage.setItem("dc-sessao", s);
      }
      return s;
    } catch (e) { return "sem-sessao"; }
  }
  /* Origem da visita: ?origem=... no link (ex.: ?origem=whatsapp) ou o site que trouxe a pessoa.
     Calculada uma vez por sessão. WhatsApp e apps costumam não informar o site: aparecem como "direto". */
  function origem() {
    try {
      var o = sessionStorage.getItem("dc-origem");
      if (o) return o;
      var p = (q.get("origem") || q.get("utm_source") || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30);
      if (!p) {
        var h = "";
        try { h = document.referrer ? new URL(document.referrer).hostname : ""; } catch (e) {}
        if (!h || h === location.hostname) p = "direto";
        else if (/whatsapp|wa\.me/.test(h)) p = "whatsapp";
        else if (/instagram/.test(h)) p = "instagram";
        else if (/facebook|fb\./.test(h)) p = "facebook";
        else if (/linkedin|lnkd/.test(h)) p = "linkedin";
        else if (/(^|\.)t\.co$|twitter|x\.com/.test(h)) p = "x";
        else if (/google\./.test(h)) p = "google";
        else if (/bing\.|duckduckgo|yahoo/.test(h)) p = "outra busca";
        else if (/github/.test(h)) p = "github";
        else p = "outro site";
      }
      sessionStorage.setItem("dc-origem", p);
      return p;
    } catch (e) { return "desconhecida"; }
  }
  /* Perfil declarado pela pessoa (opcional), guardado só no aparelho. */
  function perfil() {
    try { return JSON.parse(localStorage.getItem("dc-perfil") || "{}"); } catch (e) { return {}; }
  }

  function aparelho() { return window.matchMedia("(max-width: 700px)").matches ? "celular" : "computador"; }
  function tema() {
    var t = document.documentElement.dataset.theme;
    if (t) return t === "dark" ? "escuro" : "claro";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
  }

  var registro = []; /* últimos eventos, para o painel de diagnóstico */
  function anotar(ev, enviado, motivo) {
    registro.unshift({ hora: new Date().toLocaleTimeString("pt-BR"), ev: ev, enviado: enviado, motivo: motivo || "" });
    registro = registro.slice(0, 12);
    document.dispatchEvent(new CustomEvent("dc-registro"));
  }

  /* GoatCounter: carrega o script só quando o envio é permitido. */
  var gcCarregado = false;
  function carregarGoatCounter() {
    if (gcCarregado || !cfg.goatcounter || !podeEnviar()) return;
    gcCarregado = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.dataset.goatcounter = "https://" + cfg.goatcounter + ".goatcounter.com/count";
    document.head.appendChild(s);
  }

  function linha(evento, dados) {
    dados = dados || {};
    return {
      evento: evento,
      sessao: sessao(),
      modulo: dados.modulo || "",
      item: dados.item || "",
      acertou: dados.acertou === undefined ? "" : (dados.acertou ? "sim" : "nao"),
      valor: dados.valor === undefined ? "" : String(dados.valor),
      duracao_s: dados.duracao_s === undefined ? "" : dados.duracao_s,
      opcao: dados.opcao || "",
      tempo_s: dados.tempo_s === undefined ? "" : dados.tempo_s,
      etapa: dados.etapa || "",
      origem: origem(),
      perfil: perfil().quem || "",
      tipo_farmacia: perfil().farmacia || "",
      uf: perfil().uf || "",
      aparelho: aparelho(),
      tema: tema(),
      versao: cfg.versao || ""
    };
  }

  function enviarPlanilha(corpo, usarBeacon) {
    if (!cfg.planilhaURL) return false;
    var texto = JSON.stringify(corpo);
    if (usarBeacon && navigator.sendBeacon) {
      return navigator.sendBeacon(cfg.planilhaURL, new Blob([texto], { type: "text/plain;charset=utf-8" }));
    }
    fetch(cfg.planilhaURL, {
      method: "POST", mode: "no-cors", keepalive: true,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: texto
    }).catch(function () {});
    return true;
  }

  /* Evento público: vai ao GoatCounter (contagem) e à planilha (detalhe). */
  function evento(nome, dados, usarBeacon) {
    if (!podeEnviar()) { anotar(nome, false, bloqueios().join(", ")); return; }
    if (nome !== "visita" && window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: "dispensa-certa/" + nome + (dados && dados.modulo ? "/" + dados.modulo : ""), title: nome, event: true });
    }
    var ok = enviarPlanilha(linha(nome, dados), usarBeacon);
    anotar(nome, true, ok ? "" : "sem URL da planilha: só GoatCounter");
  }

  /* Botão do modo ?diagnostico: grava uma linha de teste mesmo com o modo ativo,
     mas nunca em arquivo local. */
  function linhaDeTeste() {
    if (local) { anotar("linha_teste", false, "arquivo local ou localhost"); return "bloqueado: arquivo local"; }
    if (!cfg.planilhaURL) { anotar("linha_teste", false, "planilhaURL vazia no config.js"); return "sem URL da planilha"; }
    enviarPlanilha(linha("linha_teste", { item: "diagnostico" }), false);
    anotar("linha_teste", true, "confira a planilha");
    return "enviada";
  }

  /* Contador público de visitas desta página (precisa da opção
     "Allow adding visitor counts on your website" ativa no GoatCounter). */
  function contador(el) {
    if (!el || !cfg.goatcounter || location.protocol === "file:") return;
    var caminho = location.pathname || "/";
    var url = "https://" + cfg.goatcounter + ".goatcounter.com/counter/" + encodeURIComponent(caminho) + ".json";
    fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (d && d.count) el.textContent = "Visitas: " + d.count;
    }).catch(function () {});
  }

  window.DCAnalytics = {
    modo: modo, local: local, bloqueios: bloqueios, podeEnviar: podeEnviar,
    optOut: optOut, setOptOut: function (v) { setOptOut(v); if (!v) carregarGoatCounter(); },
    evento: evento, linhaDeTeste: linhaDeTeste, contador: contador,
    registro: function () { return registro; }, config: cfg, iniciar: carregarGoatCounter,
    origem: origem, perfil: perfil
  };
})();
