/*
 * Dispensa Certa — conteúdo dos módulos.
 * Fatos conferidos em 23/11/2026. As fontes estão listadas no README.
 */
window.DC = window.DC || {};

DC.modulos = [
  { id: "mudancas", num: 1, titulo: "O que mudou", resumo: "SNCR x SNGPC e a linha do tempo dos prazos.", min: 5, pronto: true },
  { id: "triagem", num: 2, titulo: "Triagem da receita", resumo: "Reconheça os 5 tipos de receita e o caminho de conferência de cada um.", min: 5, pronto: true },
  { id: "regras", num: 3, titulo: "Regras de conferência", resumo: "14 dígitos, assinatura, situação da receita, CPF e emergência.", min: 5, pronto: true },
  { id: "acesso", num: 4, titulo: "Acesso ao SNCR", resumo: "Cadastro Anvisa, perfis, AFE e CNES.", min: 5, pronto: true },
  { id: "casos", num: 5, titulo: "Casos de balcão", resumo: "Você decide: dispensaria ou não? Oito situações reais.", min: 6, pronto: true },
  { id: "pop", num: 6, titulo: "Checklist do POP", resumo: "Prepare a farmácia até março de 2027.", min: 5, pronto: true }
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

/* Módulos 1, 3, 4 e 6: roteiros em etapas.
   Tipos de etapa: leitura, classificar, vf, ordenar, checklist, perguntas. */
DC.roteiros = {
  mudancas: {
    lead: "O SNCR é o novo sistema nacional da Anvisa para as receitas de controlados. Ele não substitui o SNGPC: os dois passam a conviver.",
    itens: ["ver a linha do tempo das mudanças;", "separar o que é do SNCR e o que é do SNGPC;", "responder 3 perguntas rápidas."],
    fim: "Você sabe o que mudou e quando cada regra vale.",
    etapas: [
      { tipo: "leitura", titulo: "Linha do tempo", texto: "Toque nas datas para relembrar. O prazo de 3/3/2027 vale para a data de emissão da receita, não para a validade.",
        linha: [
          ["27/05/2024", "A RDC nº 873/2024 cria o SNCR, usado primeiro pelas Vigilâncias Sanitárias para conceder a numeração aos prescritores."],
          ["Dez/2025", "A RDC nº 1.000/2025 regulamenta as receitas de controlados emitidas eletronicamente."],
          ["18/05/2026", "Novas impressões de receituário físico só no modelo vigente (versão 2)."],
          ["30/09/2026", "Farmácias passam a consultar e registrar receitas numeradas no SNCR. Notificações azul e amarela eletrônicas começam a chegar."],
          ["03/11/2026", "A RDC nº 1.046/2026 estende a transição das receitas de controle especial (RCE) e sujeitas à retenção (RET)."],
          ["04/03/2027", "O número do SNCR passa a ser obrigatório em toda RCE e RET emitida eletronicamente.", "chave"]
        ] },
      { tipo: "classificar", titulo: "SNCR, SNGPC ou os dois?", texto: "Para cada frase, escolha o sistema a que ela se refere.",
        grupos: ["SNCR", "SNGPC", "Os dois"],
        itens: [
          ["s1", "Rastreia cada receita individualmente, da emissão à baixa.", 0],
          ["s2", "Escrituração e movimentação do estoque de controlados.", 1],
          ["s3", "Registro da utilização da receita após a venda.", 0],
          ["s4", "Recebe a escrituração das receitas em papel.", 1],
          ["s5", "Acesso com gov.br individual e perfil SNCR-Farmácia.", 0],
          ["s6", "Trata de medicamentos sujeitos a controle especial.", 2]
        ] },
      { tipo: "perguntas", lista: [
        { id: "m1", p: "O SNCR substitui o SNGPC?",
          op: ["Sim, desde 30/09/2026", "Não: os dois coexistem, com funções diferentes", "Só para receitas eletrônicas"],
          c: 1, e: "O SNCR cuida da receita (numeração, consulta e registro de uso). O SNGPC continua com a escrituração, para receitas físicas e eletrônicas." },
        { id: "m2", p: "A RDC nº 1.000/2025 tornou obrigatória a receita eletrônica de controlados?",
          op: ["Sim, o papel deixou de valer", "Não: o papel continua válido e a emissão eletrônica é facultativa", "Sim, mas só para notificações"],
          c: 1, e: "A norma não extinguiu o receituário em papel. Os talonários continuam podendo ser usados." },
        { id: "m3", p: "Uma receita branca eletrônica sem número foi emitida em 20/02/2027, com validade de 30 dias. Ela pode ser atendida em 15/03/2027?",
          op: ["Sim: o prazo da transição vale para a emissão, e ela está na validade", "Não: depois de 3/3/2027 toda receita sem número é inválida", "Só com autorização da Vigilância Sanitária"],
          c: 0, e: "A data-limite de 3/3/2027 se refere à emissão. Emitida dentro da transição, a receita vale até o fim da sua validade." }
      ] }
    ]
  },

  regras: {
    lead: "Algumas regras de conferência pegam muita gente no balcão. Teste o que você já sabe: verdadeiro ou falso?",
    itens: ["julgar 9 afirmações;", "ler o resumo das regras para consulta."],
    fim: "Você revisou as regras que mais causam erro na dispensação.",
    etapas: [
      { tipo: "vf", titulo: "Verdadeiro ou falso?", lista: [
        { id: "r1", p: "Uma notificação de receita com 13 dígitos pode ser dispensada se o sistema encontrar o registro ao completar o zero.", v: false,
          e: "O correto são 14 dígitos, com sequência final de 7. Mesmo que o registro seja encontrado, o documento está incorreto." },
        { id: "r2", p: "A assinatura gov.br é suficiente para receitas eletrônicas de medicamentos da Portaria 344.", v: false,
          e: "Esses receituários exigem assinatura qualificada ICP-Brasil. A gov.br é uma assinatura avançada." },
        { id: "r3", p: "Só a receita com situação “autorizada” no SNCR pode ser atendida.", v: true,
          e: "Número cancelado, inválido ou não atribuído ao prescritor indica que a dispensação não deve ocorrer." },
        { id: "r4", p: "Uma receita “utilizada” nunca pode voltar a ser usada, em nenhum caso.", v: false,
          e: "A exceção é a entrega parcelada prevista para receitas sujeitas à retenção." },
        { id: "r5", p: "Nos receituários da Portaria 344, nome e CPF do paciente são obrigatórios; sem CPF, admite-se “não possui” como exceção.", v: true,
          e: "Para estrangeiros, vale o passaporte. A Anvisa admite “não possui” quando o paciente não tem CPF." },
        { id: "r6", p: "Nas receitas de antimicrobianos (RDC nº 471/2021), o CPF do paciente é obrigatório.", v: false,
          e: "Nesses receituários o CPF ou passaporte não é obrigatório." },
        { id: "r7", p: "Receituários de modelo antigo já impressos podem ser aceitos, mas novas impressões só no modelo vigente.", v: true,
          e: "Desde 18/05/2026 as novas impressões devem seguir a versão vigente. A receita também precisa estar na validade." },
        { id: "r8", p: "A prescrição emergencial pode ser emitida eletronicamente.", v: false,
          e: "Ela continua restrita ao papel e deve ser apresentada à autoridade sanitária em até 72 horas." },
        { id: "r9", p: "O balconista pode sinalizar um problema na receita, mas quem decide a dispensação é o farmacêutico.", v: true,
          e: "Cabe ao responsável técnico treinar a equipe e padronizar como recusar e encaminhar." }
      ] },
      { tipo: "leitura", titulo: "Resumo para consulta", texto: "Guarde estas regras para o dia a dia.",
        regras: [
          ["Situação no SNCR", "Só “autorizada” é atendida. “Utilizada” não se reutiliza, exceto na entrega parcelada da RET."],
          ["Número", "Notificação com 14 dígitos, sequência final de 7. Números de papel e eletrônicos não se trocam."],
          ["Assinatura", "Portaria 344: assinatura qualificada ICP-Brasil. Valide no VALIDAR do ITI."],
          ["Documento", "Só o arquivo nato-digital vale. Foto, print e PDF escaneado não são receita eletrônica."],
          ["CPF", "Obrigatório na Portaria 344 (passaporte ou “não possui” como exceção). Não obrigatório na RDC nº 471/2021."],
          ["Assinatura inválida", "Não finalize sem avaliar. Persistindo o problema, oriente o retorno ao prescritor ou à plataforma."],
          ["Registro por engano", "A farmácia pode cancelar o registro de utilização em cerca de 30 minutos."],
          ["Emergência", "Só em papel, com apresentação à autoridade sanitária em até 72 horas."]
        ] }
    ]
  },

  acesso: {
    lead: "Para consultar e registrar receitas numeradas, cada pessoa do balcão precisa de acesso ao SNCR, liberado pelo responsável legal da farmácia.",
    itens: ["conhecer os requisitos de acesso;", "pôr em ordem os passos de liberação;", "responder 4 perguntas sobre o que trava o acesso."],
    fim: "Você sabe como a farmácia libera o acesso ao SNCR.",
    etapas: [
      { tipo: "leitura", titulo: "Quem precisa de quê", texto: "O acesso passa pelo Cadastro Anvisa. Cada pessoa entra com a própria conta gov.br.",
        regras: [
          ["Farmácia ou drogaria privada", "Identificada pela AFE, que precisa estar publicada. CNES não é exigido."],
          ["Farmácia ou dispensário público", "Identificado pelo CNES."],
          ["Responsável legal", "Confere o estabelecimento, cadastra colaboradores pelo CPF e atribui os perfis."],
          ["Gestor de cadastro", "Opcional: ajuda a administrar colaboradores e perfis."],
          ["Farmacêutico e atendentes autorizados", "Consultam receitas e registram a utilização em sncr.anvisa.gov.br."]
        ] },
      { tipo: "ordenar", titulo: "Ponha os passos em ordem", texto: "Use as setas para mover cada passo até a posição certa e depois confira.",
        passos: [
          "Responsável legal entra no Cadastro Anvisa com o próprio gov.br",
          "Confere se o estabelecimento está vinculado e atualizado",
          "Cadastra cada colaborador do balcão pelo CPF",
          "Atribui o perfil SNCR",
          "Atribui o perfil SNCR-Farmácia",
          "Colaborador entra no SNCR com o próprio gov.br e testa uma consulta"
        ] },
      { tipo: "perguntas", lista: [
        { id: "a1", p: "Uma drogaria privada precisa de CNES para acessar o SNCR?",
          op: ["Sim, sempre", "Não: o que a identifica é a AFE publicada", "Só se tiver mais de uma filial"],
          c: 1, e: "CNES é exigido de farmácias e dispensários públicos. A farmácia privada é identificada pela AFE." },
        { id: "a2", p: "A AFE da farmácia está em análise, com protocolo aberto e sem publicação. O que acontece?",
          op: ["Ela acessa normalmente", "Ela não acessa o SNCR até a publicação", "Ela acessa só para consultar"],
          c: 1, e: "Sem AFE publicada, a farmácia não é identificada no SNCR." },
        { id: "a3", p: "Um colaborador foi cadastrado pelo CPF, mas não consegue consultar receitas. Qual a causa mais provável?",
          op: ["Os perfis SNCR e SNCR-Farmácia não foram atribuídos", "Falta o CNES da farmácia", "A consulta só funciona no computador do responsável legal"],
          c: 0, e: "Cadastrar não basta: os dois perfis precisam ser atribuídos, primeiro SNCR e depois SNCR-Farmácia." },
        { id: "a4", p: "Ao consultar o número de uma receita no SNCR, a utilização fica registrada?",
          op: ["Sim, automaticamente", "Não: a consulta não registra nada", "Só depois de 24 horas"],
          c: 1, e: "Consultar é seguro. O registro de utilização é uma ação separada, feita após a entrega." }
      ] }
    ]
  },

  pop: {
    lead: "Até 4/3/2027 a farmácia precisa estar pronta para receber receitas numeradas em todos os turnos. Use esta lista para revisar o Procedimento Operacional Padrão (POP).",
    itens: ["marcar o que a farmácia já tem (no estágio, o que você observou);", "responder 3 perguntas rápidas."],
    fim: "Você tem um roteiro para preparar a farmácia para o SNCR.",
    etapas: [
      { tipo: "checklist", titulo: "Checklist do POP", texto: "Marque o que já está pronto. A lista fica salva neste aparelho.",
        itens: [
          "AFE publicada e responsável legal vinculado no Cadastro Anvisa",
          "Colaboradores do balcão com gov.br e perfis SNCR e SNCR-Farmácia",
          "Pelo menos uma pessoa habilitada em cada turno",
          "Rotina para inativar o acesso de quem sai da empresa",
          "Sistema da farmácia testado com o fornecedor, inclusive a integração com o SNGPC",
          "POP de dispensação atualizado com os fluxos: papel, eletrônica com número e sem número",
          "Procedimento padrão de recusa e de encaminhamento ao prescritor",
          "Equipe treinada para distinguir foto, PDF escaneado e documento nato-digital",
          "Guarda do arquivo original e da cópia com a anotação da entrega",
          "Alguém responsável por acompanhar os comunicados da Anvisa"
        ] },
      { tipo: "perguntas", lista: [
        { id: "p1", p: "Por que manter alguém habilitado no SNCR em todos os turnos?",
          op: ["Porque sem acesso não se conclui a entrega de uma receita numerada", "Porque a Anvisa audita cada turno", "Não é necessário: o registro pode ser feito no mês seguinte"],
          c: 0, e: "O registro de utilização é obrigatório. Sem acesso, a dispensação da receita numerada não se completa." },
        { id: "p2", p: "O que a farmácia deve guardar de uma receita eletrônica dispensada?",
          op: ["Só um print da tela", "O arquivo eletrônico original e a cópia impressa com a anotação da entrega", "Nada: o SNCR guarda tudo"],
          c: 1, e: "A orientação da Anvisa é manter o arquivo original e a cópia em que se anota a entrega." },
        { id: "p3", p: "Um atendente saiu da empresa. O que fazer com o acesso dele?",
          op: ["Nada, o acesso expira sozinho", "Registrar a inativação no Cadastro Anvisa", "Trocar a senha do gov.br dele"],
          c: 1, e: "O responsável legal ou o gestor de cadastro registra a data de inativação do colaborador." }
      ] }
    ]
  }
};
