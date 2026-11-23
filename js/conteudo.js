/*
 * Dispensa Certa — conteúdo dos módulos.
 * Fatos conferidos em 23/11/2026. As fontes estão listadas no README.
 */
window.DC = window.DC || {};

DC.modulos = [
  { id: "mudancas", num: 1, titulo: "O que mudou", resumo: "SNCR x SNGPC e a linha do tempo dos prazos.", min: 5, pronto: false },
  { id: "triagem", num: 2, titulo: "Triagem da receita", resumo: "Reconheça os 5 tipos de receita e o caminho de conferência de cada um.", min: 5, pronto: true },
  { id: "regras", num: 3, titulo: "Regras de conferência", resumo: "14 dígitos, assinatura, situação da receita, CPF e emergência.", min: 5, pronto: false },
  { id: "acesso", num: 4, titulo: "Acesso ao SNCR", resumo: "Cadastro Anvisa, perfis, AFE e CNES.", min: 5, pronto: false },
  { id: "casos", num: 5, titulo: "Casos de balcão", resumo: "Você decide: dispensaria ou não? Oito situações reais.", min: 6, pronto: true },
  { id: "pop", num: 6, titulo: "Checklist do POP", resumo: "Prepare a farmácia até março de 2027.", min: 5, pronto: false }
];

/* Módulo 2: tipos de receita e o caminho de conferência */
DC.tipos = [
  {
    id: "papel", nome: "Receita em papel", cor: "papel",
    passos: [
      ["Modelo e campos", "Modelo vigente, data, dados do paciente e do prescritor, assinatura."],
      ["Validade", "Confira se a receita ainda está no prazo legal de dispensação."],
      ["Retenção", "Retenha a via quando a norma exigir."],
      ["SNGPC", "Escriture a movimentação do medicamento normalmente."]
    ],
    veredito: ["ok", "Pode dispensar. Receita em papel não precisa de número do SNCR, inclusive as de antimicrobianos e de agonistas de GLP-1."]
  },
  {
    id: "com", nome: "Eletrônica com número SNCR", cor: "branca",
    passos: [
      ["Documento nato-digital", "Arquivo original emitido pelo sistema de prescrição, não foto nem escaneado."],
      ["Assinatura", "Assinatura qualificada ICP-Brasil, validada, por exemplo, no VALIDAR do ITI."],
      ["Consulta no SNCR", "Atenda somente se a situação for “autorizada”."],
      ["Entrega e registro", "Após a venda, registre a utilização da receita no SNCR."],
      ["SNGPC e guarda", "Escriture no SNGPC e guarde o arquivo original e a cópia com a anotação da entrega."]
    ],
    veredito: ["ok", "Pode dispensar quando a consulta mostra “autorizada”. Um registro feito por engano pode ser cancelado pela farmácia em cerca de 30 minutos."]
  },
  {
    id: "sem", nome: "Eletrônica sem número", cor: "branca",
    passos: [
      ["Data de emissão", "Receita de controle especial (branca) ou sujeita à retenção (antimicrobiano, GLP-1) emitida até 3/3/2027."],
      ["Documento e assinatura", "Nato-digital, com assinatura válida e dados do prescritor coerentes."],
      ["Validade", "Dentro do prazo legal da receita. O prazo de 3/3/2027 vale para a emissão, não para a validade."],
      ["Guarda e SNGPC", "Guarde o arquivo original e o registro da entrega, e escriture no SNGPC."]
    ],
    veredito: ["ok", "Pode dispensar durante a transição. Como a receita não tem número, não há registro de uso no SNCR. A partir de 4/3/2027 ela precisará do número."]
  },
  {
    id: "notif", nome: "Notificação azul ou amarela eletrônica", cor: "azul",
    passos: [
      ["Número", "A notificação traz 14 dígitos, com sequência final de 7, zeros à esquerda incluídos."],
      ["Assinatura", "Assinatura qualificada ICP-Brasil. A assinatura gov.br não vale para medicamentos da Portaria 344."],
      ["Consulta no SNCR", "Situação “autorizada” e número atribuído ao prescritor."],
      ["Registro", "Registre a utilização no SNCR após a entrega."],
      ["SNGPC", "Escriture a movimentação e guarde o arquivo original."]
    ],
    veredito: ["ok", "Pode dispensar só depois de conferir o número e a situação no SNCR. Os números de notificação em papel e eletrônica são diferentes e não podem ser trocados."]
  },
  {
    id: "foto", nome: "Foto, print ou PDF escaneado", cor: "alerta",
    passos: [
      ["Origem do documento", "Foto de receita em papel ou PDF digitalizado não é receita eletrônica."],
      ["Orientação", "Peça a via original em papel ou a receita nato-digital ao prescritor ou à plataforma."]
    ],
    veredito: ["nao", "Não dispense. Foto de receita física no celular não é receita eletrônica válida."]
  }
];

DC.fixacaoTriagem = [
  {
    id: "t1", p: "Chegou uma receita de antibiótico em papel, sem número do SNCR, dentro da validade e com todos os campos. O que fazer?",
    op: ["Recusar, porque falta o número do SNCR", "Dispensar, retendo a via e escriturando no SNGPC", "Pedir que o prescritor emita uma notificação azul"],
    c: 1, e: "Receita em papel fica fora da numeração do SNCR, inclusive a de antimicrobianos. Os demais requisitos continuam valendo."
  },
  {
    id: "t2", p: "Até quando receitas de controle especial e sujeitas à retenção podem ser emitidas eletronicamente sem o número do SNCR?",
    op: ["Até 30 de outubro de 2026", "Até 3 de março de 2027", "Não há prazo: o número nunca será obrigatório"],
    c: 1, e: "A RDC nº 1.046/2026 estendeu a transição até 3/3/2027. A partir de 4/3/2027 o número passa a ser obrigatório."
  },
  {
    id: "t3", p: "Numa receita eletrônica com número do SNCR, quando a farmácia registra a utilização?",
    op: ["Antes de consultar a situação", "Depois da venda, no SNCR", "Apenas no SNGPC, no fim do mês"],
    c: 1, e: "Primeiro se consulta (a consulta não registra nada). O registro de utilização é feito após a entrega, e o SNGPC continua sendo escriturado."
  },
  {
    id: "t4", p: "O paciente mostra no celular a foto de uma receita de controle especial em papel. Ela é:",
    op: ["Uma receita eletrônica válida", "Válida se a foto estiver nítida", "Não é receita eletrônica válida"],
    c: 2, e: "Só vale como eletrônica o documento nato-digital, emitido pelo sistema e corretamente assinado. Foto, print e PDF escaneado não valem."
  }
];

/* Módulo 5: casos de balcão */
DC.casos = [
  { id: "c1", cor: "azul", tipo: "Notificação de receita azul eletrônica",
    txt: "Clonazepam 2 mg. Assinatura ICP-Brasil válida. A consulta no SNCR mostra a situação “utilizada”.",
    dispensa: false, e: "Uma receita “utilizada” não pode ser usada de novo. Oriente o paciente a procurar o prescritor." },
  { id: "c2", cor: "branca", tipo: "Receita de antimicrobiano eletrônica, sem número do SNCR",
    txt: "Amoxicilina. Emitida e assinada (ICP-Brasil) em 10/11/2026, dentro da validade.",
    dispensa: true, e: "Durante a transição, até 3/3/2027, a receita sujeita à retenção pode vir sem número. Guarde o arquivo original e o registro da entrega." },
  { id: "c3", cor: "alerta", tipo: "Foto enviada por WhatsApp",
    txt: "Foto de uma receita branca de controle especial, em papel, de sertralina.",
    dispensa: false, e: "Foto de receita física não é receita eletrônica válida. Peça a via original." },
  { id: "c4", cor: "branca", tipo: "Receita branca eletrônica assinada com gov.br",
    txt: "Medicamento da Portaria 344. A assinatura é validada como gov.br (assinatura avançada), não como ICP-Brasil.",
    dispensa: false, e: "Para controlados da Portaria 344 a assinatura precisa ser qualificada ICP-Brasil. Oriente o retorno ao prescritor ou à plataforma." },
  { id: "c5", cor: "azul", tipo: "Notificação azul em papel",
    txt: "O número impresso tem 13 dígitos.",
    dispensa: false, e: "O correto são 14 dígitos, com sequência final de 7. Não dispense, mesmo que completar o zero à mão encontre o registro." },
  { id: "c6", cor: "papel", tipo: "Receita de agonista de GLP-1 em papel",
    txt: "Semaglutida. Receita manuscrita, sem número do SNCR, dentro da validade e com todos os campos.",
    dispensa: true, e: "Receita em papel de GLP-1 ou de antimicrobiano não precisa de número do SNCR. Não recuse só por isso." },
  { id: "c7", cor: "amarela", tipo: "Notificação de receita amarela eletrônica",
    txt: "14 dígitos, assinatura ICP-Brasil válida, e a consulta no SNCR mostra “autorizada”.",
    dispensa: true, e: "Pode dispensar. Depois da venda, registre a utilização no SNCR e escriture no SNGPC." },
  { id: "c8", cor: "branca", tipo: "Receita eletrônica com número do SNCR",
    txt: "A consulta mostra que o número não foi atribuído ao prescritor que assina a receita.",
    dispensa: false, e: "Número cancelado, inválido ou não atribuído ao prescritor indica que a dispensação não deve ocorrer." }
];

/* Pausas para movimento entre módulos */
DC.pausas = [
  { t: "Ombros soltos", d: "Gire os ombros para trás devagar, 5 vezes. Depois, 5 vezes para a frente." },
  { t: "Olhar distante", d: "Olhe para algo a pelo menos 6 metros por 20 segundos. Pisque algumas vezes." },
  { t: "Em pé", d: "Levante-se, apoie as mãos na cintura e incline o tronco para cada lado, sem pressa." },
  { t: "Mãos e punhos", d: "Abra e feche as mãos 10 vezes e gire os punhos nos dois sentidos." }
];
