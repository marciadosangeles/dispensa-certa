/**
 * Dispensa Certa — receptor de eventos anônimos para a Planilha Google.
 *
 * Instalação (resumo; o passo a passo completo está no README):
 *   1. Na planilha: Extensões → Apps Script. Cole este código.
 *   2. Implantar → Nova implantação → Tipo "App da Web".
 *      Executar como: Eu. Quem pode acessar: Qualquer pessoa.
 *   3. Copie a URL terminada em /exec para planilhaURL no config.js.
 *
 * @OnlyCurrentDoc
 */

var ABA = "Registros";
var COLUNAS = ["data_hora", "evento", "sessao", "modulo", "item", "acertou", "opcao", "tempo_s", "etapa", "valor", "duracao_s", "origem", "perfil", "tipo_farmacia", "uf", "aparelho", "tema", "versao"];
var EVENTOS = ["visita", "modulo_inicio", "modulo_fim", "resposta", "abandono", "perfil", "pausa_feita", "pausa_pulada", "certificado", "linha_teste"];

function doPost(e) {
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (EVENTOS.indexOf(d.evento) === -1) return resposta("ignorado");

    var aba = obterAba();
    var linha = COLUNAS.map(function (c) {
      if (c === "data_hora") return new Date();
      var v = d[c] === undefined || d[c] === null ? "" : String(d[c]);
      v = v.slice(0, 120); /* limita o tamanho de cada campo */
      return /^[=+\-@]/.test(v) ? "'" + v : v; /* impede fórmulas */
    });

    var trava = LockService.getDocumentLock();
    trava.waitLock(5000);
    aba.appendRow(linha);
    trava.releaseLock();
    return resposta("ok");
  } catch (err) {
    return resposta("erro");
  }
}

/* Abrir a URL /exec no navegador mostra "ok": serve para conferir a implantação. */
function doGet() {
  return resposta("ok");
}

function obterAba() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(ABA);
  if (!aba) aba = planilha.insertSheet(ABA);
  /* Cria ou atualiza o cabeçalho quando as colunas mudam de versão. */
  var cab = aba.getRange(1, 1, 1, COLUNAS.length);
  if (cab.getValues()[0].join("|") !== COLUNAS.join("|")) {
    if (aba.getLastRow() > 1 && aba.getRange(1, 1).getValue() === "data_hora" && aba.getLastColumn() !== COLUNAS.length) {
      /* Colunas mudaram: guarda os dados antigos numa aba separada e recomeça. */
      aba.setName(ABA + " (versão anterior " + Utilities.formatDate(new Date(), "America/Sao_Paulo", "yyyy-MM-dd HH:mm") + ")");
      aba = planilha.insertSheet(ABA, 0);
      cab = aba.getRange(1, 1, 1, COLUNAS.length);
    }
    cab.setValues([COLUNAS]).setFontWeight("bold");
    aba.setFrozenRows(1);
    aba.getRange(2, 2, aba.getMaxRows() - 1, COLUNAS.length - 1).setNumberFormat("@"); /* texto puro: "3/4" não vira data */
  }
  return aba;
}

function resposta(texto) {
  return ContentService.createTextOutput(texto).setMimeType(ContentService.MimeType.TEXT);
}
