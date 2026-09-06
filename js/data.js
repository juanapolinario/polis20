/**
 * Horizontes Cívicos - Base de Dados e Configuração do Universo
 * Centraliza nomes, arquétipos políticos, geografias, especializações e eventos narrativos.
 */

// 12 Indicadores centrais de 0 a 100
export const INDICATOR_DEFS = {
  economy: {
    key: 'economy',
    name: 'Economia',
    shortDesc: 'Atividade comercial, atração de investimentos e dinamismo produtivo.',
    icon: 'chart'
  },
  jobs: {
    key: 'jobs',
    name: 'Empregos',
    shortDesc: 'Disponibilidade de vagas, dinamismo do mercado de trabalho e renda.',
    icon: 'briefcase'
  },
  safety: {
    key: 'safety',
    name: 'Segurança',
    shortDesc: 'Prevenção à criminalidade, integridade física e sensação de paz civil.',
    icon: 'shield'
  },
  health: {
    key: 'health',
    name: 'Saúde',
    shortDesc: 'Acesso a atendimento médico, saneamento e bem-estar físico da população.',
    icon: 'heart'
  },
  education: {
    key: 'education',
    name: 'Educação',
    shortDesc: 'Qualidade do ensino, formação profissional e polos de pesquisa.',
    icon: 'book'
  },
  housing: {
    key: 'housing',
    name: 'Moradia Acessível',
    shortDesc: 'Facilidade de encontrar habitação a preços compatíveis com a renda média.',
    icon: 'home'
  },
  equality: {
    key: 'equality',
    name: 'Igualdade',
    shortDesc: 'Distribuição equitativa de oportunidades e moderação nas disparidades.',
    icon: 'scale'
  },
  infrastructure: {
    key: 'infrastructure',
    name: 'Infraestrutura',
    shortDesc: 'Malha de transportes, redes elétricas, saneamento e comunicações.',
    icon: 'truck'
  },
  environment: {
    key: 'environment',
    name: 'Meio Ambiente',
    shortDesc: 'Qualidade do ar e das águas, preservação de áreas verdes e sustentabilidade.',
    icon: 'leaf'
  },
  personalFreedom: {
    key: 'personalFreedom',
    name: 'Liberdade Pessoal',
    shortDesc: 'Autonomia individual, pluralismo de modos de vida e expressão civil.',
    icon: 'user'
  },
  stability: {
    key: 'stability',
    name: 'Estabilidade Política',
    shortDesc: 'Previsibilidade institucional, continuidade jurídica e ausência de tumultos.',
    icon: 'anchor'
  },
  trust: {
    key: 'trust',
    name: 'Confiança Pública',
    shortDesc: 'Crença mútua entre cidadãos e legitimidade percebida nas instituições.',
    icon: 'users'
  }
};

// 5 Arquétipos Políticos de Referência (Diagrama de Nolan)
export const POLITICAL_ARCHETYPES = {
  libertarian: {
    id: 'libertarian',
    name: 'Libertária',
    center: { econ: 80, personal: 80 },
    description: 'Elevada liberdade de mercado e forte autonomia civil individual.',
    summary: 'Estimula investimentos e pluralismo cultural, exigindo atenção à coesão comunitária e à moradia.',
    badgeClass: 'badge-libertarian'
  },
  conservative: {
    id: 'conservative',
    name: 'Conservadora',
    center: { econ: 80, personal: 20 },
    description: 'Elevada liberdade de mercado com ênfase em ordem moral e disciplina cívica.',
    summary: 'Busca dinamismo empresarial e rigor na segurança, equilibrando controle normativo e expressão individual.',
    badgeClass: 'badge-conservative'
  },
  progressive: {
    id: 'progressive',
    name: 'Progressista',
    center: { econ: 20, personal: 80 },
    description: 'Coordenação e regulação econômica associadas a ampla liberdade de costumes e expressão.',
    summary: 'Prioriza serviços públicos universais, redistribuição e diversidade cultural, com atenção à eficiência regulatória.',
    badgeClass: 'badge-progressive'
  },
  statist: {
    id: 'statist',
    name: 'Estatista',
    center: { econ: 20, personal: 20 },
    description: 'Planejamento centralizado e forte regulação estatal da vida econômica e dos costumes.',
    summary: 'Prioriza disciplina coletiva e grandes projetos governamentais, com desafios em dinamismo espontâneo e pluralismo.',
    badgeClass: 'badge-statist'
  },
  centrist: {
    id: 'centrist',
    name: 'Centrista',
    center: { econ: 50, personal: 50 },
    description: 'Equilíbrio pragmático entre iniciativa privada, regulação pública e garantias civis.',
    summary: 'Busca moderação e amortecimento de crises, podendo enfrentar lentidão na tomada de decisões e indefinição de foco.',
    badgeClass: 'badge-centrist'
  }
};

// Determina o arquétipo mais próximo com base na distância euclidiana ponderada
export function classifyPolitics(econ, personal) {
  let closest = 'centrist';
  let minDistance = Infinity;

  // Se estiver num raio pequeno do centro (ex: raio <= 18), prioriza classificação centrista
  const distCenter = Math.hypot(econ - 50, personal - 50);
  if (distCenter <= 18) {
    return POLITICAL_ARCHETYPES.centrist;
  }

  for (const [key, archetype] of Object.entries(POLITICAL_ARCHETYPES)) {
    const d = Math.hypot(econ - archetype.center.econ, personal - archetype.center.personal);
    if (d < minDistance) {
      minDistance = d;
      closest = key;
    }
  }
  return POLITICAL_ARCHETYPES[closest];
}

// 8 Tipos de Geografia
export const GEOGRAPHIES = [
  {
    id: 'litoral',
    name: 'Litoral',
    description: 'Cidade costeira aberta ao comércio marítimo, pesca e brisas oceânicas.',
    modifiers: { economy: +3, environment: +2, housing: -2 }
  },
  {
    id: 'margem_rio',
    name: 'Margem de Rio',
    description: 'Cidade fluvial fértil, com transporte hidroviário e planícies aluviais.',
    modifiers: { infrastructure: +2, environment: +2, jobs: +1 }
  },
  {
    id: 'planalto',
    name: 'Planalto',
    description: 'Região elevada de clima ameno, topografia favorável à expansão urbana.',
    modifiers: { housing: +3, infrastructure: +2, stability: +1 }
  },
  {
    id: 'vale',
    name: 'Vale',
    description: 'Enclave protegido entre montanhas, com recursos concentrados e microclima próprio.',
    modifiers: { safety: +2, environment: -1, trust: +2 }
  },
  {
    id: 'arida',
    name: 'Região Árida',
    description: 'Clima seco e ensolarado que exige engenharias avançadas para gestão hídrica.',
    modifiers: { environment: -3, infrastructure: -1, economy: +1 }
  },
  {
    id: 'floresta',
    name: 'Fronteira de Floresta',
    description: 'Vizinha a biomas exuberantes, rica em biodiversidade e sob constantes tensões de preservação.',
    modifiers: { environment: +5, infrastructure: -2, health: +2 }
  },
  {
    id: 'arquipelago',
    name: 'Arquipélago',
    description: 'Conjunto de ilhas com cultura náutica singular e logística marítima descentralizada.',
    modifiers: { personalFreedom: +3, infrastructure: -3, housing: -2 }
  },
  {
    id: 'montanhosa',
    name: 'Região Montanhosa',
    description: 'Relevo íngreme e encostas rochosas, dotada de recursos minerais e defesas naturais.',
    modifiers: { safety: +3, infrastructure: -3, housing: -2 }
  }
];

// 10 Especializações Econômicas
export const SPECIALIZATIONS = [
  {
    id: 'industria',
    name: 'Indústria',
    description: 'Fábricas e complexos de transformação que geram empregos formais e manufatura.',
    modifiers: { jobs: +4, economy: +3, environment: -4 }
  },
  {
    id: 'tecnologia',
    name: 'Tecnologia',
    description: 'Polo de inovação de software, semicondutores e automação de ponta.',
    modifiers: { economy: +4, education: +3, housing: -3 }
  },
  {
    id: 'universidade',
    name: 'Universidade',
    description: 'Centro de conhecimento, pesquisa acadêmica, formação contínua e vida estudantil.',
    modifiers: { education: +6, personalFreedom: +3, jobs: +1 }
  },
  {
    id: 'turismo',
    name: 'Turismo',
    description: 'Acolhimento de visitantes atraídos pela gastronomia, paisagens e hospitalidade.',
    modifiers: { economy: +2, housing: -3, safety: +1 }
  },
  {
    id: 'agricultura',
    name: 'Agricultura',
    description: 'Cinturão agrícola de alta produtividade que abastece a segurança alimentar.',
    modifiers: { equality: +3, environment: +2, housing: +3 }
  },
  {
    id: 'porto_logistica',
    name: 'Porto e Logística',
    description: 'Centro de conexão e escoamento de cargas para todo o comércio do continente.',
    modifiers: { infrastructure: +4, economy: +3, safety: -1 }
  },
  {
    id: 'financas',
    name: 'Finanças',
    description: 'Mercados de capitais, seguradoras e sedes de bancos multinacionais.',
    modifiers: { economy: +5, equality: -4, housing: -4 }
  },
  {
    id: 'administracao_publica',
    name: 'Administração Pública',
    description: 'Centro de formulação de políticas, repartições públicas e burocracia técnica.',
    modifiers: { stability: +4, trust: +2, economy: -1 }
  },
  {
    id: 'mineracao',
    name: 'Mineração',
    description: 'Extração mineral estratégica geradora de divisas e forte impacto paisagístico.',
    modifiers: { economy: +4, jobs: +3, environment: -5 }
  },
  {
    id: 'artes_cultura',
    name: 'Artes e Cultura',
    description: 'Teatros, museus, ateliês e vida boêmia que alimentam a expressão humana.',
    modifiers: { personalFreedom: +5, trust: +3, equality: +2 }
  }
];

// Pelo menos 40 nomes fictícios para cidades
export const CITY_NAMES_POOL = [
  'Porto Aurora', 'Nova Alvorada', 'Montevêneto', 'Cidadela do Sol', 'Vale Sereno',
  'Belmonte do Sul', 'Rio Claro', 'Santa Brisa', 'Vila dos Ventos', 'Costa Esmeralda',
  'Ponte Nova', 'Altamira', 'Mirante Azul', 'Esperança Velha', 'Campos Dourados',
  'Vila Harmonia', 'Pedra Fundamental', 'Baía das Garças', 'Castelo Alto', 'São Sebastião da Serra',
  'Mar do Norte', 'Ilha da Paz', 'Vila Verde', 'Serrania', 'Vale dos Pinheiros',
  'Primavera do Oeste', 'Florianense', 'Vila Real', 'Estrela Polar', 'Serra Dourada',
  'Colina Serena', 'Novo Horizonte', 'Foz do Lago', 'Planura', 'Mata Atlântica',
  'Águas Profundas', 'Porto Esperança', 'Horizonte Belo', 'Enseada Nova', 'Vila Progresso',
  'Nova Cantábria', 'Rochedo', 'Terra Alta', 'Campina Branca', 'Bela Vista da Mata'
];

// Banco com 32 Acontecimentos Detalhados em 11 Categorias
export const EVENTS_DATABASE = [
  // 1. ECONOMIA
  {
    id: 'empresa_investimento',
    category: 'economia',
    title: 'Aporte de Grande Conglomerado',
    narrative: 'Um grupo multinacional inaugurou um polo de operações na cidade, contratando milhares de residentes.',
    weight: 12,
    conditions: { minEcon: 30 },
    effects: { economy: +5, jobs: +6, housing: -3 },
    ethicalModifiers: (city) => {
      // Em alta liberdade econômica, atração mais forte com mais pressão imobiliária
      if (city.econFreedom > 60) return { economy: +2, housing: -2 };
      // Em baixa liberdade econômica, mais contrapartidas sociais
      if (city.econFreedom < 40) return { equality: +2, jobs: -1 };
      return {};
    },
    explanation: 'A abertura do polo impulsionou a renda e a contratação local, mas aqueceu a demanda por imóveis.'
  },
  {
    id: 'fechamento_fabrica',
    category: 'economia',
    title: 'Encerramento de Planta Industrial',
    narrative: 'A reestruturação de uma tradicional fábrica local levou ao corte de centenas de postos de trabalho.',
    weight: 10,
    conditions: { maxJobs: 75 },
    effects: { economy: -4, jobs: -7, trust: -3 },
    ethicalModifiers: (city) => {
      if (city.econFreedom < 40) return { stability: -2 }; // maior expectativa sobre garantias estatais
      return {};
    },
    explanation: 'O fechamento abalou a renda das famílias do setor secundário e reduziu a arrecadação da cidade.'
  },
  {
    id: 'acordo_comercial_regional',
    category: 'economia',
    title: 'Corredor de Comércio Livre',
    narrative: 'Pacto de facilitação aduaneira e logística conectou a cidade a novos centros de distribuição vizinhos.',
    weight: 10,
    conditions: { minInfrastructure: 40 },
    effects: { economy: +4, infrastructure: +3, jobs: +3 },
    ethicalModifiers: (city) => {
      if (city.econFreedom > 50) return { economy: +2 };
      return {};
    },
    explanation: 'Reduções de atrito logístico permitiram exportações mais ágeis e novos postos na cadeia de suprimentos.'
  },

  // 2. SEGURANÇA
  {
    id: 'programa_policiamento_comunitario',
    category: 'segurança',
    title: 'Pacto de Policiamento de Proximidade',
    narrative: 'Base móvel e conselhos populares de segurança foram integrados para pacificar bairros conturbados.',
    weight: 11,
    conditions: { minTrust: 30 },
    effects: { safety: +6, trust: +4, personalFreedom: +2 },
    ethicalModifiers: (city) => {
      if (city.civicFreedom > 60) return { trust: +3 };
      return {};
    },
    explanation: 'O diálogo entre forças policiais e lideranças de bairro reduziu a delinquência e aumentou a sensação de segurança.'
  },
  {
    id: 'onda_de_crimes',
    category: 'segurança',
    title: 'Surto de Roubos e Furtos',
    narrative: 'Quadrilhas organizadas intensificaram delitos patrimoniais em eixos comerciais movimentados.',
    weight: 10,
    conditions: { maxSafety: 55 },
    effects: { safety: -6, trust: -4, economy: -2 },
    ethicalModifiers: (city) => {
      if (city.civicFreedom < 40) return { stability: -2 }; // cobrança rígida por autoridade
      return {};
    },
    explanation: 'A insegurança espantou clientes do comércio noturno e desgastou a confiança nos órgãos de patrulhamento.'
  },
  {
    id: 'abuso_autoridade',
    category: 'segurança',
    title: 'Escândalo de Força Desmedida',
    narrative: 'Vídeos de excesso policial durante abordagem viralizaram e causaram revolta na sociedade civil.',
    weight: 9,
    conditions: { maxCivicFreedom: 60 },
    effects: { trust: -6, stability: -5, personalFreedom: -3 },
    ethicalModifiers: (city) => {
      if (city.civicFreedom > 50) return { stability: -3 }; // protestos mais intensos
      return {};
    },
    explanation: 'A divulgação da conduta arbitrária minou a credibilidade das instituições e gerou vigílias públicas.'
  },

  // 3. SAÚDE
  {
    id: 'avanco_medico_regional',
    category: 'saúde',
    title: 'Inovação em Tratamentos Preventivos',
    narrative: 'Uma força-tarefa de clínicas e universidades implantou uma rede avançada de rastreio de doenças crônicas.',
    weight: 10,
    conditions: { minEducation: 35 },
    effects: { health: +7, trust: +3, equality: +2 },
    ethicalModifiers: (city) => {
      if (city.econFreedom < 45) return { health: +2, equality: +2 };
      return {};
    },
    explanation: 'Diagnósticos precoces desafogaram leitos de alta complexidade e elevaram o bem-estar comunitário.'
  },
  {
    id: 'hospital_sobrecarregado',
    category: 'saúde',
    title: 'Saturação de Pronto-Socorros',
    narrative: 'Um pico sazonal de infecções respiratórias gerou filas longas e escassez de insumos nos prontos-atendimentos.',
    weight: 11,
    conditions: { maxHealth: 60 },
    effects: { health: -6, trust: -4, jobs: -1 },
    ethicalModifiers: (city) => {
      return {};
    },
    explanation: 'O esgotamento temporário das equipes ampliou o absenteísmo profissional e irritou os cidadãos.'
  },

  // 4. EDUCAÇÃO
  {
    id: 'reforma_curricular_moderna',
    category: 'educação',
    title: 'Atualização Tecnológica das Escolas',
    narrative: 'Laboratórios práticos, reforço em ciências exatas e formação pedagógica foram integrados às salas de aula.',
    weight: 10,
    conditions: { minEconomy: 35 },
    effects: { education: +6, jobs: +3, trust: +2 },
    ethicalModifiers: (city) => {
      if (city.econFreedom > 60) return { economy: +2 };
      if (city.civicFreedom > 60) return { personalFreedom: +2 };
      return {};
    },
    explanation: 'A qualificação do ensino fundamental preparou melhor os jovens para o mercado e a cidadania.'
  },
  {
    id: 'fuga_de_cerebros',
    category: 'educação',
    title: 'Evasão de Especialistas e Cientistas',
    narrative: 'Pesquisadores e docentes qualificados migraram em busca de remunerações e bolsas mais atrativas em outros polos.',
    weight: 9,
    conditions: { maxEconomy: 50, minEducation: 45 },
    effects: { education: -5, economy: -3, jobs: -2 },
    ethicalModifiers: (city) => {
      return {};
    },
    explanation: 'A perda de quadros técnicos atrasou projetos de pesquisa e empobreceu o ambiente acadêmico local.'
  },

  // 5. HABITAÇÃO
  {
    id: 'bolha_imobiliaria',
    category: 'habitação',
    title: 'Escalada Acentuada dos Aluguéis',
    narrative: 'A especulação em áreas nobres e a chegada de novos investidores elevaram os valores locatícios a patamares recordes.',
    weight: 12,
    conditions: { minEconomy: 55, maxHousing: 65 },
    effects: { housing: -8, equality: -4, trust: -3 },
    ethicalModifiers: (city) => {
      if (city.econFreedom > 60) return { economy: +2, housing: -3 };
      if (city.econFreedom < 40) return { stability: -2 };
      return {};
    },
    explanation: 'Famílias de renda média e baixa tiveram de destinar parcelas maiores de seus ganhos apenas para morar.'
  },
  {
    id: 'programa_bairro_acessivel',
    category: 'habitação',
    title: 'Empreendimentos de Moradia Popular',
    narrative: 'Parcerias com cooperativas e incentivos tributários permitiram a entrega de milhares de apartamentos populares.',
    weight: 11,
    conditions: { minInfrastructure: 35 },
    effects: { housing: +7, equality: +4, trust: +3 },
    ethicalModifiers: (city) => {
      if (city.econFreedom < 50) return { equality: +3 };
      return {};
    },
    explanation: 'A nova oferta residencial facilitou a fixação de trabalhadores perto de eixos de transporte.'
  },

  // 6. POLÍTICA
  {
    id: 'descoberta_corrupcao',
    category: 'política',
    title: 'Investigação Revela Esquema de Propinas',
    narrative: 'Auditorias apontaram fraudes em licitações e desvios milionários em contratos de fornecimento público.',
    weight: 11,
    conditions: { maxTrust: 65 },
    effects: { trust: -8, stability: -5, equality: -3 },
    ethicalModifiers: (city) => {
      if (city.econFreedom < 40) return { trust: -3 }; // maior revolta com monopólios estatais
      return {};
    },
    explanation: 'A exposição de negociatas abalou a credibilidade das lideranças e aumentou a apatia civil.'
  },
  {
    id: 'reforma_desburocratizadora',
    category: 'política',
    title: 'Pacto de Simplificação Cívica',
    narrative: 'Eliminação de taxas redundantes, digitalização de protocolos e redução de exigências de cartório.',
    weight: 10,
    conditions: { minStability: 40 },
    effects: { economy: +4, trust: +4, personalFreedom: +3 },
    ethicalModifiers: (city) => {
      if (city.econFreedom > 50) return { economy: +3 };
      return {};
    },
    explanation: 'Cidadãos e pequenos comerciantes economizaram tempo e custos ao emitir alvarás e resolver pendências.'
  },
  {
    id: 'manifestacao_popular',
    category: 'política',
    title: 'Marcha Cívica por Melhores Serviços',
    narrative: 'Milhares de cidadãos ocuparam praças e bulevares exigindo transparência, transporte digno e saneamento.',
    weight: 11,
    conditions: { maxStability: 60, minCivicFreedom: 35 },
    effects: { stability: -4, personalFreedom: +2, trust: -2 },
    ethicalModifiers: (city) => {
      // Alta liberdade pessoal acolhe o protesto; baixa liberdade pessoal gera tensão
      if (city.civicFreedom > 60) return { stability: -2, trust: +2 };
      if (city.civicFreedom < 40) return { stability: -6, trust: -4 };
      return {};
    },
    explanation: 'A pressão das ruas colocou demandas prioritárias na agenda pública, provocando atritos temporários no trânsito.'
  },

  // 7. CULTURA
  {
    id: 'festival_artes_rua',
    category: 'cultura',
    title: 'Circuito Cultural a Céu Aberto',
    narrative: 'Mostras de teatro, murais urbanos e feiras gastronômicas mobilizaram praças históricas durante semanas.',
    weight: 10,
    conditions: { minCivicFreedom: 40 },
    effects: { personalFreedom: +6, trust: +4, economy: +2 },
    ethicalModifiers: (city) => {
      if (city.civicFreedom > 60) return { personalFreedom: +3 };
      return {};
    },
    explanation: 'A ocupação criativa dos espaços públicos fortaleceu o convívio comunitário e gerou receitas para o comércio de rua.'
  },
  {
    id: 'censura_exposicao',
    category: 'cultura',
    title: 'Interdição de Galeria por Motivos Morais',
    narrative: 'Autoridades cancelaram uma exposição artística sob alegação de ofensa aos costumes tradicionais.',
    weight: 8,
    conditions: { maxCivicFreedom: 45 },
    effects: { personalFreedom: -7, stability: +1, trust: -4 },
    ethicalModifiers: (city) => {
      if (city.civicFreedom < 30) return { stability: +3 }; // base aprova
      return {};
    },
    explanation: 'A censura gerou indignação entre produtores culturais e dividiu a opinião dos moradores sobre limites da liberdade.'
  },

  // 8. MEIO AMBIENTE
  {
    id: 'criacao_parque_linear',
    category: 'meio ambiente',
    title: 'Inauguração de Parque Ecológico Linear',
    narrative: 'Antiga faixa degradada ao longo de canais foi revitalizada com ciclovias, bosques nativos e jardins de chuva.',
    weight: 11,
    conditions: { minInfrastructure: 30 },
    effects: { environment: +8, health: +4, personalFreedom: +2 },
    ethicalModifiers: (city) => {
      if (city.econFreedom < 50) return { equality: +2 };
      return {};
    },
    explanation: 'A ampliação de áreas verdes reduziu ilhas de calor e forneceu um espaço democrático de lazer e exercícios.'
  },
  {
    id: 'vazamento_industrial',
    category: 'meio ambiente',
    title: 'Contaminação de Manancial por Resíduos',
    narrative: 'Danos em reservatórios industriais despejaram efluentes tóxicos em afluentes vitais para o abastecimento.',
    weight: 9,
    conditions: { maxEnvironment: 65 },
    effects: { environment: -8, health: -5, trust: -4 },
    ethicalModifiers: (city) => {
      if (city.econFreedom > 60) return { trust: -3 }; // acusação de frouxidão regulatória
      return {};
    },
    explanation: 'A interrupção preventiva de captação de água forçou racionamentos e gerou multas pesadas aos operadores.'
  },
  {
    id: 'estiagem_severa',
    category: 'meio ambiente',
    title: 'Seca Prolongada Atinge Represas',
    narrative: 'Meses sem chuvas volumosas baixaram o nível das bacias hidrográficas a níveis de alerta extremo.',
    weight: 10,
    conditions: {},
    effects: { environment: -5, economy: -3, health: -2 },
    ethicalModifiers: (city) => {
      return {};
    },
    explanation: 'A escassez hídrica encareceu a energia, prejudicou o cultivo e exigiu campanhas de moderação no consumo.'
  },

  // 9. TECNOLOGIA
  {
    id: 'polo_energia_renovavel',
    category: 'tecnologia',
    title: 'Instalação de Fazenda Solar e Eólica',
    narrative: 'Consórcios privados e incentivos municipais ergueram um grande complexo de geração limpa e baterias.',
    weight: 10,
    conditions: { minEconomy: 40 },
    effects: { environment: +5, infrastructure: +5, economy: +3 },
    ethicalModifiers: (city) => {
      if (city.econFreedom > 50) return { economy: +2 };
      return {};
    },
    explanation: 'A matriz elétrica diversificada reduziu os custos de eletricidade e atraiu empresas com metas sustentáveis.'
  },
  {
    id: 'polo_startups_ia',
    category: 'tecnologia',
    title: 'Florescimento de Incubadoras de Software',
    narrative: 'Espaços de coworking e incentivos a patentes atraíram jovens desenvolvedores e capitais de risco.',
    weight: 10,
    conditions: { minEducation: 45, minEconomy: 40 },
    effects: { economy: +5, jobs: +4, education: +2 },
    ethicalModifiers: (city) => {
      if (city.econFreedom > 60) return { economy: +3 };
      return {};
    },
    explanation: 'Novas empresas de base tecnológica geraram postos altamente remunerados e dinamizaram a economia de serviços.'
  },

  // 10. MIGRAÇÃO
  {
    id: 'fluxo_migratorio_positivo',
    category: 'migração',
    title: 'Onda de Novos Residentes Qualificados',
    narrative: 'A boa reputação da cidade atraiu trabalhadores de cidades vizinhas em busca de melhores oportunidades.',
    weight: 12,
    conditions: { minEconomy: 50, minSafety: 50 },
    effects: { jobs: +3, economy: +3, housing: -4 },
    ethicalModifiers: (city) => {
      if (city.civicFreedom > 60) return { personalFreedom: +2, trust: +1 };
      if (city.civicFreedom < 40) return { stability: -2 }; // atritos xenofóbicos
      return {};
    },
    explanation: 'A chegada de novos talentos oxigenou a força de trabalho, embora tenha elevado a concorrência por aluguéis.'
  },
  {
    id: 'emigracao_por_desalento',
    category: 'migração',
    title: 'Jovens Deixam a Cidade em Busca de Oportunidades',
    narrative: 'Falta de perspectivas profissionais e custo de vida adverso estimularam a saída de graduados recentes.',
    weight: 10,
    conditions: { maxEconomy: 45, maxJobs: 45 },
    effects: { economy: -3, jobs: +1, housing: +3 },
    ethicalModifiers: (city) => {
      return {};
    },
    explanation: 'O esvaziamento de mão de obra jovem aliviou a procura por imóveis, mas reduziu o vigor do comércio local.'
  },

  // 11. ACONTECIMENTOS GLOBAIS
  {
    id: 'global_alta_commodities',
    category: 'global',
    title: 'Choque Internacional de Preços de Insumos',
    narrative: 'Oscilações geopolíticas globais elevaram os preços de energia, alimentos e matérias-primas básicas.',
    weight: 8,
    isGlobal: true,
    effects: { economy: -3, housing: -2, equality: -2 },
    ethicalModifiers: (city) => {
      // Cidades industriais ou exportadoras podem lidar diferente
      if (city.specialization === 'agricultura' || city.specialization === 'mineracao') {
        return { economy: +5, jobs: +3 };
      }
      return {};
    },
    explanation: 'A inflação de custos importados pressionou o orçamento das famílias e elevou custos operacionais em quase todo o mundo.'
  },
  {
    id: 'global_epidemia_regional',
    category: 'global',
    title: 'Alerta Sanitário Continental',
    narrative: 'Uma nova cepa viral de transmissão rápida colocou em prontidão os sistemas de vigilância epidemiológica do continente.',
    weight: 7,
    isGlobal: true,
    effects: { health: -5, economy: -3, stability: -2 },
    ethicalModifiers: (city) => {
      // Cidades com alta saúde mitigam
      if (city.health > 70) return { health: +3, stability: +1 };
      return {};
    },
    explanation: 'Restrições preventivas de circulação e precauções sanitárias reduziram viagens e testaram a capacidade hospitalar.'
  },
  {
    id: 'global_salto_produtividade',
    category: 'global',
    title: 'Revolução Global de Produtividade Digital',
    narrative: 'Softwares de automação aberta e novos protocolos globais de dados aceleraram processos produtivos em rede.',
    weight: 8,
    isGlobal: true,
    effects: { economy: +4, infrastructure: +3, jobs: -1 },
    ethicalModifiers: (city) => {
      if (city.specialization === 'tecnologia' || city.specialization === 'universidade') {
        return { economy: +4, jobs: +2 };
      }
      return {};
    },
    explanation: 'A difusão de novas ferramentas aumentou a eficiência de empresas e governos, exigindo requalificação profissional.'
  },
  {
    id: 'global_acordo_climatico',
    category: 'global',
    title: 'Tratado Continental de Descarbonização',
    narrative: 'Um pacto entre nações estabeleceu metas e fundos para restauração florestal e energia limpa.',
    weight: 7,
    isGlobal: true,
    effects: { environment: +4, infrastructure: +2, economy: -1 },
    ethicalModifiers: (city) => {
      if (city.specialization === 'industria' || city.specialization === 'mineracao') {
        return { economy: -3 }; // custos de conformidade
      }
      return {};
    },
    explanation: 'Novas exigências ambientais impulsionaram investimentos verdes, exigindo adaptação de setores pesados.'
  },

  // Eventos Adicionais para Enriquecimento Cívico
  {
    id: 'patrimonio_historico_tombado',
    category: 'cultura',
    title: 'Restauração de Casario Histórico',
    narrative: 'Um projeto de incentivo patrimonial recuperou fachadas e largos antigos, atraindo ateliês e cafeterias.',
    weight: 9,
    conditions: { minCivicFreedom: 35 },
    effects: { personalFreedom: +4, trust: +3, economy: +2 },
    ethicalModifiers: (city) => {
      if (city.specialization === 'turismo' || city.specialization === 'artes_cultura') {
        return { economy: +3, personalFreedom: +2 };
      }
      return {};
    },
    explanation: 'A valorização da memória arquitetônica fortaleceu a identidade local e dinamizou a vida dos bairros centrais.'
  },
  {
    id: 'orcamento_participativo',
    category: 'política',
    title: 'Conselhos Cívicos de Orçamento de Bairro',
    narrative: 'Plenárias populares deliberaram sobre prioridades locais de pavimentação, praças e creches.',
    weight: 10,
    conditions: { minCivicFreedom: 40 },
    effects: { trust: +6, equality: +4, personalFreedom: +3 },
    ethicalModifiers: (city) => {
      if (city.civicFreedom > 60) return { trust: +2, stability: +2 };
      return {};
    },
    explanation: 'A participação direta dos moradores na alocação de recursos aumentou a coesão social e a transparência pública.'
  },
  {
    id: 'infovia_digital_conectividade',
    category: 'tecnologia',
    title: 'Conclusão da Infovia Municipal de Fibra Óptica',
    narrative: 'Rede de dados de altíssima velocidade interligou escolas, postos de saúde e distritos empresariais.',
    weight: 11,
    conditions: { minInfrastructure: 35 },
    effects: { infrastructure: +6, economy: +3, education: +3 },
    ethicalModifiers: (city) => {
      if (city.econFreedom > 50) return { economy: +2 };
      return {};
    },
    explanation: 'A redução dos gargalos de conexão aumentou a eficiência dos serviços públicos e a produtividade comercial.'
  },
  {
    id: 'retrofit_habitacional_central',
    category: 'habitação',
    title: 'Retrofit e Ocupação de Prédios Centrais',
    narrative: 'Incentivos fiscais e readequação de normas permitiram a conversão de imóveis comerciais ociosos em moradia digna.',
    weight: 10,
    conditions: { minInfrastructure: 40, maxHousing: 70 },
    effects: { housing: +6, equality: +3, environment: +2 },
    ethicalModifiers: (city) => {
      if (city.econFreedom < 50) return { equality: +2 };
      return {};
    },
    explanation: 'A aproximação entre moradia e locais de trabalho reduziu os deslocamentos diários e aliviou os custos de habitação.'
  }
];

// Gera cidades iniciais garantindo pelo menos 3 cidades em cada um dos 5 arquétipos
export function generateInitialCities(playerCityName, playerEcon, playerPersonal, rng) {
  const cities = [];
  const names = rng.shuffle(CITY_NAMES_POOL);
  const geometries = [...GEOGRAPHIES];
  const specializations = [...SPECIALIZATIONS];

  // 5 arquétipos: queremos pelo menos 3 cidades em cada um para garantir pluralidade no mundo
  // Arquétipos: libertária, conservadora, progressista, estatista, centrista
  const targetArchetypes = [
    { econ: [70, 90], personal: [70, 90], type: 'libertarian' },
    { econ: [70, 90], personal: [10, 30], type: 'conservative' },
    { econ: [10, 30], personal: [70, 90], type: 'progressive' },
    { econ: [10, 30], personal: [10, 30], type: 'statist' },
    { econ: [42, 58], personal: [42, 58], type: 'centrist' }
  ];

  // A cidade do jogador é a primeira (id: 0)
  const playerGeo = rng.choice(geometries);
  const playerSpec = rng.choice(specializations);
  
  cities.push(createCityObject(
    0,
    playerCityName || 'Nova Esperança',
    playerEcon,
    playerPersonal,
    playerGeo,
    playerSpec,
    rng.rangeInt(180000, 750000),
    { x: rng.rangeInt(200, 800), y: rng.rangeInt(200, 800) },
    rng,
    true // isPlayerCity
  ));

  // Agora vamos gerar as outras 19 cidades
  // Garantimos 3 de cada um dos 5 arquétipos = 15 cidades, e as 4 restantes distribuídas livremente
  const archetypeDistribution = [
    targetArchetypes[0], targetArchetypes[0], targetArchetypes[0],
    targetArchetypes[1], targetArchetypes[1], targetArchetypes[1],
    targetArchetypes[2], targetArchetypes[2], targetArchetypes[2],
    targetArchetypes[3], targetArchetypes[3], targetArchetypes[3],
    targetArchetypes[4], targetArchetypes[4], targetArchetypes[4],
    // 4 adicionais
    rng.choice(targetArchetypes),
    rng.choice(targetArchetypes),
    rng.choice(targetArchetypes),
    rng.choice(targetArchetypes)
  ];

  for (let i = 1; i <= 19; i++) {
    const cityName = names[i - 1] || `Cidade ${i + 1}`;
    const target = archetypeDistribution[i - 1];
    
    // Gera coordenadas com pequeno jitter dentro da faixa alvo
    const econ = rng.range(target.econ[0], target.econ[1]);
    const personal = rng.range(target.personal[0], target.personal[1]);
    
    const geo = geometries[(i - 1) % geometries.length];
    const spec = specializations[(i - 1) % specializations.length];
    
    // População inicial plausível entre 60.000 e 950.000
    const population = rng.rangeInt(65000, 920000);
    
    // Coordenadas cartográficas no mapa 1000x800 com margem
    const mapPos = {
      x: rng.rangeInt(80, 920),
      y: rng.rangeInt(80, 720)
    };

    cities.push(createCityObject(
      i,
      cityName,
      econ,
      personal,
      geo,
      spec,
      population,
      mapPos,
      rng,
      false
    ));
  }

  return cities;
}

// Cria um objeto de cidade com todos os 12 indicadores coerentes e limites respeitados
function createCityObject(id, name, econFreedom, personalFreedom, geography, specialization, population, mapPos, rng, isPlayerCity) {
  // Clampa as coordenadas éticas
  const clampedEcon = Math.min(Math.max(econFreedom, 0), 100);
  const clampedPersonal = Math.min(Math.max(personalFreedom, 0), 100);

  // Baseline médio de 50 para os indicadores, com modesta influência da ética, geografia e especialização
  // Mais um ruído sutil de ±4 para que as cidades não comecem idênticas
  const noise = () => rng.range(-4, 4);

  // Influências éticas moderadas no início
  const initialIndicators = {
    // Liberdade econômica tende a dar ligeira vantagem em economia e investimento, mas reduz moradia acessível e igualdade
    economy: 50 + (clampedEcon - 50) * 0.22 + noise(),
    jobs: 50 + (clampedEcon - 50) * 0.18 + noise(),
    housing: 50 - (clampedEcon - 50) * 0.18 + noise(),
    equality: 50 - (clampedEcon - 50) * 0.22 + noise(),

    // Liberdade pessoal tende a favorecer pluralismo e artes, com segurança e estabilidade variando conforme instituições
    personalFreedom: clampedPersonal, // A liberdade pessoal praticada reflete de perto a ética pessoal da cidade
    safety: 50 - (clampedPersonal - 50) * 0.08 + noise(), // em cidades com muita liberdade de expressão, conflitos são mais visíveis
    stability: 50 - Math.abs(clampedPersonal - 50) * 0.06 + noise(), // extremos podem ter tensões
    trust: 50 + (clampedPersonal - 50) * 0.12 - Math.abs(clampedEcon - 50) * 0.06 + noise(),

    // Serviços universais têm leve favorecimento por coordenação pública ou riqueza econômica
    health: 50 + noise(),
    education: 50 + noise(),
    infrastructure: 50 + noise(),
    environment: 50 + noise()
  };

  // Aplica modificadores da geografia
  if (geography && geography.modifiers) {
    for (const [key, mod] of Object.entries(geography.modifiers)) {
      if (initialIndicators[key] !== undefined) {
        initialIndicators[key] += mod;
      }
    }
  }

  // Aplica modificadores da especialização
  if (specialization && specialization.modifiers) {
    for (const [key, mod] of Object.entries(specialization.modifiers)) {
      if (initialIndicators[key] !== undefined) {
        initialIndicators[key] += mod;
      }
    }
  }

  // Clampa todos os indicadores entre 5 e 95 no início
  for (const key of Object.keys(initialIndicators)) {
    initialIndicators[key] = Math.min(Math.max(Math.round(initialIndicators[key]), 10), 90);
  }

  // Tendências iniciais (0 = estável)
  const trends = {};
  for (const key of Object.keys(initialIndicators)) {
    trends[key] = 0;
  }

  const archetype = classifyPolitics(clampedEcon, clampedPersonal);

  // Calcula custo de vida inicial baseado em economia, moradia e população
  const costOfLiving = Math.round(
    Math.min(Math.max((initialIndicators.economy * 0.45) + ((100 - initialIndicators.housing) * 0.45) + (population / 50000), 20), 95)
  );

  return {
    id,
    name,
    isPlayerCity: !!isPlayerCity,
    econFreedom: Math.round(clampedEcon),
    civicFreedom: Math.round(clampedPersonal),
    archetypeId: archetype.id,
    archetypeName: archetype.name,
    geographyId: geography.id,
    geographyName: geography.name,
    geographyDesc: geography.description,
    specializationId: specialization.id,
    specializationName: specialization.name,
    specializationDesc: specialization.description,
    population,
    populationGrowth: 0,
    costOfLiving,
    mapPos,
    indicators: initialIndicators,
    trends,
    // Histórico de variações e notícias da cidade
    history: [],
    recentEvents: [],
    activeEffects: [], // efeitos com duração em meses
    qualityOfLife: 50,
    attractiveness: 50,
    shortDescription: `${geography.name} com foco em ${specialization.name.toLowerCase()}, orientada por princípios de vertente ${archetype.name.toLowerCase()}.`
  };
}
