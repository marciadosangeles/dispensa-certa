# Dispensa Certa

Curso rápido e prático sobre o **Sistema Nacional de Controle de Receituários (SNCR)** e a **RDC nº 1.000/2025** na farmácia, para farmacêuticos e estudantes de farmácia em estágio.

Site: https://marciadosangeles.github.io/dispensa-certa/

## O que o app oferece

São seis módulos de cerca de 5 minutos. Cada um traz uma explicação curta, uma atividade e uma pergunta de fixação, e termina com uma pausa de 1 minuto para movimento (que pode ser pulada).

| Nº | Módulo | Situação |
|---|---|---|
| 1 | O que mudou: SNCR x SNGPC e prazos | em produção |
| 2 | Triagem da receita: 5 tipos e o caminho de conferência de cada um | disponível |
| 3 | Regras de conferência | em produção |
| 4 | Acesso ao SNCR: Cadastro Anvisa, perfis, AFE e CNES | em produção |
| 5 | Casos de balcão: 8 situações, “dispensaria?” | disponível |
| 6 | Checklist do POP | em produção |

O progresso fica salvo só no aparelho de quem usa (`localStorage`).

## Fontes do conteúdo

Fatos conferidos em 23/11/2026. As regras estão em transição, então reveja o conteúdo sempre que a Anvisa publicar novidades.

- **Prazo de transição até 3/3/2027 (RDC nº 1.046/2026):** CFF, [Anvisa prorroga até 3/3/2027 prazo para adaptação ao SNCR](https://site.cff.org.br/noticia/Noticias-gerais/30/10/2026/anvisa-prorroga-ate-3-3-2027-prazo-para-adaptacao-ao-sncr) (30/10/2026). Também a nota sobre a publicação no DOU de 3/11/2026, que altera o art. 18 da RDC nº 1.000/2025 ([Atlas Público](https://atlaspublico.com.br/noticias/anvisa-prorroga-ate-3-de-marco-de-2027-a-dispensa-de-97141)).
- **O que é o SNCR, o papel da farmácia, a receita física e a relação com o SNGPC:** CFF, [SNCR: o que muda para farmácias e drogarias](https://site.cff.org.br/noticia/Noticias-gerais/21/05/2026/sncr-o-que-muda-para-farmacias-e-drogarias-com-o-novo-sistema-de-controle-de-receitas) (21/05/2026).
- **Cartilha oficial:** Anvisa, [SNCR e receituários controlados: cartilha para farmácias](https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/controlados/sncr/cartilha_sncr_farmacias_vf.pdf/@@display-file/file).
- **Acesso, perfis e Cadastro Anvisa:** Anvisa, [Cadastro Anvisa e acesso ao SNCR: perguntas e respostas](https://www.gov.br/anvisa/pt-br/sistemas/cadastro/arquivos/perguntas_respostas_sncr_2026.pdf/@@display-file/file) (outubro/2026).
- **Regras práticas de conferência:** ICTQ, [CRF-GO e CRF-SP esclarecem pontos críticos do SNCR](https://ictq.com.br/farmacia-clinica/5186-diretoras-do-crf-go-e-crf-sp-esclarecem-pontos-criticos-do-sncr-para-a-rotina-do-farmaceutico). Fonte para: gov.br x ICP-Brasil, foto de receita, 14 dígitos, CPF, modelos antigos e GLP-1 em papel.
- **Situação “autorizada” e “utilizada”, entrega parcelada e cancelamento em cerca de 30 minutos:** resumo da cartilha da Anvisa em [Grupo AMR Saúde](https://www.grupoamrsaude.com.br/post/sncr-na-farm%C3%A1cia-o-prazo-mudou-o-que-o-dono-precisa-fazer-agora) e no [Correio Braziliense](https://www.correiobraziliense.com.br/cbradar/receita-eletronica-de-remedio-controlado-e-de-antibiotico-passa-a-exigir-a-numeracao-do-sistema-sncr-da-anvisa-no-fim-de-outubro-de-2026-depois-de-um-mes-de-transicao-e-a-receita-em-papel-fica-fora/).
- **Validação de assinatura digital:** Instituto Nacional de Tecnologia da Informação, [VALIDAR](https://validar.iti.gov.br/).

## Estrutura

```
index.html             página única (rotas por #hash: #inicio, #m-triagem, #m-casos)
config.js              códigos do GoatCounter e da planilha
css/style.css          visual, modo claro e escuro
js/conteudo.js         textos, tipos de receita, perguntas e casos
js/analytics.js        regras de envio de dados de uso
js/app.js              telas, progresso, pausas, rodapé e diagnóstico
img/                   ícones e imagem de compartilhamento (1200×630)
apps-script/Codigo.gs  código para colar no Apps Script da planilha
```

O site é estático (HTML, CSS e JavaScript puro), sem servidor e sem etapa de compilação. A única dependência externa é a fonte Public Sans, carregada do Google Fonts com fontes do sistema como alternativa.

## Modos de teste

Acrescente ao endereço:

| Modo | Exemplo | O que faz |
|---|---|---|
| `?rapido` | `.../dispensa-certa/?rapido` | Libera o botão de continuar da triagem sem explorar os 5 tipos e reduz a pausa para 3 s. Não envia dados. |
| `?teste` | `.../dispensa-certa/?teste` | Uso normal, sem envio de dados. |
| `?diagnostico` | `.../dispensa-certa/?diagnostico` | Mostra no fim da página a configuração, os motivos de bloqueio e os últimos eventos, com o botão **Enviar linha de teste à planilha**. Eventos automáticos não são enviados nesse modo, só a linha de teste. |

Nunca há envio quando o site é aberto como arquivo local (`file://`) ou em `localhost`.

## Análise de uso e privacidade

- **GoatCounter** (código `marciadosangeles`, sem cookies) conta as visitas e os eventos `modulo_inicio`, `modulo_fim`, `resposta`, `pausa_feita` e `pausa_pulada`, com os caminhos `dispensa-certa/<evento>/<modulo>`.
- **Contador do rodapé:** lê `https://marciadosangeles.goatcounter.com/counter/<caminho>.json`. Para funcionar, ative no GoatCounter: *Settings → Allow adding visitor counts on your website*.
- **Planilha Google:** uma linha por evento, com as colunas `data_hora, evento, sessao, modulo, item, acertou, valor, duracao_s, aparelho, tema, versao`.
  - `sessao` é um código aleatório gerado por aba do navegador.
  - `aparelho` registra só "celular" ou "computador".
  - Não há nome, e-mail, fotos, IP gravado nem localização.
- Na primeira visita aparece um aviso de dados anônimos com o botão **Não enviar meus dados**. A escolha pode ser mudada a qualquer momento em **Privacidade**, no rodapé.

### Instalar a planilha

1. Crie uma Planilha Google, por exemplo "Dispensa Certa – uso".
2. Abra **Extensões → Apps Script**, apague o conteúdo e cole o arquivo `apps-script/Codigo.gs`. Ele começa com `@OnlyCurrentDoc`, que limita o acesso do script a esta planilha. Salve.
3. Clique em **Implantar → Nova implantação**, engrenagem → **App da Web**:
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
4. Autorize quando o Google pedir e copie a URL que termina em `/exec`.
5. Cole essa URL em `planilhaURL` no `config.js`.
6. Abra o site com `?diagnostico` e clique em **Enviar linha de teste à planilha**. Deve aparecer uma linha `linha_teste` na aba **Registros**, criada automaticamente com o cabeçalho.

Se você alterar o código do Apps Script, use **Implantar → Gerenciar implantações → Editar → Nova versão** para manter a mesma URL.

## Publicação

GitHub Pages, a partir da branch `main`, pasta raiz (*Settings → Pages*).

## Créditos

Autoria: **Márcia dos Angeles** ([github.com/marciadosangeles](https://github.com/marciadosangeles)). O desenvolvimento teve apoio de inteligência artificial (Claude, da Anthropic), e o conteúdo foi conferido nas fontes acima.

Este é um material educativo: não substitui a RDC nº 1.000/2025, a RDC nº 1.046/2026, a Portaria SVS/MS nº 344/1998 nem as orientações da Vigilância Sanitária local.
