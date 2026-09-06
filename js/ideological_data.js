/**
 * Horizontes Cívicos - Catálogo e Motor Conceitual de Problemas Ideológicos
 * Inspirado na análise filosófico-política de David T. Koyzis em 'Visões e Ilusões Políticas'.
 *
 * Princípio axiológico central:
 * "Um bem político parcial pode gerar injustiças quando é transformado em princípio absoluto
 * e aplicado a toda a sociedade."
 *
 * NOTA METODOLÓGICA:
 * A correspondência com as cinco posições do Diagrama de Nolan (Libertária, Conservadora,
 * Progressista, Estatista e Centrista) é uma adaptação desenvolvida especificamente para as
 * mecânicas deste jogo de simulação, e não uma divisão categórica proposta pelo autor da obra.
 */

// Coordenadas centrais de referência no espaço contínuo [0, 100] × [0, 100]
export const NOLAN_PROFILE_CENTERS = {
  libertarian: { econ: 80, personal: 80, name: 'Libertária' },
  conservative: { econ: 80, personal: 20, name: 'Conservadora' },
  progressive: { econ: 20, personal: 80, name: 'Progressista' },
  statist: { econ: 20, personal: 20, name: 'Estatista' },
  centrist: { econ: 50, personal: 50, name: 'Centrista' }
};

/**
 * Calcula a afinidade contínua de uma cidade a um perfil de Nolan.
 * Retorna um número real entre 0 e 1, permitindo trajetórias híbridas.
 *
 * @param {Object} city - Objeto da cidade contendo econFreedom e civicFreedom
 * @param {string} profileKey - 'libertarian' | 'conservative' | 'progressive' | 'statist' | 'centrist'
 * @returns {number} Valor entre 0 e 1
 */
export function calculateNolanAffinity(city, profileKey) {
  const center = NOLAN_PROFILE_CENTERS[profileKey];
  if (!center || !city) return 0;

  const econ = city.econFreedom ?? 50;
  const personal = city.civicFreedom ?? 50; // no objeto da cidade, civicFreedom guarda a coordenada pessoal de Nolan
  const dist = Math.hypot(econ - center.econ, personal - center.personal);

  // Raio de alcance no espaço euclidiano de 100x100
  const maxRadius = profileKey === 'centrist' ? 44 : 68;
  return Math.max(0, Math.min(1, (maxRadius - dist) / maxRadius));
}

/**
 * Calcula a intensidade ideológica (distância da moderação ou proximidade ao centro).
 *
 * @param {Object} city
 * @param {string} profileKey
 * @returns {number} Valor entre 0.1 e 1
 */
export function calculateIdeologicalIntensity(city, profileKey) {
  if (!city) return 0.5;
  const econ = city.econFreedom ?? 50;
  const personal = city.civicFreedom ?? 50;
  const distFromCenter = Math.hypot(econ - 50, personal - 50);

  if (profileKey === 'centrist') {
    // Para a síntese centrista, proximidade geométrica ao centro
    return Math.max(0.1, Math.min(1, (42 - distFromCenter) / 42));
  }

  // Para os 4 campos periféricos, distância geométrica do centro
  return Math.max(0.12, Math.min(1, distFromCenter / 42));
}

/**
 * Catálogo de Problemas Ideológicos (68 eventos distribuídos entre os 5 campos)
 * Todos os eventos possuem campos consistentes com EVENTS_DATABASE + extensões estruturais.
 */
export const IDEOLOGICAL_PROBLEMS_DATABASE = [
  // =========================================================================
  // 1. FAMÍLIA LIBERTÁRIA (Autonomia Individual e Liberdade de Mercado)
  // =========================================================================
  {
    id: 'ideological_lib_infraestrutura',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'libertarian',
    riskFamily: 'autonomia_absolutizada',
    severity: 'light',
    title: 'Infraestrutura sem responsável',
    narrative: 'Projetos essenciais de transporte e redes coletivas foram adiados porque nenhum agente privado aceitou assumir sozinho seus custos e riscos.',
    immediateBenefit: 'Economia poupada de tributos e taxas compulsórias de desenvolvimento.',
    immediateBenefitEffects: { economy: +2 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 60, minPersonalFreedom: 55 },
    riskFactors: [
      { field: 'infrastructure', operator: '<', value: 55, label: 'infraestrutura fragilizada', multiplier: 1.35 },
      { field: 'trust', operator: '<', value: 52, label: 'baixa coordenação voluntária', multiplier: 1.25 }
    ],
    effects: { infrastructure: -4, trust: -3, economy: -1 },
    explanation: 'A preferência exclusiva por soluções voluntárias bilaterais deixou obras de uso comum sem agente articulador disposto a arcar com os riscos iniciais.'
  },
  {
    id: 'ideological_lib_concentracao',
    type: 'ideologicalProblem',
    category: 'economia',
    nolanProfile: 'libertarian',
    riskFamily: 'mercado_desregulado',
    severity: 'light',
    title: 'Concentração empresarial acelerada',
    narrative: 'As empresas mais capitalizadas compraram concorrentes locais menores para consolidar cadeias de logística e distribuição.',
    immediateBenefit: 'Ganhos rápidos de escala, injeção de capital e otimização produtiva.',
    immediateBenefitEffects: { economy: +3, jobs: +2 },
    weight: 9,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 62 },
    riskFactors: [
      { field: 'economy', operator: '>', value: 58, label: 'mercado altamente capitalizado', multiplier: 1.3 },
      { field: 'equality', operator: '<', value: 50, label: 'assimetria de capital crescente', multiplier: 1.25 }
    ],
    effects: { equality: -3, trust: -2 },
    explanation: 'A dinâmica de mercado irrestrita gerou fusões eficientes no curto prazo, mas estreitou o leque de alternativas independentes.'
  },
  {
    id: 'ideological_lib_oligopolio',
    type: 'ideologicalProblem',
    category: 'economia',
    nolanProfile: 'libertarian',
    riskFamily: 'mercado_desregulado',
    severity: 'severe',
    title: 'Oligopólio espontâneo',
    narrative: 'Poucos conglomerados consolidaram o controle dos setores-chave, elevando barreiras de entrada e combinando margens comerciais elevadas.',
    immediateBenefit: 'Alta rentabilidade dos conglomerados e atração de aportes externos no curto prazo.',
    immediateBenefitEffects: { economy: +3 },
    weight: 5,
    isGlobal: false,
    cooldownMonths: 30,
    duration: 8,
    monthlyEffects: { equality: -1, trust: -1 },
    delayedEffects: { jobs: -2, economy: -2 },
    resolutionNarrative: 'A emergência de novos competidores independentes e cooperativas locais quebrou a rigidez de preços do oligopólio.',
    conditions: {
      minEconFreedom: 65,
      requiresAnyHistory: ['ideological_lib_concentracao']
    },
    riskFactors: [
      { field: 'economy', operator: '>', value: 65, label: 'grande concentração de faturamento', multiplier: 1.4 },
      { field: 'equality', operator: '<', value: 45, label: 'mercado com poucas opções acessíveis', multiplier: 1.3 }
    ],
    effects: { equality: -5, trust: -4, jobs: -2 },
    explanation: 'Sem freios regulatórios a monopólios, a própria dinâmica competitiva permitiu que gigantes estabelecessem barreiras que sufocaram novos concorrentes.'
  },
  {
    id: 'ideological_lib_contrato_sem_barganha',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'libertarian',
    riskFamily: 'autonomia_absolutizada',
    severity: 'moderate',
    title: 'Contrato sem poder de barganha',
    narrative: 'Trabalhadores em situação de vulnerabilidade aceitaram jornadas exaustivas e nenhuma garantia sob a forma de pactos formalmente voluntários.',
    immediateBenefit: 'Redução drástica de custos operacionais e contratação imediata de mão de obra.',
    immediateBenefitEffects: { jobs: +3, economy: +2 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 60, minPersonalFreedom: 55 },
    riskFactors: [
      { field: 'jobs', operator: '<', value: 52, label: 'pressão por postos de trabalho', multiplier: 1.3 },
      { field: 'equality', operator: '<', value: 48, label: 'disparidade severa nas negociações', multiplier: 1.25 }
    ],
    effects: { health: -3, equality: -3, trust: -2 },
    explanation: 'A presunção de que todo acordo voluntário é necessariamente justo ignorou a assimetria brutal de necessidade entre quem contrata e quem precisa subsistir.'
  },
  {
    id: 'ideological_lib_bolha_imobiliaria',
    type: 'ideologicalProblem',
    category: 'economia',
    nolanProfile: 'libertarian',
    riskFamily: 'mercado_desregulado',
    severity: 'moderate',
    title: 'Bolha imobiliária e especulação',
    narrative: 'A atração de capital especulativo inflacionou os terrenos urbanos, inviabilizando aluguéis compatíveis com a renda média da classe trabalhadora.',
    immediateBenefit: 'Boom na construção civil e valorização patrimonial rápida para proprietários.',
    immediateBenefitEffects: { economy: +3, jobs: +2 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 26,
    duration: 9,
    monthlyEffects: { housing: -1 },
    delayedEffects: { stability: -2 },
    resolutionNarrative: 'A entrega de novas torres e a acomodação dos preços frearam a espiral especulativa no mercado de locação.',
    conditions: { minEconFreedom: 62 },
    riskFactors: [
      { field: 'economy', operator: '>', value: 60, label: 'abundância de liquidez especulativa', multiplier: 1.35 },
      { field: 'housing', operator: '<', value: 50, label: 'escassez de imóveis acessíveis', multiplier: 1.35 }
    ],
    effects: { housing: -5, equality: -3 },
    explanation: 'A transformação irrestrita da habitação em ativo puramente financeiro sobrepujou sua finalidade precípua de abrigar com dignidade a comunidade.'
  },
  {
    id: 'ideological_lib_tragedia_comuns',
    type: 'ideologicalProblem',
    category: 'meio ambiente',
    nolanProfile: 'libertarian',
    riskFamily: 'autonomia_absolutizada',
    severity: 'moderate',
    title: 'Tragédia dos bens comuns',
    narrative: 'Sem barreiras nem cobranças comuns, indústrias e frotas privadas despejaram efluentes e exauriram lençóis freáticos e áreas compartilhadas.',
    immediateBenefit: 'Redução de custos operacionais industriais e aceleração na produção fabril.',
    immediateBenefitEffects: { economy: +3 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 60 },
    riskFactors: [
      { field: 'environment', operator: '<', value: 52, label: 'recursos ambientais sob estresse', multiplier: 1.4 },
      { field: 'economy', operator: '>', value: 55, label: 'alta intensidade de uso produtivo', multiplier: 1.2 }
    ],
    effects: { environment: -6, health: -3, trust: -2 },
    explanation: 'Ao tratar bens compartilhados como recursos gratuitos e inesgotáveis, custos privados foram repassados à saúde e ao ecossistema de toda a população.'
  },
  {
    id: 'ideological_lib_seguranca_assinatura',
    type: 'ideologicalProblem',
    category: 'segurança',
    nolanProfile: 'libertarian',
    riskFamily: 'fragmentacao_social',
    severity: 'moderate',
    title: 'Segurança por assinatura',
    narrative: 'Bairros afluentes criaram perímetros murados e contrataram patrulhas corporativas armadas, deixando os distritos periféricos expostos.',
    immediateBenefit: 'Proteção célere e eficiente nos condomínios e eixos corporativos contratantes.',
    immediateBenefitEffects: { safety: +3 },
    weight: 7,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 60, minPersonalFreedom: 55 },
    riskFactors: [
      { field: 'equality', operator: '<', value: 46, label: 'abismo de renda entre bairros', multiplier: 1.35 },
      { field: 'safety', operator: '<', value: 52, label: 'vulnerabilidade do patrulhamento geral', multiplier: 1.3 }
    ],
    effects: { equality: -4, trust: -4 },
    explanation: 'A privatização irrestrita da proteção pública converteu a tranquilidade em bem mercantil exclusivo, dividindo a cidade em enclaves.'
  },
  {
    id: 'ideological_lib_servicos_fragmentados',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'libertarian',
    riskFamily: 'fragmentacao_social',
    severity: 'light',
    title: 'Serviços essenciais fragmentados',
    narrative: 'Prontuários médicos, sistemas de bilhetagem e grades escolares passaram a operar sob formatos incompatíveis que excluem quem troca de provedor.',
    immediateBenefit: 'Proliferação de planos e pacotes sob medida para usuários exigentes.',
    immediateBenefitEffects: { personalFreedom: +2 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 58, minPersonalFreedom: 55 },
    riskFactors: [
      { field: 'health', operator: '<', value: 55, label: 'desarticulação no atendimento médico', multiplier: 1.25 },
      { field: 'infrastructure', operator: '<', value: 55, label: 'redes desconexas sem padrão comum', multiplier: 1.25 }
    ],
    effects: { health: -3, education: -2, infrastructure: -3 },
    explanation: 'A recusa a padrões mínimos integrados dispersou infraestruturas que necessitam de interoperabilidade técnica para servir à sociedade.'
  },
  {
    id: 'ideological_lib_guerra_direitos',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'libertarian',
    riskFamily: 'autonomia_absolutizada',
    severity: 'light',
    title: 'Guerra de direitos e litígios',
    narrative: 'Disputas intermináveis sobre limites de propriedade, poluição sonora e servidões de passagem sobrecarregaram mediadores privados e árbitros.',
    immediateBenefit: 'Zelo inflexível e rigoroso na defesa de qualquer prerrogativa de posse individual.',
    immediateBenefitEffects: { personalFreedom: +2 },
    weight: 9,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minPersonalFreedom: 60 },
    riskFactors: [
      { field: 'stability', operator: '<', value: 54, label: 'atritos contratuais recorrentes', multiplier: 1.3 },
      { field: 'trust', operator: '<', value: 52, label: 'baixa tolerância entre vizinhos', multiplier: 1.25 }
    ],
    effects: { stability: -3, trust: -3 },
    explanation: 'A tentativa de reduzir toda a convivência a cláusulas jurídicas minuciosas multiplicou litígios que o bom senso comunitário outrora apaziguava.'
  },
  {
    id: 'ideological_lib_erosao_comunitaria',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'libertarian',
    riskFamily: 'fragmentacao_social',
    severity: 'light',
    title: 'Erosão dos vínculos comunitários',
    narrative: 'Laços de vizinhança e obrigações morais de socorro mútuo foram tratados como fardos contratuais facilmente revogáveis por conveniência.',
    immediateBenefit: 'Autonomia desimpedida para indivíduos reorganizarem seus modos de vida sem cobranças locais.',
    immediateBenefitEffects: { personalFreedom: +3 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minPersonalFreedom: 62 },
    riskFactors: [
      { field: 'trust', operator: '<', value: 50, label: 'isolamento cívico dos moradores', multiplier: 1.35 },
      { field: 'personalFreedom', operator: '>', value: 65, label: 'atomização social avançada', multiplier: 1.2 }
    ],
    effects: { trust: -4, stability: -2 },
    explanation: 'Ao tratar compromissos comunitários duradouros como meros contratos descartáveis, a metrópole perdeu redes informais de acolhimento mútuo.'
  },
  {
    id: 'ideological_lib_neutralidade_contestada',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'libertarian',
    riskFamily: 'autonomia_absolutizada',
    severity: 'light',
    title: 'Neutralidade cívica contestada',
    narrative: 'A recusa em articular qualquer valor moral comum levou associações civis a alegarem que suas tradições foram banidas da vida cívica da pólis.',
    immediateBenefit: 'Ausência de doutrinação estatal e respeito estrito ao foro íntimo particular.',
    immediateBenefitEffects: { personalFreedom: +2 },
    weight: 9,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minPersonalFreedom: 60 },
    riskFactors: [
      { field: 'stability', operator: '<', value: 52, label: 'tensão entre sensibilidades éticas concorrentes', multiplier: 1.3 }
    ],
    effects: { stability: -3, trust: -2 },
    explanation: 'A busca de uma neutralidade estatal absoluta desconsiderou que a esfera pública carece de compromissos substantivos para preservar sua legitimidade.'
  },
  {
    id: 'ideological_lib_paralisia_coletiva',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'libertarian',
    riskFamily: 'autonomia_absolutizada',
    severity: 'light',
    title: 'Paralisia da ação coletiva',
    narrative: 'Reparos urgentes de drenagem ficaram parados porque cada empresa aguardava que concorrentes vizinhos financiassem a obra primeiro.',
    immediateBenefit: 'Nenhum contribuinte foi coagido a financiar obras fora de seus interesses particulares.',
    immediateBenefitEffects: { economy: +2 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 60 },
    riskFactors: [
      { field: 'infrastructure', operator: '<', value: 50, label: 'gargalos de drenagem acumulados', multiplier: 1.35 },
      { field: 'trust', operator: '<', value: 48, label: 'cálculo oportunista de carona', multiplier: 1.3 }
    ],
    effects: { infrastructure: -4, stability: -2 },
    explanation: 'O dilema do carona paralisou melhorias indispensáveis, pois cada agente calculou ser mais lucrativo esperar a iniciativa financeira alheia.'
  },
  {
    id: 'ideological_lib_exodo_custo_vida',
    type: 'ideologicalProblem',
    category: 'economia',
    nolanProfile: 'libertarian',
    riskFamily: 'mercado_desregulado',
    severity: 'moderate',
    title: 'Êxodo pelo custo de vida',
    narrative: 'A valorização vertiginosa de serviços atraiu capital externo, mas expulsou socorristas, professores e cuidadores essenciais para fora dos limites urbanos.',
    immediateBenefit: 'Aporte massivo de renda e investimentos de alta tecnologia nos distritos nobres.',
    immediateBenefitEffects: { economy: +4, jobs: +2 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 62 },
    riskFactors: [
      { field: 'economy', operator: '>', value: 62, label: 'forte inflação setorial de custos', multiplier: 1.3 },
      { field: 'housing', operator: '<', value: 46, label: 'moradia inacessível a trabalhadores de base', multiplier: 1.35 }
    ],
    effects: { health: -3, education: -3, housing: -3 },
    explanation: 'A precificação desimpedida de moradias esqueceu que uma cidade dinâmica requer a presença física diária de trabalhadores de serviços fundamentais.'
  },

  // =========================================================================
  // 2. FAMÍLIA CONSERVADORA (Tradição e Ordem Moral Coletiva)
  // =========================================================================
  {
    id: 'ideological_cons_reforma_adiada',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'conservative',
    riskFamily: 'tradicao_rigida',
    severity: 'light',
    title: 'Reforma sempre adiada',
    narrative: 'Projetos urgentes de modernização das repartições foram rejeitados sob a alegação de que alterar antigos hábitos ameaçaria a ordem social.',
    immediateBenefit: 'Preservação da continuidade institucional e tranquilidade para setores habituados aos costumes.',
    immediateBenefitEffects: { stability: +3 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 45, minEconFreedom: 55 },
    riskFactors: [
      { field: 'infrastructure', operator: '<', value: 52, label: 'métodos administrativos obsoletos', multiplier: 1.3 },
      { field: 'stability', operator: '>', value: 52, label: 'aversão a ajustes procedimentais', multiplier: 1.25 }
    ],
    effects: { infrastructure: -4, economy: -2 },
    explanation: 'A prudência legítima foi transformada em imobilismo, confundindo a preservação de vícios administrativos com fidelidade a virtudes perenes.'
  },
  {
    id: 'ideological_cons_privilegio_tradicao',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'conservative',
    riskFamily: 'ordem_excludente',
    severity: 'moderate',
    title: 'Privilégio transformado em tradição',
    narrative: 'Isenções tributárias e monopólios herdados por famílias fundadoras foram blindados como se fossem patrimônios imateriais intocáveis da pólis.',
    immediateBenefit: 'Fidelidade e cooperação das dinastias tradicionais com o governo da cidade.',
    immediateBenefitEffects: { stability: +2 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 45, minEconFreedom: 55 },
    riskFactors: [
      { field: 'equality', operator: '<', value: 48, label: 'vantagens corporativas consagradas', multiplier: 1.35 },
      { field: 'trust', operator: '<', value: 52, label: 'percepção de favorecimento dinástico', multiplier: 1.25 }
    ],
    effects: { equality: -4, trust: -3 },
    explanation: 'Arranjos materiais circunstanciais foram revestidos de sacralidade moral, bloqueando o mérito e a renovação indispensável de lideranças.'
  },
  {
    id: 'ideological_cons_ouro_inventada',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'conservative',
    riskFamily: 'nostalgia_politica',
    severity: 'light',
    title: 'A era de ouro inventada',
    narrative: 'Campanhas oficiais propagaram um passado mitológico de concórdia perfeita, desviando o foco da resolução dos problemas concretos do presente.',
    immediateBenefit: 'Sentimento de orgulho comunitário e reverência cívica às memórias ancestrais.',
    immediateBenefitEffects: { stability: +3 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 45 },
    riskFactors: [
      { field: 'trust', operator: '<', value: 54, label: 'desencanto com a rotina contemporânea', multiplier: 1.3 }
    ],
    effects: { education: -3, trust: -3 },
    explanation: 'A nostalgia romântica substituiu o exame autocrítico lúcido por um relato histórico mitificado que não tolera contrapontos investigativos.'
  },
  {
    id: 'ideological_cons_codigo_moral',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'conservative',
    riskFamily: 'tradicao_rigida',
    severity: 'moderate',
    title: 'Código moral invasivo',
    narrative: 'Fiscais municipais passaram a policiar apresentações de música, horários de lazer e hábitos privados em praças sob a bandeira dos bons costumes.',
    immediateBenefit: 'Sensação de decoro estrito e conformidade visível nas áreas de convivência pública.',
    immediateBenefitEffects: { safety: +3 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 40 },
    riskFactors: [
      { field: 'personalFreedom', operator: '<', value: 45, label: 'tutela estatal sobre a esfera íntima', multiplier: 1.4 },
      { field: 'stability', operator: '<', value: 54, label: 'atritos entre gerações e estilos de vida', multiplier: 1.25 }
    ],
    effects: { personalFreedom: -6, trust: -3 },
    explanation: 'A guarda sadia da ordem pública extrapolou seus limites legítimos ao tentar tutelar coercitivamente a sensibilidade e a consciência íntima do cidadão.'
  },
  {
    id: 'ideological_cons_lealdade_obrigatoria',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'conservative',
    riskFamily: 'ordem_excludente',
    severity: 'light',
    title: 'Lealdade obrigatória',
    narrative: 'Críticas públicas a decretos municipais foram estigmatizadas como ingratidão e falta de amor à pátria local por porta-vozes do governo.',
    immediateBenefit: 'Unanimismo nos atos cívicos e celebrações memoriais de fundação.',
    immediateBenefitEffects: { stability: +2 },
    weight: 9,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 42 },
    riskFactors: [
      { field: 'trust', operator: '<', value: 50, label: 'desconfiança contra vozes divergentes', multiplier: 1.3 }
    ],
    effects: { trust: -3, personalFreedom: -4 },
    explanation: 'O amor sadio à comunidade foi corrompido em alinhamento cego, confundindo o debate fiscalizador com deslealdade civil.'
  },
  {
    id: 'ideological_cons_preferencia_cultural',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'conservative',
    riskFamily: 'nacionalismo_cultural',
    severity: 'light',
    title: 'Preferência cultural exclusiva',
    narrative: 'Editais municipais de bolsas e alvarás comerciais priorizaram expressamente famílias ligadas aos fundadores originais da localidade.',
    immediateBenefit: 'Fomento e preservação do artesanato e dos ofícios históricos ancestrais.',
    immediateBenefitEffects: { stability: +2 },
    weight: 9,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 42 },
    riskFactors: [
      { field: 'equality', operator: '<', value: 50, label: 'vantagem legal atribuída a linhagens antigas', multiplier: 1.3 }
    ],
    effects: { equality: -3, trust: -2 },
    explanation: 'O apego às raízes locais degenerou em favoritismo burocrático, erguendo barreiras veladas contra quem chegou para somar trabalho honesto.'
  },
  {
    id: 'ideological_cons_minorias_suspeita',
    type: 'ideologicalProblem',
    category: 'segurança',
    nolanProfile: 'conservative',
    riskFamily: 'nacionalismo_cultural',
    severity: 'moderate',
    title: 'Minorias sob suspeita',
    narrative: 'Famílias de migrantes recém-estabelecidas foram submetidas a vistorias extraordinárias sob a alegação de proteger os padrões da comunidade.',
    immediateBenefit: 'Alívio momentâneo de ansiedades em bairros preocupados com a rapidez do afluxo populacional.',
    immediateBenefitEffects: { safety: +3 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 40 },
    riskFactors: [
      { field: 'trust', operator: '<', value: 48, label: 'estranhamento e polarização cívica', multiplier: 1.35 },
      { field: 'equality', operator: '<', value: 45, label: 'disparidade entre nativos e forasteiros', multiplier: 1.25 }
    ],
    effects: { trust: -5, equality: -4, personalFreedom: -3 },
    explanation: 'O receio de perder referências comunitárias familiares gerou preconceito institucional contra pessoas que apenas buscavam abrigo e labor pacífico.'
  },
  {
    id: 'ideological_cons_cidadaos_nao_pertencem',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'conservative',
    riskFamily: 'ordem_excludente',
    severity: 'severe',
    title: 'Cidadãos que não pertencem',
    narrative: 'Residir legalmente e trabalhar na cidade deixou de bastar: sem ascendência nas tradições hegemônicas, moradores perderam assento nos conselhos.',
    immediateBenefit: 'Monopólio total das instâncias de governança nas mãos das linhagens históricas.',
    immediateBenefitEffects: { stability: +2 },
    weight: 5,
    isGlobal: false,
    cooldownMonths: 30,
    duration: 12,
    monthlyEffects: { equality: -1, trust: -1 },
    delayedEffects: { jobs: -2, stability: -2 },
    resolutionNarrative: 'Um pacto de reconciliação restabeleceu a igualdade republicana plena para todos os moradores contribuintes da metrópole.',
    conditions: {
      maxPersonalFreedom: 35,
      requiresAnyHistory: ['ideological_cons_minorias_suspeita', 'ideological_cons_preferencia_cultural']
    },
    riskFactors: [
      { field: 'equality', operator: '<', value: 40, label: 'fratura de representação política', multiplier: 1.4 },
      { field: 'trust', operator: '<', value: 42, label: 'ressentimento e alheamento dos marginalizados', multiplier: 1.35 }
    ],
    effects: { equality: -6, trust: -5, personalFreedom: -5 },
    explanation: 'A identificação exclusivista da pólis com uma estirpe particular quebrou o princípio da igualdade cívica, tratando vizinhos como súditos sem voz.'
  },
  {
    id: 'ideological_cons_curriculo_unico',
    type: 'educação',
    category: 'educação',
    nolanProfile: 'conservative',
    riskFamily: 'tradicao_rigida',
    severity: 'light',
    title: 'Currículo único e narrativa fechada',
    narrative: 'As escolas municipais foram proibidas de discutir controvérsias históricas do passado da cidade em nome da exaltação patriótica incontestada.',
    immediateBenefit: 'Transmissão uniforme de memórias e respeito cívico padronizado nas salas de aula.',
    immediateBenefitEffects: { stability: +2 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 44 },
    riskFactors: [
      { field: 'education', operator: '<', value: 55, label: 'ensino vulnerável a diretrizes dogmáticas', multiplier: 1.3 }
    ],
    effects: { education: -3, trust: -2 },
    explanation: 'A nobre intenção de fomentar gratidão cívica descambou para a imposição de uma história oficial blindada contra o rigor e a autocrítica da pesquisa.'
  },
  {
    id: 'ideological_cons_seguranca_sem_contrapesos',
    type: 'ideologicalProblem',
    category: 'segurança',
    nolanProfile: 'conservative',
    riskFamily: 'ordem_excludente',
    severity: 'moderate',
    title: 'Segurança sem contrapesos',
    narrative: 'Juizados especiais concederam autorizações sumárias para averiguações sem mandado preventivo em nome da manutenção inflexível da ordem pública.',
    immediateBenefit: 'Contenção ostensiva imediata de desordens e desocupação rápida de vias públicas.',
    immediateBenefitEffects: { safety: +4 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 40 },
    riskFactors: [
      { field: 'safety', operator: '<', value: 50, label: 'cobrança social por firmeza policial', multiplier: 1.3 },
      { field: 'personalFreedom', operator: '<', value: 42, label: 'falta de freios a excessos de autoridade', multiplier: 1.35 }
    ],
    effects: { personalFreedom: -5, trust: -4 },
    explanation: 'A ordem cívica foi desconectada da justiça processual; sem salvaguardas para inocentes, a própria autoridade pública tornou-se temida.'
  },
  {
    id: 'ideological_cons_elite_protegida',
    type: 'ideologicalProblem',
    category: 'economia',
    nolanProfile: 'conservative',
    riskFamily: 'ordem_excludente',
    severity: 'light',
    title: 'Elite tradicional protegida',
    narrative: 'Empresas centenárias receberam socorros orçamentários sob o argumento de que sua falência desonraria as tradições mercantis da cidade.',
    immediateBenefit: 'Sobrevivência simbólica de marcas com valor afetivo para a memória coletiva.',
    immediateBenefitEffects: { stability: +2 },
    weight: 9,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 45, minEconFreedom: 55 },
    riskFactors: [
      { field: 'economy', operator: '<', value: 55, label: 'perda de dinamismo e competitividade', multiplier: 1.25 },
      { field: 'equality', operator: '<', value: 48, label: 'corporativismo dinástico blindado', multiplier: 1.3 }
    ],
    effects: { economy: -3, equality: -2 },
    explanation: 'O apreço pela longevidade produtiva converteu-se em reserva de mercado, subsidiando ineficiências sob o escudo da herança cultural.'
  },
  {
    id: 'ideological_cons_reforma_urbana_bloqueada',
    type: 'ideologicalProblem',
    category: 'infraestrutura',
    nolanProfile: 'conservative',
    riskFamily: 'tradicao_rigida',
    severity: 'light',
    title: 'Reforma urbana bloqueada',
    narrative: 'A construção de adutoras e o alargamento de acessos foram travados porque exigiriam a remoção de galpões obsoletos tombados por mero costume.',
    immediateBenefit: 'Conservação intocada do conjunto cenográfico das ruas históricas.',
    immediateBenefitEffects: { stability: +2 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 45 },
    riskFactors: [
      { field: 'infrastructure', operator: '<', value: 50, label: 'gargalos viários e de saneamento básico', multiplier: 1.4 }
    ],
    effects: { infrastructure: -4, housing: -2 },
    explanation: 'A veneração estética pelo passado construído sobrepôs-se à preservação da integridade física e do saneamento básico da população viva.'
  },
  {
    id: 'ideological_cons_tradicao_religiosa',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'conservative',
    riskFamily: 'ordem_excludente',
    severity: 'moderate',
    title: 'Tradição confessional oficializada',
    narrative: 'Orações e símbolos de uma confissão predominante foram incorporados aos protocolos solenes obrigatórios de todos os órgãos do governo municipal.',
    immediateBenefit: 'Forte coesão entre fiéis da denominação majoritária da metrópole.',
    immediateBenefitEffects: { stability: +3 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 40 },
    riskFactors: [
      { field: 'personalFreedom', operator: '<', value: 44, label: 'pouco espaço para pluralismo confessional', multiplier: 1.35 }
    ],
    effects: { personalFreedom: -5, trust: -3 },
    explanation: 'Uma fé particular foi instrumentalizada como protocolo civil oficial, constrangendo cidadãos que cultivam outras sensibilidades espirituais.'
  },

  // =========================================================================
  // 3. FAMÍLIA PROGRESSISTA (Igualdade e Emancipação Social)
  // =========================================================================
  {
    id: 'ideological_prog_burocracia_igualdade',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'progressive',
    riskFamily: 'expansao_administrativa',
    severity: 'light',
    title: 'Burocracia da igualdade',
    narrative: 'Para garantir rigorosa paridade, foram criados formulários extensos, cadastros sobrepostos e juntas de auditoria que retardam a concessão de amparo.',
    immediateBenefit: 'Minúcia contra desvios e garantia estatística de destinação aos grupos-alvo.',
    immediateBenefitEffects: { equality: +3 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxEconFreedom: 45, minPersonalFreedom: 55 },
    riskFactors: [
      { field: 'economy', operator: '<', value: 55, label: 'lentidão burocrática para concessão de alvarás', multiplier: 1.25 },
      { field: 'infrastructure', operator: '<', value: 54, label: 'processos emperrados por excesso de checagens', multiplier: 1.25 }
    ],
    effects: { infrastructure: -3, economy: -3, jobs: -2 },
    explanation: 'A intenção nobre de distribuir com equidade ergueu uma máquina de controle tão labiríntica que consumiu as próprias energias que pretendia fomentar.'
  },
  {
    id: 'ideological_prog_promessa_sem_financiamento',
    type: 'ideologicalProblem',
    category: 'economia',
    nolanProfile: 'progressive',
    riskFamily: 'expansao_administrativa',
    severity: 'moderate',
    title: 'Promessa sem financiamento',
    narrative: 'A expansão de subsídios habitacionais e passe livre foi promulgada em bloco sem previsão de receitas perenes para cobrir os compromissos futuros.',
    immediateBenefit: 'Entusiasmo cívico e alívio imediato no orçamento das famílias de menor renda.',
    immediateBenefitEffects: { equality: +3, trust: +2 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxEconFreedom: 45, minPersonalFreedom: 55 },
    riskFactors: [
      { field: 'economy', operator: '<', value: 50, label: 'arrecadação insuficiente para encargos fixos', multiplier: 1.35 },
      { field: 'stability', operator: '<', value: 54, label: 'risco fiscal perceptível no mercado', multiplier: 1.25 }
    ],
    effects: { economy: -5, stability: -3, trust: -3 },
    explanation: 'A generosidade desvinculada do rigor orçamentário transformou promessas éticas legítimas em desequilíbrio fiscal que comprometeu os serviços.'
  },
  {
    id: 'ideological_prog_fila_universal',
    type: 'ideologicalProblem',
    category: 'saúde',
    nolanProfile: 'progressive',
    riskFamily: 'expansao_administrativa',
    severity: 'moderate',
    title: 'Fila universal e sobrecarga',
    narrative: 'A gratuidade irrestrita sem expansão de leitos gerou filas de espera de meses nos prontos-socorros, enquanto os profissionais de saúde entraram em colapso.',
    immediateBenefit: 'Acesso formalmente desimpedido de qualquer cobrança para todos os cidadãos.',
    immediateBenefitEffects: { equality: +3 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 26,
    duration: 9,
    monthlyEffects: { health: -1, trust: -1 },
    delayedEffects: { stability: -2 },
    resolutionNarrative: 'A contratação emergencial de médicos e a digitalização da triagem descongestionaram os postos de saúde.',
    conditions: { maxEconFreedom: 45 },
    riskFactors: [
      { field: 'health', operator: '<', value: 52, label: 'capacidade hospitalar saturada', multiplier: 1.35 },
      { field: 'infrastructure', operator: '<', value: 50, label: 'falta de leitos e ambulatórios de retaguarda', multiplier: 1.25 }
    ],
    effects: { health: -5, trust: -4 },
    explanation: 'Universalizar o direito sem ampliar a infraestrutura física de suporte substituiu a barreira de renda pela dura barreira do tempo perdido em filas.'
  },
  {
    id: 'ideological_prog_reforma_totalizante',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'progressive',
    riskFamily: 'emancipacao_universal',
    severity: 'moderate',
    title: 'Reforma totalizante',
    narrative: 'Um pacote legislativo único pretendeu transformar simultaneamente o currículo escolar, as normas trabalhistas e a convivência comunitária.',
    immediateBenefit: 'Sensação de vanguarda e ruptura acelerada com antigas injustiças em múltiplas frentes.',
    immediateBenefitEffects: { personalFreedom: +3 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxEconFreedom: 45, minPersonalFreedom: 58 },
    riskFactors: [
      { field: 'stability', operator: '<', value: 52, label: 'desorientação cívica perante mudanças vertiginosas', multiplier: 1.35 },
      { field: 'trust', operator: '<', value: 50, label: 'resistência de setores da sociedade civil', multiplier: 1.3 }
    ],
    effects: { stability: -5, trust: -4, education: -3 },
    explanation: 'Ao tentar remodelar toda a tessitura social em uma única tacada burocrática, as autoridades exauriram a capacidade de adaptação da sociedade.'
  },
  {
    id: 'ideological_prog_instituicao_sem_missao',
    type: 'ideologicalProblem',
    category: 'educação',
    nolanProfile: 'progressive',
    riskFamily: 'expansao_administrativa',
    severity: 'light',
    title: 'Instituição sem missão própria',
    narrative: 'Escolas técnicas e companhias de saneamento foram obrigadas a desviar recursos operacionais para coordenar oficinas de militância temática.',
    immediateBenefit: 'Uniformidade no discurso cívico das repartições em prol de pautas de conscientização.',
    immediateBenefitEffects: { equality: +2 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxEconFreedom: 45, minPersonalFreedom: 55 },
    riskFactors: [
      { field: 'education', operator: '<', value: 54, label: 'perda de foco no aprendizado cognitivo', multiplier: 1.3 },
      { field: 'infrastructure', operator: '<', value: 52, label: 'manutenção de tubulações negligenciada', multiplier: 1.25 }
    ],
    effects: { education: -4, infrastructure: -3 },
    explanation: 'Cada esfera social possui uma vocação indispensável; sobrecarregar escolas e saneamento com missões políticas secundárias degradou suas entregas essenciais.'
  },
  {
    id: 'ideological_prog_consultas_excessivas',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'progressive',
    riskFamily: 'democratismo_radical',
    severity: 'light',
    title: 'Consultas deliberativas excessivas',
    narrative: 'Assembleias e consultas foram convocadas até para definir a compra de tijolos de calçamento e a rota de limpeza urbana, atrasando o calendário.',
    immediateBenefit: 'Participação vibrante de moradores engajados em decisões cotidianas.',
    immediateBenefitEffects: { trust: +3 },
    weight: 9,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minPersonalFreedom: 58 },
    riskFactors: [
      { field: 'infrastructure', operator: '<', value: 54, label: 'cronogramas de obras suspensos por debates', multiplier: 1.3 }
    ],
    effects: { infrastructure: -3, stability: -2 },
    explanation: 'A pretensão democrática de deliberar sobre cada detalhe operacional ignorou que a administração pública exige decisões técnicas ágeis.'
  },
  {
    id: 'ideological_prog_participacao_exaustiva',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'progressive',
    riskFamily: 'democratismo_radical',
    severity: 'severe',
    title: 'Participação exaustiva',
    narrative: 'Votar semanalmente em centenas de itens esvaziou as assembleias populares: quem trabalha em jornada dupla desistiu, deixando o poder a facções militantes.',
    immediateBenefit: 'Controle absoluto dos fóruns por grupos dedicados em tempo integral à política.',
    immediateBenefitEffects: { personalFreedom: +2 },
    weight: 5,
    isGlobal: false,
    cooldownMonths: 30,
    duration: 8,
    monthlyEffects: { trust: -1, stability: -1 },
    delayedEffects: { equality: -2 },
    resolutionNarrative: 'A reabilitação de canais representativos céleres permitiu aos trabalhadores comuns retomar suas vidas sem abrir mão do controle cívico.',
    conditions: {
      minPersonalFreedom: 60,
      requiresAnyHistory: ['ideological_prog_consultas_excessivas']
    },
    riskFactors: [
      { field: 'trust', operator: '<', value: 46, label: 'desistência da maioria trabalhadora exausta', multiplier: 1.4 },
      { field: 'stability', operator: '<', value: 48, label: 'assembleias contestadas pela população geral', multiplier: 1.3 }
    ],
    effects: { trust: -6, stability: -5, equality: -3 },
    explanation: 'O dogma de que o cidadão deve legislar ininterruptamente sobre tudo gerou fadiga cívica, transferindo o poder de fato para corporações organizadas.'
  },
  {
    id: 'ideological_prog_categorias_rigidas',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'progressive',
    riskFamily: 'emancipacao_universal',
    severity: 'light',
    title: 'Categorias oficiais rígidas',
    narrative: 'Para alocar cotas e compensações, o poder público catalogou cidadãos em classificações burocráticas estanques que acirraram divisões de grupo.',
    immediateBenefit: 'Facilidade técnica de direcionamento de verbas a coletivos prioritários.',
    immediateBenefitEffects: { equality: +3 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxEconFreedom: 45, minPersonalFreedom: 55 },
    riskFactors: [
      { field: 'trust', operator: '<', value: 52, label: 'concorrência identitária por verbas limitadas', multiplier: 1.3 }
    ],
    effects: { trust: -4, personalFreedom: -3 },
    explanation: 'A riqueza plural da identidade humana foi comprimida em gavetas estatais artificiais, gerando desconfiança mútua em vez de empatia solidária.'
  },
  {
    id: 'ideological_prog_direitos_colisao',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'progressive',
    riskFamily: 'emancipacao_universal',
    severity: 'light',
    title: 'Direitos em colisão sem conciliação',
    narrative: 'A proclamação sucessiva de novos direitos universais sem critérios de ponderação travou o uso do solo, transportes e manifestações de rua.',
    immediateBenefit: 'Reconhecimento formal de justas reivindicações históricas de múltiplos grupos.',
    immediateBenefitEffects: { personalFreedom: +3 },
    weight: 9,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minPersonalFreedom: 60 },
    riskFactors: [
      { field: 'stability', operator: '<', value: 52, label: 'insegurança jurídica perante garantias rivais', multiplier: 1.3 }
    ],
    effects: { stability: -4, trust: -3 },
    explanation: 'Multiplicar declarações de direitos sem estabelecer parâmetros claros de mútua convivência transformou o espaço público numa arena de litígios absolutos.'
  },
  {
    id: 'ideological_prog_controle_precos',
    type: 'ideologicalProblem',
    category: 'economia',
    nolanProfile: 'progressive',
    riskFamily: 'expansao_administrativa',
    severity: 'moderate',
    title: 'Controle de preços mal calibrado',
    narrative: 'O tabelamento de aluguéis e alimentos básicos aliviou os primeiros meses, mas fez fornecedores suspenderem compras e desviarem estoques para cidades vizinhas.',
    immediateBenefit: 'Alívio inflacionário expressivo e imediato no bolso dos mais necessitados.',
    immediateBenefitEffects: { housing: +3, equality: +2 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxEconFreedom: 40 },
    riskFactors: [
      { field: 'economy', operator: '<', value: 52, label: 'margens comerciais asfixiadas pelo decreto', multiplier: 1.35 },
      { field: 'housing', operator: '<', value: 48, label: 'retirada de imóveis do mercado aberto', multiplier: 1.3 }
    ],
    effects: { economy: -5, jobs: -3 },
    explanation: 'Tabelar preços por decreto combateu os sintomas aparentes da carestia, mas sufocou a produção e fomentou o desabastecimento das prateleiras.'
  },
  {
    id: 'ideological_prog_captura_intermediarios',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'progressive',
    riskFamily: 'expansao_administrativa',
    severity: 'moderate',
    title: 'Programa capturado por intermediários',
    narrative: 'Uma parcela substancial dos recursos de acolhimento social passou a ser retida pela burocracia de consultorias e entidades gestoras parceiras.',
    immediateBenefit: 'Emprego formal de quadros universitários especializados em gestão de políticas públicas.',
    immediateBenefitEffects: { jobs: +2 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxEconFreedom: 45 },
    riskFactors: [
      { field: 'trust', operator: '<', value: 48, label: 'denúncias de favorecimento institucional', multiplier: 1.35 },
      { field: 'equality', operator: '<', value: 50, label: 'recursos escassos chegando na ponta necessitada', multiplier: 1.25 }
    ],
    effects: { trust: -5, equality: -3, economy: -2 },
    explanation: 'A profissionalização burocrática da solidariedade criou uma camada de intermediários que absorveu verbas destinadas aos mais desfavorecidos.'
  },
  {
    id: 'ideological_prog_pobreza_uma_causa',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'progressive',
    riskFamily: 'emancipacao_universal',
    severity: 'light',
    title: 'Pobreza reduzida a uma causa única',
    narrative: 'O governo concentrou sua atuação apenas em auxílios financeiros monetários, ignorando a decadência do saneamento, do ensino básico e dos laços familiares.',
    immediateBenefit: 'Melhora imediata nos indicadores estatísticos de renda per capita municipal.',
    immediateBenefitEffects: { equality: +3 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxEconFreedom: 45 },
    riskFactors: [
      { field: 'education', operator: '<', value: 50, label: 'baixa formação técnica e escolar', multiplier: 1.3 }
    ],
    effects: { education: -3, jobs: -2 },
    explanation: 'Reduzir a complexidade do florescimento humano a repasses financeiros descurou da capacitação e dos vínculos comunitários que geram autonomia duradoura.'
  },
  {
    id: 'ideological_prog_reforma_simbolica',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'progressive',
    riskFamily: 'emancipacao_universal',
    severity: 'light',
    title: 'Reforma simbólica de fachadas',
    narrative: 'Verbas expressivas foram direcionadas para a troca de terminologias oficiais em manuais enquanto tubulações de esgoto estouravam na periferia.',
    immediateBenefit: 'Alinhamento com a linguagem das vanguardas intelectuais internacionais.',
    immediateBenefitEffects: { personalFreedom: +2 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxEconFreedom: 45, minPersonalFreedom: 55 },
    riskFactors: [
      { field: 'infrastructure', operator: '<', value: 50, label: 'serviços básicos em estado de abandono', multiplier: 1.35 },
      { field: 'trust', operator: '<', value: 52, label: 'ceticismo popular com prioridades governamentais', multiplier: 1.25 }
    ],
    effects: { infrastructure: -4, trust: -3 },
    explanation: 'A priorização de gestos retóricos sobre obras materiais estruturantes provocou revolta nos bairros periféricos que aguardavam soluções concretas.'
  },

  // =========================================================================
  // 4. FAMÍLIA ESTATISTA (Concentração Coercitiva e Homogeneização do Poder)
  // =========================================================================
  {
    id: 'ideological_stat_nacionalizacao_apressada',
    type: 'ideologicalProblem',
    category: 'economia',
    nolanProfile: 'statist',
    riskFamily: 'concentracao_coercitiva',
    severity: 'moderate',
    title: 'Nacionalização apressada',
    narrative: 'Usinas de energia e moinhos privados foram expropriados sem quadros técnicos capacitados para manter a produção e as peças de reposição.',
    immediateBenefit: 'Controle político direto da matriz energética nas mãos dos dirigentes estatais.',
    immediateBenefitEffects: { stability: +2 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxEconFreedom: 35, maxPersonalFreedom: 40 },
    riskFactors: [
      { field: 'economy', operator: '<', value: 48, label: 'fuga de investimentos e colapso de contratos', multiplier: 1.35 },
      { field: 'infrastructure', operator: '<', value: 50, label: 'falhas mecânicas sob comando burocrático', multiplier: 1.3 }
    ],
    effects: { economy: -5, infrastructure: -4, jobs: -2 },
    explanation: 'A tomada forçada dos meios produtivos confundiu o ato de posse política com a complexa capacidade de manter indústrias operando com eficiência.'
  },
  {
    id: 'ideological_stat_nova_classe_burocratica',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'statist',
    riskFamily: 'concentracao_coercitiva',
    severity: 'moderate',
    title: 'Nova classe burocrática',
    narrative: 'Comissários de ministérios e diretores de monopólios estatais asseguraram cotas especiais de víveres e clínicas privativas inacessíveis ao povo.',
    immediateBenefit: 'Fidelidade irrestrita da alta cúpula dos administradores aos desígnios do poder central.',
    immediateBenefitEffects: { stability: +2 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxEconFreedom: 35, maxPersonalFreedom: 40 },
    riskFactors: [
      { field: 'equality', operator: '<', value: 45, label: 'abismo de privilégios entre dirigentes e cidadãos', multiplier: 1.4 },
      { field: 'trust', operator: '<', value: 45, label: 'indignação popular com regalias veladas', multiplier: 1.3 }
    ],
    effects: { equality: -6, trust: -5 },
    explanation: 'O discurso de igualitarismo serviu de manto para a ascensão de uma nova aristocracia administrativa proprietária do controle dos recursos públicos.'
  },
  {
    id: 'ideological_stat_escassez_planejada',
    type: 'ideologicalProblem',
    category: 'economia',
    nolanProfile: 'statist',
    riskFamily: 'concentracao_coercitiva',
    severity: 'moderate',
    title: 'Escassez planejada e cotas',
    narrative: 'Erros de cálculo no plano de suprimento do comitê central deixaram os armazéns sem calçados, sabão e remédios básicos por meses a fio.',
    immediateBenefit: 'Preços tabelados formalmente congelados em valores irrisórios nos balcões vazios.',
    immediateBenefitEffects: { equality: +2 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 26,
    duration: 10,
    monthlyEffects: { housing: -1, trust: -1 },
    delayedEffects: { economy: -2 },
    resolutionNarrative: 'A liberação de pequenas cooperativas de artesãos e feiras populares restabeleceu o abastecimento mínimo nas mercearias.',
    conditions: { maxEconFreedom: 35 },
    riskFactors: [
      { field: 'economy', operator: '<', value: 45, label: 'planejamento estatal dissociado da demanda real', multiplier: 1.4 },
      { field: 'health', operator: '<', value: 48, label: 'desabastecimento crítico de remédios', multiplier: 1.3 }
    ],
    effects: { health: -4, housing: -4, economy: -3 },
    explanation: 'A ilusão de que uma diretoria central pode antecipar todas as necessidades gerou escassez crônica e filas degradantes para a subsistência.'
  },
  {
    id: 'ideological_stat_mercado_clandestino',
    type: 'ideologicalProblem',
    category: 'economia',
    nolanProfile: 'statist',
    riskFamily: 'concentracao_coercitiva',
    severity: 'severe',
    title: 'Mercado clandestino generalizado',
    narrative: 'Para conseguir farinha e peças mecânicas, moradores foram forçados a negociar em becos escuros com contrabandistas que subornam a fiscalização.',
    immediateBenefit: 'Válvula de escape que garantiu a sobrevivência prática das famílias à margem do sistema oficial.',
    immediateBenefitEffects: { economy: +2 },
    weight: 5,
    isGlobal: false,
    cooldownMonths: 30,
    duration: 10,
    monthlyEffects: { trust: -1, safety: -1 },
    delayedEffects: { stability: -3 },
    resolutionNarrative: 'A legalização de feiras livres e o afrouxamento do comércio trouxeram as mercadorias de volta à luz do dia.',
    conditions: {
      maxEconFreedom: 35,
      requiresAnyHistory: ['ideological_stat_escassez_planejada', 'ideological_prog_controle_precos']
    },
    riskFactors: [
      { field: 'trust', operator: '<', value: 40, label: 'desrespeito generalizado às normas oficiais inócuas', multiplier: 1.45 },
      { field: 'safety', operator: '<', value: 45, label: 'crime organizado controlando redes de suprimento', multiplier: 1.35 }
    ],
    effects: { trust: -6, safety: -5, equality: -4 },
    explanation: 'A proibição coercitiva do comércio não aboliu as trocas essenciais; apenas as jogou na clandestinidade, enriquecendo milícias e corrompendo fiscais.'
  },
  {
    id: 'ideological_stat_verdade_oficial',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'statist',
    riskFamily: 'homogeneizacao_politica',
    severity: 'light',
    title: 'Verdade oficial e censura',
    narrative: 'Dados sobre poluição e surtos hospitalares foram adulterados pela agência oficial para resguardar a reputação de infalibilidade do poder.',
    immediateBenefit: 'Tranquilidade aparente nas manchetes e sensação de controle absoluto transmitida nas emissoras estatais.',
    immediateBenefitEffects: { stability: +3 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 35 },
    riskFactors: [
      { field: 'trust', operator: '<', value: 48, label: 'contradição patente entre o rádio e a realidade', multiplier: 1.35 }
    ],
    effects: { trust: -5, health: -2, education: -2 },
    explanation: 'Ao censurar indicadores incômodos para proteger a imagem do governo, as autoridades impediram o enfrentamento real das crises que se avolumavam.'
  },
  {
    id: 'ideological_stat_inimigos_povo',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'statist',
    riskFamily: 'homogeneizacao_politica',
    severity: 'moderate',
    title: 'Inimigos do povo fabricados',
    narrative: 'O colapso da colheita agrícola foi creditado oficialmente a sabotadores conspiradores, gerando uma onda de processos e prisões arbitrárias.',
    immediateBenefit: 'Desvio eficaz da responsabilidade dos governantes sobre os erros técnicos de planejamento.',
    immediateBenefitEffects: { stability: +2 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 35 },
    riskFactors: [
      { field: 'trust', operator: '<', value: 45, label: 'ambiente de suspeição mútua e delação', multiplier: 1.4 },
      { field: 'stability', operator: '<', value: 50, label: 'insegurança civil sobre quem será o próximo alvo', multiplier: 1.3 }
    ],
    effects: { trust: -6, personalFreedom: -5, stability: -2 },
    explanation: 'A recusa em aceitar limites e falhas na gestão coercitiva exigiu a fabricação contínua de bodes expiatórios para justificar os próprios fracassos.'
  },
  {
    id: 'ideological_stat_teste_lealdade',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'statist',
    riskFamily: 'homogeneizacao_politica',
    severity: 'moderate',
    title: 'Teste de lealdade ideológica',
    narrative: 'O acesso a vagas universitárias e cirurgias eletivas passou a depender de atestados de bom comportamento e filiação ao bloco governista.',
    immediateBenefit: 'Monopólio de oportunidades estratégicas confiado apenas a partidários incondicionais.',
    immediateBenefitEffects: { stability: +2 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 35, maxEconFreedom: 40 },
    riskFactors: [
      { field: 'education', operator: '<', value: 50, label: 'expulsão de pesquisadores independentes', multiplier: 1.35 },
      { field: 'equality', operator: '<', value: 45, label: 'cidadãos sem vínculos tratados como excluídos', multiplier: 1.3 }
    ],
    effects: { education: -4, health: -3, equality: -4, personalFreedom: -3 },
    explanation: 'Subordinar o mérito profissional e o cuidado humano ao alinhamento ideológico deteriorou a qualidade dos serviços públicos essenciais.'
  },
  {
    id: 'ideological_stat_fiscalizacao_emergencial',
    type: 'ideologicalProblem',
    category: 'segurança',
    nolanProfile: 'statist',
    riskFamily: 'concentracao_coercitiva',
    severity: 'light',
    title: 'Fiscalização emergencial extraordinária',
    narrative: 'Bloqueios nas rodovias e vistorias sumárias de correspondências foram adotados temporariamente para frear o contrabando de alimentos.',
    immediateBenefit: 'Contenção visível de desvios e apreensão de estoques retidos em galpões.',
    immediateBenefitEffects: { safety: +3 },
    weight: 9,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 40 },
    riskFactors: [
      { field: 'personalFreedom', operator: '<', value: 44, label: 'supressão gradual de garantias de privacidade', multiplier: 1.3 }
    ],
    effects: { personalFreedom: -3, trust: -2 },
    explanation: 'Dispositivos de exceção criados para responder a crises materiais assentaram a infraestrutura que viabilizaria a vigilância totalitária.'
  },
  {
    id: 'ideological_stat_vigilancia_permanente',
    type: 'ideologicalProblem',
    category: 'segurança',
    nolanProfile: 'statist',
    riskFamily: 'concentracao_coercitiva',
    severity: 'severe',
    title: 'Vigilância permanente institucionalizada',
    narrative: 'Escutas em prédios de habitação e informantes nas salas de aula tornaram-se definitivos, eliminando a intimidade e a livre troca de ideias.',
    immediateBenefit: 'Supressão quase total de crimes patrimoniais nos perímetros monitorados por câmeras.',
    immediateBenefitEffects: { safety: +4 },
    weight: 5,
    isGlobal: false,
    cooldownMonths: 30,
    duration: 12,
    monthlyEffects: { personalFreedom: -1, trust: -1 },
    delayedEffects: { stability: -3 },
    resolutionNarrative: 'A desativação do sistema de escutas biométricas e o fim dos comitês de quarteirão restauraram a inviolabilidade do lar.',
    conditions: {
      maxPersonalFreedom: 30,
      requiresAnyHistory: ['ideological_stat_fiscalizacao_emergencial']
    },
    riskFactors: [
      { field: 'personalFreedom', operator: '<', value: 35, label: 'sociedade sob cerco policial contínuo', multiplier: 1.45 },
      { field: 'trust', operator: '<', value: 40, label: 'pavor de expressar opiniões em círculos familiares', multiplier: 1.35 }
    ],
    effects: { personalFreedom: -8, trust: -6, stability: -3 },
    explanation: 'A segurança aparente foi erigida ao custo da aniquilação completa da privacidade, transformando a desconfiança em regra geral de convivência.'
  },
  {
    id: 'ideological_stat_associacoes_absorvidas',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'statist',
    riskFamily: 'concentracao_coercitiva',
    severity: 'moderate',
    title: 'Associações civis absorvidas',
    narrative: 'Sindicatos livres, grêmios e associações de caridade foram estatizados sob interventores nomeados pelo diretório central.',
    immediateBenefit: 'Fim das greves independentes e obediência cega de todas as agremiações civis.',
    immediateBenefitEffects: { stability: +3 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 35 },
    riskFactors: [
      { field: 'trust', operator: '<', value: 45, label: 'destruição dos corpos intermediários independentes', multiplier: 1.4 },
      { field: 'personalFreedom', operator: '<', value: 38, label: 'proibição de reuniões civis espontâneas', multiplier: 1.3 }
    ],
    effects: { trust: -5, personalFreedom: -5, equality: -2 },
    explanation: 'A intolerância com associações autônomas esmagou a sociedade civil, deixando o cidadão isolado e desprotegido perante o monólito estatal.'
  },
  {
    id: 'ideological_stat_homogeneizacao_cultural',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'statist',
    riskFamily: 'homogeneizacao_politica',
    severity: 'light',
    title: 'Homogeneização cultural obrigatória',
    narrative: 'Canções folclóricas locais e peculiaridades regionais foram proibidas em favor de um hino cívico padrão entoado em formaturas diárias.',
    immediateBenefit: 'Padronização visual e coreográfica impecável nas paradas de celebração cívica.',
    immediateBenefitEffects: { stability: +2 },
    weight: 9,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 35 },
    riskFactors: [
      { field: 'personalFreedom', operator: '<', value: 40, label: 'supressão violenta de particularismos autênticos', multiplier: 1.35 }
    ],
    effects: { personalFreedom: -4, trust: -3 },
    explanation: 'A busca de uma unidade artificial confundiu pluralismo com conspiração, aniquilando tradições centenárias em nome de uma estética imposta.'
  },
  {
    id: 'ideological_stat_estado_emergencia',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'statist',
    riskFamily: 'concentracao_coercitiva',
    severity: 'moderate',
    title: 'Estado de emergência prolongado',
    narrative: 'Decretos excepcionais baixados durante um vendaval continuam vigentes há anos porque a cúpula declarou que "o perigo da desordem permanece vivo".',
    immediateBenefit: 'Contratos e desapropriações executados sumariamente sem necessidade de autorização legislativa.',
    immediateBenefitEffects: { infrastructure: +2 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 35 },
    riskFactors: [
      { field: 'stability', operator: '<', value: 50, label: 'fadiga civil perante o governo por decretos de exceção', multiplier: 1.35 },
      { field: 'personalFreedom', operator: '<', value: 40, label: 'suspensão permanente do devido processo legal', multiplier: 1.3 }
    ],
    effects: { stability: -4, personalFreedom: -5, trust: -4 },
    explanation: 'Poderes outorgados para conter emergências foram perenizados pelas autoridades, que jamais abrem mão voluntariamente de prerrogativas excepcionais.'
  },
  {
    id: 'ideological_stat_producao_metas',
    type: 'ideologicalProblem',
    category: 'economia',
    nolanProfile: 'statist',
    riskFamily: 'concentracao_coercitiva',
    severity: 'light',
    title: 'Produção para cumprir metas fictícias',
    narrative: 'Fundições produziram toneladas de parafusos gigantes inúteis para atingir o peso fixado pela cota burocrática, esgotando o estoque de aço da cidade.',
    immediateBenefit: 'Alcançamento estatístico de 120% da meta de tonelagem estipulada pelo ministério.',
    immediateBenefitEffects: { economy: +2 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxEconFreedom: 35 },
    riskFactors: [
      { field: 'economy', operator: '<', value: 48, label: 'desperdício crônico de insumos em artigos imprestáveis', multiplier: 1.35 }
    ],
    effects: { economy: -3, infrastructure: -3, jobs: -2 },
    explanation: 'Quando o valor da produção é medido por formulários em vez do benefício concreto aos usuários, o trabalho humano é desperdiçado em peças sem serventia.'
  },
  {
    id: 'ideological_stat_repressao_protestos',
    type: 'ideologicalProblem',
    category: 'segurança',
    nolanProfile: 'statist',
    riskFamily: 'concentracao_coercitiva',
    severity: 'moderate',
    title: 'Repressão violenta a protestos',
    narrative: 'Marchas de mães e operários que protestavam contra a escassez de pão foram dispersadas com blindados militares e detenções massivas.',
    immediateBenefit: 'Fim abrupto dos bloqueios de trânsito e desobstrução das praças principais.',
    immediateBenefitEffects: { safety: +3 },
    weight: 7,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 32 },
    riskFactors: [
      { field: 'trust', operator: '<', value: 42, label: 'ruptura irremediável entre a população e os governantes', multiplier: 1.4 },
      { field: 'stability', operator: '<', value: 48, label: 'ressentimento e fúria popular latente reprimida', multiplier: 1.35 }
    ],
    effects: { trust: -6, stability: -5, personalFreedom: -5 },
    explanation: 'O governo que jurava representar o povo tratou o clamor por pão como motim hostil, revelando a violência nua necessária para impor sua hegemonia.'
  },
  {
    id: 'ideological_stat_cidadania_segunda_classe',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'statist',
    riskFamily: 'homogeneizacao_politica',
    severity: 'severe',
    title: 'Cidadania de segunda classe',
    narrative: 'Pessoas com laços com antigas profissões autônomas foram fichadas em passaportes internos restritivos que as proíbem de residir perto dos eixos centrais.',
    immediateBenefit: 'Afastamento compulsório de qualquer voz independente das cercanias do poder.',
    immediateBenefitEffects: { stability: +2 },
    weight: 5,
    isGlobal: false,
    cooldownMonths: 30,
    duration: 12,
    monthlyEffects: { equality: -1, trust: -1 },
    delayedEffects: { stability: -3 },
    resolutionNarrative: 'A extinção dos passaportes de casta devolveu a plenitude de direitos de moradia e circulação a todos os cidadãos.',
    conditions: { maxPersonalFreedom: 28, maxEconFreedom: 35 },
    riskFactors: [
      { field: 'equality', operator: '<', value: 38, label: 'sistema de castas políticas formalizado em lei', multiplier: 1.45 },
      { field: 'trust', operator: '<', value: 38, label: 'humilhação cotidiana das famílias segregadas', multiplier: 1.4 }
    ],
    effects: { equality: -7, personalFreedom: -7, trust: -6, stability: -3 },
    explanation: 'A obsessão por uma homogeneidade coercitiva culminou na criação de um apartheid burocrático que privou dissidentes de sua humanidade civil.'
  },
  {
    id: 'ideological_stat_cidade_nao_falha',
    type: 'ideologicalProblem',
    category: 'saúde',
    nolanProfile: 'statist',
    riskFamily: 'concentracao_coercitiva',
    severity: 'moderate',
    title: 'A cidade não pode falhar',
    narrative: 'Sanitaristas foram silenciados sobre um vazamento tóxico no reservatório porque a cúpula não admitia que sua obra modelo sofresse contaminação.',
    immediateBenefit: 'Preservação da lenda de competência impecável do governo nos boletins de propaganda.',
    immediateBenefitEffects: { stability: +2 },
    weight: 7,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { maxPersonalFreedom: 35 },
    riskFactors: [
      { field: 'health', operator: '<', value: 46, label: 'contaminação hídrica propagando-se em segredo', multiplier: 1.4 },
      { field: 'trust', operator: '<', value: 45, label: 'pânico coletivo quando os sintomas se alastraram', multiplier: 1.35 }
    ],
    effects: { health: -6, trust: -5, infrastructure: -2 },
    explanation: 'A mentira de que a gestão estatal é imune a falhas transformou uma avaria contornável numa emergência de saúde pública devastadora.'
  },

  // =========================================================================
  // 5. FAMÍLIA CENTRISTA (Síntese do Jogo: Tecnocracia e Pragmatismo Sem Rumo)
  // =========================================================================
  {
    id: 'ideological_cent_comissao_permanente',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'centrist',
    riskFamily: 'tecnocracia_pragmatica',
    severity: 'light',
    title: 'Comissão permanente sem prazo',
    narrative: 'Para não desagradar ambientalistas nem incorporadoras, o conselho criou um grupo de estudo que já dura quatro anos sem emitir laudo conclusivo.',
    immediateBenefit: 'Apaziguamento dos atritos na imprensa e adiamento cômodo de votações polêmicas.',
    immediateBenefitEffects: { stability: +2 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 40, maxEconFreedom: 60, minPersonalFreedom: 40, maxPersonalFreedom: 60 },
    riskFactors: [
      { field: 'housing', operator: '<', value: 52, label: 'moradia estagnada à espera de diretrizes', multiplier: 1.3 },
      { field: 'infrastructure', operator: '<', value: 52, label: 'obras essenciais emperradas no colegiado', multiplier: 1.25 }
    ],
    effects: { housing: -3, infrastructure: -3, trust: -2 },
    explanation: 'Transferir escolhas políticas espinhosas para pareceres técnicos sem fim paralisou a resolução de dilemas urbanos inadiáveis.'
  },
  {
    id: 'ideological_cent_compromisso_contraditorio',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'centrist',
    riskFamily: 'conciliacao_incoerente',
    severity: 'light',
    title: 'Compromisso contraditório',
    narrative: 'Foi votado um subsídio para frotas de carga pesada e, no mesmo decreto, uma taxa punitiva contra a emissão de poluentes para os mesmos veículos.',
    immediateBenefit: 'Ambas as bancadas parlamentares puderam cantar vitória perante seus respectivos eleitorados.',
    immediateBenefitEffects: { stability: +2 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 40, maxEconFreedom: 60, minPersonalFreedom: 40, maxPersonalFreedom: 60 },
    riskFactors: [
      { field: 'stability', operator: '>', value: 48, label: 'obsessão por acomodar interesses inconciliáveis', multiplier: 1.25 }
    ],
    effects: { economy: -3, environment: -2, trust: -2 },
    explanation: 'A ânsia de compor com todos os lados produziu normas autoanuláveis, dissipando verba pública e gerando confusão operacional.'
  },
  {
    id: 'ideological_cent_tecnocracia_sem_neutralidade',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'centrist',
    riskFamily: 'tecnocracia_pragmatica',
    severity: 'moderate',
    title: 'Tecnocracia apresentada como neutra',
    narrative: 'O corte no orçamento de escolas de bairro foi anunciado como "conclusão atuarial inevitável, matemática e livre de qualquer ideologia".',
    immediateBenefit: 'Ajuste contábil veloz aplaudido por fundos de crédito e analistas de mercado.',
    immediateBenefitEffects: { economy: +3 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 40, maxEconFreedom: 60, minPersonalFreedom: 40, maxPersonalFreedom: 60 },
    riskFactors: [
      { field: 'equality', operator: '<', value: 50, label: 'sacrifício imposto às parcelas menos ouvidas', multiplier: 1.35 },
      { field: 'trust', operator: '<', value: 52, label: 'sensação de que a gestão não possui sensibilidade moral', multiplier: 1.3 }
    ],
    effects: { equality: -4, trust: -4 },
    explanation: 'Disfarçar decisões distributivas dolorosas sob o manto de uma neutralidade matemática desarmou o debate democrático e indignou a sociedade.'
  },
  {
    id: 'ideological_cent_governo_indicadores',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'centrist',
    riskFamily: 'tecnocracia_pragmatica',
    severity: 'light',
    title: 'Governo por indicadores de vitrine',
    narrative: 'Postos de saúde apressaram altas de pacientes para inflar a taxa de rotatividade dos leitos, sem acompanhar reinternações críticas subsequentes.',
    immediateBenefit: 'Apresentação de gráficos impecáveis em fóruns de excelência em gestão pública.',
    immediateBenefitEffects: { stability: +2 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 40, maxEconFreedom: 60 },
    riskFactors: [
      { field: 'health', operator: '<', value: 55, label: 'foco na meta numérica em vez do cuidado humano', multiplier: 1.3 }
    ],
    effects: { health: -3, trust: -3 },
    explanation: 'Quando a métrica estatística se sobrepõe à finalidade ética da medicina, a equipe burocratiza o sofrimento para bater metas fictícias.'
  },
  {
    id: 'ideological_cent_coalizao_fragil',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'centrist',
    riskFamily: 'conciliacao_incoerente',
    severity: 'light',
    title: 'Coalizão frágil e volúvel',
    narrative: 'Pequenas desavenças sobre a indicação de diretorias secundárias paralisaram as votações cruciais no conselho da metrópole.',
    immediateBenefit: 'Governança amparada nominalmente por uma maioria folgada de partidos centristas.',
    immediateBenefitEffects: { stability: +2 },
    weight: 9,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 40, maxEconFreedom: 60, minPersonalFreedom: 40, maxPersonalFreedom: 60 },
    riskFactors: [
      { field: 'stability', operator: '<', value: 52, label: 'chantagens veladas de bancadas nanicas', multiplier: 1.3 }
    ],
    effects: { stability: -3, infrastructure: -2 },
    explanation: 'Alianças construídas sem unidade de propósito transformaram a administração num balcão de negociações incapaz de agir com firmeza.'
  },
  {
    id: 'ideological_cent_politica_curto_prazo',
    type: 'ideologicalProblem',
    category: 'infraestrutura',
    nolanProfile: 'centrist',
    riskFamily: 'pragmatismo_difuso',
    severity: 'light',
    title: 'Política de curto prazo para pesquisas',
    narrative: 'Recapeou-se o asfalto das avenidas de maior visibilidade eleitoral, enquanto a recuperação das galerias fluviais profundas foi postergada.',
    immediateBenefit: 'Aprovação popular expressiva e imediata no mês seguinte às obras superficiais.',
    immediateBenefitEffects: { trust: +3 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 40, maxEconFreedom: 60 },
    riskFactors: [
      { field: 'infrastructure', operator: '<', value: 52, label: 'redes subterrâneas apodrecendo sem manutenção', multiplier: 1.35 }
    ],
    effects: { infrastructure: -4, economy: -2 },
    explanation: 'O foco obsessivo em melhorias efêmeras que caibam no ciclo de sondagens de opinião legou custos estruturais gravosos aos próximos mandatos.'
  },
  {
    id: 'ideological_cent_reforma_pela_metade',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'centrist',
    riskFamily: 'pragmatismo_difuso',
    severity: 'light',
    title: 'Reforma pela metade',
    narrative: 'Desmontou-se o sistema antigo de fiscalização sanitária, mas recuou-se na instituição do novo órgão para não desagradar aliados pontuais.',
    immediateBenefit: 'Evitou-se o desgaste de confrontar abertamente corporações inconformadas.',
    immediateBenefitEffects: { stability: +2 },
    weight: 9,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 40, maxEconFreedom: 60 },
    riskFactors: [
      { field: 'economy', operator: '<', value: 52, label: 'insegurança jurídica no setor produtivo', multiplier: 1.3 },
      { field: 'stability', operator: '<', value: 52, label: 'vácuo de fiscalização nas rotinas urbanas', multiplier: 1.25 }
    ],
    effects: { economy: -3, stability: -2, trust: -2 },
    explanation: 'Revogar velhos instrumentos sem ter a convicção política de instaurar a nova estrutura gerou um vácuo normativo prejudicial à cidade.'
  },
  {
    id: 'ideological_cent_responsabilidade_difusa',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'centrist',
    riskFamily: 'tecnocracia_pragmatica',
    severity: 'light',
    title: 'Responsabilidade difusa entre conselhos',
    narrative: 'Após um colapso na coleta de resíduos, três superintendências empurraram a culpa umas para as outras sem que nenhum dirigente assumisse a solução.',
    immediateBenefit: 'Nenhum integrante do gabinete municipal precisou arcar com o desgaste da crise.',
    immediateBenefitEffects: { stability: +2 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 40, maxEconFreedom: 60 },
    riskFactors: [
      { field: 'trust', operator: '<', value: 50, label: 'sensação popular de labirinto burocrático impune', multiplier: 1.3 },
      { field: 'health', operator: '<', value: 52, label: 'risco sanitário sem resposta executiva célere', multiplier: 1.25 }
    ],
    effects: { trust: -4, health: -2, infrastructure: -2 },
    explanation: 'A criação excessiva de comitês sobrepostos diluiu a autoridade e a responsabilidade, deixando a comunidade sem interlocutor direto.'
  },
  {
    id: 'ideological_cent_labirinto_regulatorio',
    type: 'ideologicalProblem',
    category: 'economia',
    nolanProfile: 'centrist',
    riskFamily: 'conciliacao_incoerente',
    severity: 'moderate',
    title: 'Labirinto regulatório de conciliações',
    narrative: 'O acúmulo de cláusulas de exceção criadas para conciliar interesses empresariais tornou as regras tributárias ilegíveis para novos negócios.',
    immediateBenefit: 'Nenhum grupo de interesse tradicional viu suas prerrogativas de mercado ameaçadas.',
    immediateBenefitEffects: { stability: +2 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 40, maxEconFreedom: 60 },
    riskFactors: [
      { field: 'economy', operator: '<', value: 52, label: 'custos de conformidade e atrito regulatório', multiplier: 1.35 },
      { field: 'jobs', operator: '<', value: 50, label: 'insegurança para a criação de novos postos', multiplier: 1.25 }
    ],
    effects: { economy: -4, jobs: -3, trust: -2 },
    explanation: 'A multiplicação de concessões pontuais para evitar o conflito com corporações teceu uma trama regulatória sufocante para o dinamismo geral.'
  },
  {
    id: 'ideological_cent_apatia_confortavel',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'centrist',
    riskFamily: 'pragmatismo_difuso',
    severity: 'light',
    title: 'Apatia confortável e declínio lento',
    narrative: 'A ausência de polêmicas e a moderação burocrática afastaram a população do debate público enquanto a malha viária envelhecia em silêncio.',
    immediateBenefit: 'Paz institucional serena e ausência de manifestações conturbadas nas praças.',
    immediateBenefitEffects: { stability: +3 },
    weight: 10,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 42, maxEconFreedom: 58, minPersonalFreedom: 42, maxPersonalFreedom: 58 },
    riskFactors: [
      { field: 'infrastructure', operator: '<', value: 50, label: 'desgaste lento sem sinal de alarme público', multiplier: 1.3 },
      { field: 'trust', operator: '<', value: 50, label: 'desinteresse do cidadão pelos rumos da pólis', multiplier: 1.25 }
    ],
    effects: { trust: -3, infrastructure: -2, economy: -2 },
    explanation: 'A ilusão de que a gestão pública é um piloto automático sem necessidade de inspiração ética adormeceu a vigilância indispensável da cidadania.'
  },
  {
    id: 'ideological_cent_oscilacao_pesquisas',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'centrist',
    riskFamily: 'pragmatismo_difuso',
    severity: 'light',
    title: 'Oscilação pelas pesquisas semanais',
    narrative: 'O traçado de novas linhas de metrô de superfície mudou três vezes no mesmo ano conforme o resultado de grupos focais encomendados pela prefeitura.',
    immediateBenefit: 'Gabinete sempre afinado com as inclinações mais populares do momento.',
    immediateBenefitEffects: { trust: +2 },
    weight: 9,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 40, maxEconFreedom: 60 },
    riskFactors: [
      { field: 'stability', operator: '<', value: 54, label: 'inconstância de planejamento estrutural', multiplier: 1.3 }
    ],
    effects: { infrastructure: -3, stability: -2 },
    explanation: 'Guiar políticas públicas complexas apenas por oscilações amostrais passageiras sacrificou a coerência e a conclusão de projetos de longo prazo.'
  },
  {
    id: 'ideological_cent_orcamento_conciliacao',
    type: 'ideologicalProblem',
    category: 'economia',
    nolanProfile: 'centrist',
    riskFamily: 'conciliacao_incoerente',
    severity: 'moderate',
    title: 'Orçamento de conciliação fragmentado',
    narrative: 'Para não desagradar nenhum bairro da base de apoio, as verbas de saneamento foram fatiadas em centenas de pequenas obras que nunca terminam.',
    immediateBenefit: 'Aprovação unânime do plano de metas sem oposição parlamentar.',
    immediateBenefitEffects: { stability: +3 },
    weight: 8,
    isGlobal: false,
    cooldownMonths: 24,
    conditions: { minEconFreedom: 40, maxEconFreedom: 60 },
    riskFactors: [
      { field: 'infrastructure', operator: '<', value: 50, label: 'canteiros de obras espalhados e inconclusos', multiplier: 1.35 },
      { field: 'economy', operator: '<', value: 52, label: 'ineficiência na aplicação de verbas públicas', multiplier: 1.25 }
    ],
    effects: { infrastructure: -4, economy: -2, trust: -2 },
    explanation: 'A recusa em hierarquizar prioridades pulverizou recursos em migalhas orçamentárias que não solucionaram nenhum gargalo real da metrópole.'
  },
  {
    id: 'ideological_cent_paralisia_coalizao',
    type: 'ideologicalProblem',
    category: 'política',
    nolanProfile: 'centrist',
    riskFamily: 'conciliacao_incoerente',
    severity: 'severe',
    title: 'Paralisia da coalizão de centro',
    narrative: 'Após atritos irreconciliáveis entre alas tecnocráticas e clientelistas, o governo não consegue aprovar créditos básicos para pagar fornecedores.',
    immediateBenefit: 'Bloqueio mútuo que impediu que qualquer facção tomasse decisões unilaterais.',
    immediateBenefitEffects: { personalFreedom: +2 },
    weight: 5,
    isGlobal: false,
    cooldownMonths: 30,
    duration: 10,
    monthlyEffects: { stability: -1, trust: -1 },
    delayedEffects: { economy: -2, infrastructure: -2 },
    resolutionNarrative: 'A formação de uma agenda emergencial mínima com metas de desburocratização destravou o conselho metropolitano.',
    conditions: {
      requiresAnyHistory: ['ideological_cent_compromisso_contraditorio', 'ideological_cent_coalizao_fragil']
    },
    riskFactors: [
      { field: 'stability', operator: '<', value: 46, label: 'impasses parlamentares crônicos', multiplier: 1.45 },
      { field: 'trust', operator: '<', value: 46, label: 'descrédito geral na capacidade de decisão da cidade', multiplier: 1.35 }
    ],
    effects: { stability: -6, trust: -5, infrastructure: -4, economy: -3 },
    explanation: 'A tentativa de governar apenas pela negociação de cargos desprovida de convicções gerou o colapso do pacto governamental diante da primeira crise séria.'
  }
];
