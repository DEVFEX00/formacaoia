// ————————————————————————————————————————————————————————————————
// CONTENT — source of truth: "FEX AI · Estrutura Curricular 2026" and the
// FEX Brandbook. Nothing here is invented. Items marked `validate: true` are
// presentation copy for tools the curriculum lists without describing.
//
// Regulatory note (curriculum p.19): this is a CURSO LIVRE. Never associate
// MEC / credenciamento / reconhecimento with the course. The institution's
// MEC credential may be stated factually and SEPARATELY from the offer.
// ————————————————————————————————————————————————————————————————

export const brand = {
  name: 'Faculdade FEX Educação',
  logoLight: '/brand/fex-logo.png',       // white/green — dark backgrounds
  logoDark: '/brand/fex-logo-black.png',  // black/green — light backgrounds
};

export const hero = {
  title: ['Capacitação profissional em', 'Inteligência Artificial'],
  sub: 'Torne-se um especialista em inteligência artificial<br><span class="nw">com a <strong>Faculdade FEX Educação</strong>.</span>',
  lede: 'Uma capacitação completa para empreendedores, diretores e executivos que precisam parar de assistir à transformação e começar a conduzi-la. São 10 mini módulos, 38 aulas objetivas e mais de 25 ferramentas. <strong>Sempre atualizada com novas aulas e materiais conforme novas ferramentas e modelos de inteligência artificial chegam ao mercado.</strong>',
};

export const thesis = {
  big: ['A IA é a nova', 'muleta', 'do mundo.'],
  turn: 'Muleta não é fraqueza.',
  turn2: 'É o que permite andar mais rápido do que a própria condição permitiria.',
  punch: ['Ninguém está competindo com a IA.', 'Estão competindo com', 'quem sabe usá-la.'],
  body: 'Nove em cada dez profissionais já abriram uma ferramenta de IA. A maioria nunca passou da conversa casual. Um grupo menor aprendeu a instalar IA dentro da própria operação — e entrega em um dia o que o mercado entrega em uma semana. A distância entre os dois grupos não é de talento nem de orçamento. É de método.',
};

export const scenario = {
  kicker: 'O cenário',
  title: ['Todo mundo usa.', 'Quase ninguém', 'foi treinado.'],
  stats: [
    { value: 9, suffix: ' em 10', text: 'profissionais já usam IA no trabalho — e 35% nunca receberam treinamento formal.', source: 'State of AI Jobs and Skills Report, Study.com, 2026' },
    { value: 56, suffix: '%', text: 'é o prêmio salarial médio de quem domina IA.', source: 'PwC Global AI Jobs Barometer, 2026' },
    { value: 48, suffix: '%', text: 'das empresas brasileiras com mais de 50 funcionários já usam IA generativa.', source: 'Pesquisa FGV com 1.200 empresas, 2026' },
    { value: 32, prefix: 'apenas ', suffix: '%', text: 'dos profissionais sabem dizer o que é um bom uso de IA.', source: 'State of AI Jobs and Skills Report, Study.com, 2026' },
  ],
  closer: 'Comprar ferramenta virou commodity. Saber operá-la continua raro — e é exatamente aí que está o prêmio.',
};

export const vsl = {
  kicker: 'Apresentação',
  title: 'Quer entender como essa capacitação funciona?',
  // Drop the final video here: { type: 'file', src, poster } | { type: 'embed', src }
  // computers keep the full 1080p file; phones and slow connections get the light 720p (srcLight)
  media: { type: 'file', src: '/media/vsl.mp4', srcLight: '/media/vsl-720.mp4', poster: '/media/vsl-poster.jpg' },
};

// Stack do curso (p.17) — descriptions from the lesson texts (module 02–05).
export const toolGroups = [
  {
    id: 'anthropic', name: 'Anthropic', island: 'monolith',
    tools: [
      { name: 'Claude', mono: 'C', does: 'Projetos com o conhecimento da sua empresa dentro — documentos, planilhas e apresentações gerados direto na conversa.' },
      { name: 'Claude Code', mono: 'CC', does: 'Não é só para programadores: organiza arquivos, consolida planilhas e constrói sistemas dentro das suas pastas.' },
      { name: 'Claude Cowork', mono: 'Cw', does: 'O Claude trabalhando por você: no Excel, no Word e no PowerPoint, no navegador, conectado ao drive e ao e-mail.' },
    ],
  },
  {
    id: 'openai', name: 'OpenAI', island: 'lighthouse',
    tools: [
      { name: 'ChatGPT', mono: 'G', does: 'O ChatGPT inteiro aplicado ao negócio: projetos, GPTs personalizados, pesquisa profunda e modo agente.' },
      { name: 'Codex', mono: 'Cx', does: 'Do pedido ao produto: soluções internas funcionando mesmo sem base técnica.' },
    ],
  },
  {
    id: 'google', name: 'Google', island: 'arch',
    tools: [
      { name: 'Gemini no Workspace', mono: 'Ge', does: 'IA dentro do Gmail, Documentos, Planilhas, Drive e Meet: triagem de caixa de entrada, resumo de reunião e análise de planilha.' },
      { name: 'NotebookLM', mono: 'Nb', does: 'Converse com contratos, manuais e relatórios com resposta ancorada na fonte — e transforme o acervo em áudio, vídeo e mapa mental.' },
      { name: 'Google AI Studio', mono: 'AI', does: 'Teste os modelos do Google e chegue ao primeiro protótipo conectado.' },
      { name: 'Google Flow e Veo', mono: 'Fl', does: 'Vídeo com áudio nativo, controle de câmera e personagens consistentes entre cenas.' },
      { name: 'Nano Banana', mono: 'Nn', does: 'Geração de imagem de marca.' },
    ],
  },
  {
    id: 'criacao', name: 'Criação e conteúdo', island: 'studio',
    tools: [
      { name: 'Gamma', mono: 'Ga', does: 'Do texto bruto ao deck pronto em minutos, com identidade visual controlada.' },
      { name: 'HeyGen', mono: 'Hg', does: 'Avatar digital e clonagem de voz para gravar sem câmera, com tradução e dublagem sincronizada.' },
      { name: 'Opus Clip', mono: 'Op', does: 'Uma live, um podcast ou uma reunião longa vira dezenas de cortes verticais prontos, com legenda.' },
      { name: 'ElevenLabs', mono: 'El', does: 'Narração e áudio com qualidade comercial.' },
    ],
  },
  {
    id: 'construcao', name: 'Construção de produtos', island: 'workshop',
    tools: [
      { name: 'Lovable', mono: 'Lv', does: 'Software sem programar: do prompt à tela funcionando, com banco de dados, login e publicação.' },
      { name: 'Vercel', mono: 'Vc', does: 'O que você constrói vai para o ar: hospedagem, publicação e domínio próprio.' },
    ],
  },
  {
    id: 'base', name: 'A base de qualquer IA', island: 'observatory',
    tools: [
      { name: 'Prompts corretos', mono: 'Pr', does: 'A habilidade-mãe: pedir do jeito certo para receber pronto.' },
      { name: 'Criação de agentes', mono: 'Ag', does: 'Assistentes com função, contexto e rotina definidos, trabalhando por você.' },
      { name: 'Conectores', mono: 'Cn', does: 'A IA ligada às suas ferramentas e aos seus dados.' },
    ],
  },
];

// Grade (p.6–15)
export const modules = [
  { code: '00', title: 'Introdução', lessons: ['Bem-vindo à nova muleta', 'Como usar o curso e preparar o seu ambiente'] },
  { code: '01', title: 'Fundamentos da IA e construção de prompt', lessons: ['O que você precisa entender sobre inteligência artificial', 'Construção de prompt: a habilidade-mãe', 'Prompt aplicado ao seu negócio'] },
  { code: '02', title: 'As ferramentas, uma a uma', lessons: ['Claude I: o essencial', 'Claude II: trabalho delegado', 'Claude Code', 'ChatGPT I: o essencial', 'ChatGPT II: pesquisa, dados e agente', 'Codex', 'Gemini e o Workspace', 'NotebookLM', 'Google AI Studio', 'Google Flow', 'Gamma', 'Lovable e Vercel', 'HeyGen', 'Opus Clip', 'O resto do stack: ElevenLabs e Nano Banana'] },
  { code: '03', title: 'Fábrica de conteúdo', lessons: ['Do tema à publicação', 'Produzindo cursos, treinamentos e materiais', 'Identidade e limites'] },
  { code: '04', title: 'Programação com IA', lessons: ['Claude Code no seu computador', 'Construindo sistemas e produtos'] },
  { code: '05', title: 'Criação de agentes', lessons: ['Assistente x agente: o que um agente faz por você', 'Construindo o seu primeiro agente'] },
  { code: '06', title: 'IA aplicada ao marketing', lessons: ['Copies e técnicas de marketing com IA', 'Campanhas: criação e gerenciamento', 'Dados, LGPD e política de uso de IA'] },
  { code: '07A', title: 'Trilha Empreendedor', tag: 'especialização', lessons: ['O empreendedor de uma pessoa só', 'Validar, vender e precificar', 'Produto, autoridade e plano de 90 dias'] },
  { code: '07B', title: 'Trilha Empresa: Diretoria e Alta Gestão', tag: 'especialização', lessons: ['Diagnóstico, oportunidade e business case', 'Capacitar o time e vencer a resistência', 'Governança, métricas e plano de 90 dias'] },
  { code: '08', title: 'Projeto Final, Exercícios e Continuidade', lessons: ['Projeto final: o seu ativo de IA', 'Seu stack definitivo e como continuar aprendendo'] },
];

export const tracks = [
  { id: 'A', title: 'Empreendedores', text: 'Donos de negócio, autônomos de alto valor, criadores e profissionais liberais que precisam multiplicar a própria capacidade sem aumentar estrutura.', focus: 'Operar sozinho como um time.' },
  { id: 'B', title: 'Diretores e executivos', text: 'Alta gestão, sócios e líderes de área que respondem por equipe, orçamento e resultado, e precisam conduzir a adoção de IA dentro da organização.', focus: 'Instalar, medir e governar IA na estrutura.' },
];

export const update = {
  kicker: 'Camada viva',
  title: ['FEX AI Update:', 'o curso que', 'não envelhece.'],
  lede: 'Nenhum curso de inteligência artificial gravado sobrevive seis meses. Por isso a capacitação embute uma camada de atualização contínua.',
  items: [
    { title: 'Newsletter semanal de IA', text: 'O que realmente importa do mercado, traduzido para linguagem de negócio. Sem barulho, sem hype.' },
    { title: 'Aulas novas de atualização', text: 'Ferramenta relevante surgiu? Uma aula curta entra na grade, sem esperar a próxima versão do curso.' },
    { title: 'Alerta de ferramenta nova', text: 'O que faz, para quem serve, quanto custa e se vale entrar no seu stack.' },
    { title: 'Revisão semestral da grade', text: 'Aulas defasadas são regravadas em ciclo fixo.' },
  ],
  ticker: ['Newsletter da semana', 'Nova aula de atualização', 'Alerta: ferramenta nova', 'Revisão semestral', 'Sem hype', 'Aplicação prática indicada'],
};

export const whyUs = [
  { title: 'Uma aula por ferramenta, do login ao entregável', text: 'Abre a tela e ensina a operar, sem enrolação.' },
  { title: 'Grade enxuta, feita para ser concluída', text: '38 aulas objetivas em mini módulos.' },
  { title: 'Nível agente, não nível chat', text: 'Claude Code, Claude Cowork e criação de agentes são conteúdo central, não bônus.' },
  { title: 'Atualização embutida no produto', text: 'Você não compra uma fotografia do mercado. Compra o mercado em movimento.' },
  { title: 'Duas trilhas, um investimento', text: 'O tronco comum serve aos dois públicos; a especialização separa quem empreende de quem dirige.' },
  { title: 'Certificado e ativo real', text: 'Além do certificado, você termina com uma aplicação no ar, agentes trabalhando e política de IA implantada.' },
];

export const format = [
  ['Formato', 'Curso livre de capacitação profissional, 100% online, em vídeo, com acesso imediato após a matrícula.'],
  ['Aulas', 'Objetivas, com média sugerida de 20 a 35 minutos.'],
  ['Exercícios', 'Um desafio prático obrigatório ao fim de cada mini módulo, aplicado ao seu negócio real.'],
  ['Materiais', 'Biblioteca de prompts, modelo de política de uso de IA, planilha de diagnóstico e checklists por módulo.'],
  ['Certificado', 'Certificado de conclusão de curso livre emitido pela Faculdade FEX Educação.'],
];

// Institution — factual, separate from the course offer (Brandbook p.16).
export const institution = {
  lines: ['Instituição de ensino superior credenciada pelo MEC — Portaria 196/2024.', '+1000 empresas parceiras.'],
};

// FEX chapter: keywords lit by the energy flow, each with a real FEX photo
export const fexFlow = {
  nodes: [
    { word: 'Conhecimento', photo: 'checklist' },
    { word: 'Educação', photo: 'turma' },
    { word: 'Aplicação', photo: 'mesa' },
    { word: 'Tecnologia', photo: 'proposito' },
  ],
  line1: 'A <strong>FEX Educação</strong> nasceu para ser a ponte entre o talento e o <strong>impacto digital</strong>.',
  line2: 'Acreditamos na educação como uma necessidade do mundo. Por isso decidimos investir em formação em inteligência artificial — a tendência que vai definir o futuro.',
};

// Certificate (curriculum p.19: curso livre — "emitido", never "validado"/MEC)
export const certificate = {
  kicker: 'Certificado',
  title: 'Seu certificado, emitido pela&nbsp;<span class="hl">Faculdade FEX Educação</span>.',
  text: 'Ao concluir as aulas e o projeto final, você recebe o certificado de conclusão emitido pela Faculdade FEX Educação. Uma credencial para mostrar — e um ativo de IA funcionando para provar.',
  doc: { kind: 'Certificado de conclusão', lead: 'Certificamos que', name: 'Seu nome aqui', mid: 'concluiu o curso livre de', course: 'Capacitação Profissional em Inteligência Artificial', meta: '10 mini módulos · 38 aulas · projeto final', issuer: 'Faculdade FEX Educação' },
};

export const photos = {
  mesa: { src: '/media/mesa-fex.jpg', alt: 'Mesa com a marca FEX Educação em um encontro' },
  checklist: { src: '/media/evento-checklist.jpg', alt: 'Participante preenchendo material durante encontro da FEX' },
  proposito: { src: '/media/card-proposito-lucro.jpg', alt: 'Cartão FEX Educação: Propósito e Lucro' },
  turma: { src: '/media/turma-celebracao.jpg', alt: 'Turma reunida ao final de um encontro' }, // NOTE: third-party badges visible
};

// Every "Quero conhecer…" button opens the lead form (ui/lead.js): the lead
// goes to n8n (→ RD Station) and the visitor continues to the Hubla checkout.
export const cta = {
  label: 'Quero conhecer a capacitação',
  checkout: 'https://pay.hub.la/MDTu58U0Z451O457Soul',
  webhook: 'https://n8n.fexeducacao.com/webhook/form-extensao-pos-MY9tKgr31W2ZLxNB',
  course: 'Capacitação Profissional em Inteligência Artificial',
  source: 'site-capacitacao-ia',
  form: {
    kicker: 'Inscrição',
    title: 'Falta pouco para você começar.',
    text: 'Deixe seus dados e siga direto para a inscrição segura.',
    button: 'Continuar para a inscrição',
    sending: 'Abrindo a inscrição…',
    consent: 'Aceito receber contato da Faculdade FEX Educação sobre a capacitação, de acordo com a LGPD.',
    safe: 'Pagamento 100% seguro pela Hubla.',
  },
  onClick: null, // (event, location) => track('cta_click', { location })
  closer: 'O custo de esperar mais um ano é maior do que o custo de aprender agora.',
};
