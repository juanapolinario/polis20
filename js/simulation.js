/**
 * Horizontes Cívicos - Motor de Simulação
 * Modela a evolução socioeconômica das 20 cidades em passos mensais.
 * Função pura: recebe o estado atual e o PRNG, devolvendo o novo estado sem mutações colaterais.
 */

import {
  INDICATOR_DEFS,
  EVENTS_DATABASE,
  classifyPolitics,
  IDEOLOGICAL_PROBLEMS_DATABASE,
  calculateNolanAffinity,
  calculateIdeologicalIntensity
} from './data.js';
import { clamp } from './rng.js';

// Calcula a distância euclidiana cartográfica entre duas cidades
export function calculateCityDistance(cityA, cityB) {
  if (!cityA || !cityB || !cityA.mapPos || !cityB.mapPos) return 100;
  return Math.round(Math.hypot(cityA.mapPos.x - cityB.mapPos.x, cityA.mapPos.y - cityB.mapPos.y));
}

// Calcula o custo em créditos para o jogador migrar de uma cidade para outra
export function calculateMigrationCost(originCity, destinationCity) {
  if (!originCity || !destinationCity || originCity.id === destinationCity.id) return 0;
  const dist = calculateCityDistance(originCity, destinationCity);
  
  // Base 25 + fração da distância + taxa pelo custo de vida no destino + sobretaxa se infraestrutura for precária
  const baseCost = 25;
  const distanceCost = dist * 0.06;
  const destinationCostFactor = destinationCity.costOfLiving * 0.25;
  const infraFriction = Math.max(0, (60 - destinationCity.indicators.infrastructure) * 0.2);

  return Math.max(15, Math.round(baseCost + distanceCost + destinationCostFactor + infraFriction));
}

// Calcula o Índice Composto de Qualidade de Vida (0 a 100)
export function calculateQualityOfLife(indicators) {
  // Ponderação balanceada sem hegemonia de um único fator
  const weights = {
    health: 0.14,
    safety: 0.14,
    jobs: 0.12,
    housing: 0.11,
    economy: 0.10,
    education: 0.10,
    environment: 0.09,
    personalFreedom: 0.08,
    equality: 0.04,
    trust: 0.04,
    stability: 0.04
  };

  let total = 0;
  for (const [key, weight] of Object.entries(weights)) {
    total += (indicators[key] || 50) * weight;
  }
  return Math.round(clamp(total, 0, 100));
}

// Calcula a Atratividade Migratória (0 a 100)
export function calculateAttractiveness(city) {
  const ind = city.indicators;
  const qol = city.qualityOfLife || calculateQualityOfLife(ind);
  
  // Atratividade considera QoL, empregos, moradia, liberdade e desconta custo de vida elevado
  const score = (qol * 0.40) +
                (ind.jobs * 0.20) +
                (ind.housing * 0.15) +
                (ind.safety * 0.10) +
                (ind.personalFreedom * 0.10) -
                (city.costOfLiving * 0.15);

  return Math.round(clamp(score + 10, 5, 95));
}

// Cria o estado inicial do jogo
export function createInitialGameState(cities, seed, citizenName) {
  // Calcula QoL e Atratividade iniciais para todas as cidades
  const initialCities = cities.map(city => {
    const qol = calculateQualityOfLife(city.indicators);
    const updated = {
      ...city,
      qualityOfLife: qol,
      ideologicalCooldowns: city.ideologicalCooldowns || {},
      familyCooldowns: city.familyCooldowns || {},
      activeConditions: city.activeConditions || [],
      ideologicalHistory: city.ideologicalHistory || []
    };
    updated.attractiveness = calculateAttractiveness(updated);
    return updated;
  });

  return {
    version: 2,
    seed: seed || 'HorizontesCivicos_2026',
    month: 1,
    year: 1,
    currentCityId: 0,
    citizenName: citizenName ? citizenName.trim() : 'Cidadão Observador',
    credits: 100,
    monthlyCreditsDelta: 0,
    cities: initialCities,
    headlines: [
      {
        month: 1,
        year: 1,
        cityName: initialCities[0].name,
        title: 'Fundação do Observatório Cívico',
        category: 'política',
        text: 'Começa hoje o acompanhamento mensal das 20 cidades do continente sob o modelo de Horizontes Cívicos.'
      }
    ],
    diary: [
      {
        month: 1,
        year: 1,
        type: 'start',
        title: 'Início da Jornada',
        text: `Você estabeleceu residência em ${initialCities[0].name} com 100 créditos e iniciou suas anotações cívicas.`
      }
    ]
  };
}

// Função pura que avança 1 mês na simulação do mundo
export function advanceMonth(state, rng) {
  const currentMonth = state.month;
  const currentYear = state.year;
  
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  const monthHeadlines = [];
  const diaryEntries = [...state.diary];

  // 1. Acontecimentos Globais (chance pequena por mês: ~5%)
  let activeGlobalEvent = null;
  if (rng.next() < 0.06) {
    const globalEvents = EVENTS_DATABASE.filter(e => e.isGlobal);
    if (globalEvents.length > 0) {
      activeGlobalEvent = rng.choice(globalEvents);
      monthHeadlines.push({
        month: nextMonth,
        year: nextYear,
        cityName: 'Mundo',
        title: `[GLOBAL] ${activeGlobalEvent.title}`,
        category: activeGlobalEvent.category,
        text: activeGlobalEvent.narrative
      });
      diaryEntries.unshift({
        month: nextMonth,
        year: nextYear,
        type: 'global',
        title: activeGlobalEvent.title,
        text: `Evento continental: ${activeGlobalEvent.narrative}`
      });
    }
  }

  // 2. Evolução de cada uma das 20 cidades
  const updatedCities = state.cities.map(city => {
    return simulateSingleCityMonth(city, activeGlobalEvent, nextMonth, nextYear, rng, monthHeadlines, diaryEntries, state.currentCityId);
  });

  // 3. Simulação de Fluxo Migratório entre as cidades
  // Cidades com alta atratividade recebem migrantes das de menor atratividade
  const citiesWithMigration = processInterCityMigration(updatedCities, rng);

  // 4. Atualização dos Recursos do Jogador (Cidadão)
  const currentCity = citiesWithMigration.find(c => c.id === state.currentCityId) || citiesWithMigration[0];
  const ind = currentCity.indicators;
  
  // Balanço mensal do jogador:
  // Ganho advém de economia pujante e oportunidades de emprego
  // Gasto advém do custo de vida da cidade e escassez de moradia
  const income = (ind.economy * 0.07) + (ind.jobs * 0.06);
  const expenses = (currentCity.costOfLiving * 0.08) + ((100 - ind.housing) * 0.035);
  const luck = rng.gaussian(0, 0.8);
  const rawDelta = income - expenses + luck;
  const monthlyCreditsDelta = Math.round(rawDelta);
  
  // Atualiza créditos sem deixar ficar negativo de forma irreversível
  const nextCredits = Math.max(0, state.credits + monthlyCreditsDelta);

  // 5. Marco Anual (a cada 12 meses, cria uma retrospectiva do ano)
  if (currentMonth === 12) {
    const sortedByQol = [...citiesWithMigration].sort((a, b) => b.qualityOfLife - a.qualityOfLife);
    const topCity = sortedByQol[0];
    const bottomCity = sortedByQol[sortedByQol.length - 1];
    
    diaryEntries.unshift({
      month: 12,
      year: currentYear,
      type: 'annual',
      title: `Retrospectiva do Ano ${currentYear}`,
      text: `O Ano ${currentYear} encerrou-se. A cidade com maior índice de qualidade de vida foi ${topCity.name} (${topCity.qualityOfLife} pts), enquanto ${bottomCity.name} enfrentou os maiores desafios estruturais (${bottomCity.qualityOfLife} pts). Você encerra o ano com ${nextCredits} créditos em ${currentCity.name}.`
    });
  }

  // Limita as manchetes no feed geral: no máximo 4 por mês, com teto de até 3 problemas ideológicos em destaque
  let ideologicalCount = 0;
  const curatedHeadlines = [];
  for (const h of monthHeadlines) {
    if (h.isIdeological) {
      if (ideologicalCount < 3) {
        curatedHeadlines.push(h);
        ideologicalCount++;
      }
    } else {
      curatedHeadlines.push(h);
    }
    if (curatedHeadlines.length >= 4) break;
  }
  const allHeadlines = [...curatedHeadlines, ...state.headlines].slice(0, 40);

  return {
    ...state,
    month: nextMonth,
    year: nextYear,
    credits: nextCredits,
    monthlyCreditsDelta,
    cities: citiesWithMigration,
    headlines: allHeadlines,
    diary: diaryEntries.slice(0, 80)
  };
}

// Simula o mês de uma cidade específica
function simulateSingleCityMonth(city, activeGlobalEvent, nextMonth, nextYear, rng, monthHeadlines, diaryEntries, playerCityId) {
  const oldInd = city.indicators;
  const newInd = { ...oldInd };
  const prevTrends = city.trends || {};
  const cityEvents = [];
  let monthExplanation = '';

  // A. Atualização dos Cooldowns de Problemas Ideológicos (meses restantes)
  const nextIdeologicalCooldowns = { ...(city.ideologicalCooldowns || {}) };
  for (const [evId, rem] of Object.entries(nextIdeologicalCooldowns)) {
    if (rem > 1) {
      nextIdeologicalCooldowns[evId] = rem - 1;
    } else {
      delete nextIdeologicalCooldowns[evId];
    }
  }

  const nextFamilyCooldowns = { ...(city.familyCooldowns || {}) };
  for (const [famId, rem] of Object.entries(nextFamilyCooldowns)) {
    if (rem > 1) {
      nextFamilyCooldowns[famId] = rem - 1;
    } else {
      delete nextFamilyCooldowns[famId];
    }
  }

  // B. Processamento de Condições Persistentes Ativas (3 a 18 meses)
  const remainingConditions = [];
  const monthlyConditionEffects = {};
  const delayedEffectsToApply = {};

  for (const cond of (city.activeConditions || [])) {
    // Acumula efeitos mensais
    if (cond.monthlyEffects) {
      for (const [k, v] of Object.entries(cond.monthlyEffects)) {
        monthlyConditionEffects[k] = (monthlyConditionEffects[k] || 0) + v;
      }
    }

    const nextMonths = (cond.remainingMonths ?? 1) - 1;
    if (nextMonths <= 0) {
      // Condição temporária encerrou: aplica efeitos atrasados e notícia de resolução
      if (cond.delayedEffects) {
        for (const [k, v] of Object.entries(cond.delayedEffects)) {
          delayedEffectsToApply[k] = (delayedEffectsToApply[k] || 0) + v;
        }
      }

      const resText = cond.resolutionNarrative || `A condição extraordinária decorrente de ${cond.title} foi normalizada na metrópole.`;
      monthHeadlines.push({
        month: nextMonth,
        year: nextYear,
        cityName: city.name,
        title: `Resolução: ${cond.title}`,
        category: 'política',
        text: resText,
        isResolution: true
      });

      if (city.id === playerCityId) {
        diaryEntries.unshift({
          month: nextMonth,
          year: nextYear,
          type: 'local',
          title: `${city.name}: Resolução de ${cond.title}`,
          text: resText
        });
      }
    } else {
      remainingConditions.push({
        ...cond,
        remainingMonths: nextMonths
      });
    }
  }

  const updatedIdeologicalHistory = [...(city.ideologicalHistory || [])];

  // C. Sorteio Unificado de Acontecimentos Locais (Padrão ou Problema Ideológico)
  // O motor avalia a ocorrência com chance de ~13% ao mês
  let localEvent = null;

  if (rng.next() < 0.13) {
    const candidateList = [];

    // 1. Candidatos da base padrão EVENTS_DATABASE
    for (const ev of EVENTS_DATABASE) {
      if (ev.isGlobal) continue;
      const c = ev.conditions || {};
      if (c.minEcon && oldInd.economy < c.minEcon) continue;
      if (c.maxEcon && oldInd.economy > c.maxEcon) continue;
      if (c.minJobs && oldInd.jobs < c.minJobs) continue;
      if (c.maxJobs && oldInd.jobs > c.maxJobs) continue;
      if (c.minSafety && oldInd.safety < c.minSafety) continue;
      if (c.maxSafety && oldInd.safety > c.maxSafety) continue;
      if (c.minHealth && oldInd.health < c.minHealth) continue;
      if (c.maxHealth && oldInd.health > c.maxHealth) continue;
      if (c.minEducation && oldInd.education < c.minEducation) continue;
      if (c.maxHousing && oldInd.housing > c.maxHousing) continue;
      if (c.minInfrastructure && oldInd.infrastructure < c.minInfrastructure) continue;
      if (c.minCivicFreedom && city.civicFreedom < c.minCivicFreedom) continue;
      if (c.maxCivicFreedom && city.civicFreedom > c.maxCivicFreedom) continue;
      if (c.minTrust && oldInd.trust < c.minTrust) continue;
      if (c.maxTrust && oldInd.trust > c.maxTrust) continue;
      if (c.minStability && oldInd.stability < c.minStability) continue;
      if (c.maxStability && oldInd.stability > c.maxStability) continue;

      candidateList.push({
        item: ev,
        weight: ev.weight || 10,
        isIdeological: false
      });
    }

    // 2. Candidatos da base IDEOLOGICAL_PROBLEMS_DATABASE
    for (const prob of IDEOLOGICAL_PROBLEMS_DATABASE) {
      // Respeita cooldown por evento específico
      if (nextIdeologicalCooldowns[prob.id]) continue;
      // Respeita cooldown por família de risco
      if (nextFamilyCooldowns[prob.riskFamily]) continue;
      // Não reativa condição já em curso
      if (remainingConditions.some(rc => rc.eventId === prob.id)) continue;

      // Condições de liberdade econômica e pessoal
      const c = prob.conditions || {};
      if (c.minEconFreedom && city.econFreedom < c.minEconFreedom) continue;
      if (c.maxEconFreedom && city.econFreedom > c.maxEconFreedom) continue;
      if (c.minPersonalFreedom && city.civicFreedom < c.minPersonalFreedom) continue;
      if (c.maxPersonalFreedom && city.civicFreedom > c.maxPersonalFreedom) continue;

      // Pré-requisito de escalada no histórico da cidade
      if (c.requiresAnyHistory) {
        const hasPrecursor = c.requiresAnyHistory.some(hId => updatedIdeologicalHistory.includes(hId));
        if (!hasPrecursor) continue;
      }

      // Afinidade contínua baseada na distância euclidiana ao perfil de Nolan [0, 1]
      const affinity = calculateNolanAffinity(city, prob.nolanProfile);
      if (affinity < 0.10) continue;

      // Intensidade ideológica
      const intensity = calculateIdeologicalIntensity(city, prob.nolanProfile);

      // Multiplicador de vulnerabilidade baseado nos indicadores materiais observados
      let vulnMultiplier = 1.0;
      const matchedFactorLabels = [];

      for (const rf of (prob.riskFactors || [])) {
        const val = oldInd[rf.field] ?? 50;
        let isMatch = false;
        if (rf.operator === '<' && val < rf.value) isMatch = true;
        else if (rf.operator === '>' && val > rf.value) isMatch = true;
        else if (rf.operator === '<=' && val <= rf.value) isMatch = true;
        else if (rf.operator === '>=' && val >= rf.value) isMatch = true;

        if (isMatch) {
          vulnMultiplier *= (rf.multiplier || 1.25);
          matchedFactorLabels.push(`${rf.label} (${Math.round(val)})`);
        }
      }

      // Ponderação final: pesoBase × afinidade² × intensidade × vulnerabilidade × fator de calibração
      // Calibração ajustada para ~20%-30% dos acontecimentos locais ao longo de simulações extensas
      const CALIBRATION_FACTOR = 0.88;
      const pesoFinal = (prob.weight || 8) * Math.pow(affinity, 2) * intensity * vulnMultiplier * CALIBRATION_FACTOR;

      if (pesoFinal > 0.01) {
        candidateList.push({
          item: prob,
          weight: pesoFinal,
          isIdeological: true,
          matchedFactors: matchedFactorLabels
        });
      }
    }

    // Sorteio ponderado determinístico via Mulberry32
    if (candidateList.length > 0) {
      let totalWeight = 0;
      for (const cand of candidateList) {
        totalWeight += cand.weight;
      }

      let pickThreshold = rng.next() * totalWeight;
      let selectedCand = candidateList[candidateList.length - 1];

      for (const cand of candidateList) {
        pickThreshold -= cand.weight;
        if (pickThreshold <= 0) {
          selectedCand = cand;
          break;
        }
      }

      localEvent = selectedCand.item;

      if (selectedCand.isIdeological) {
        if (!updatedIdeologicalHistory.includes(localEvent.id)) {
          updatedIdeologicalHistory.push(localEvent.id);
        }

        // Aplica cooldowns (mínimo 24 meses mesmo evento, 12 meses mesma família)
        nextIdeologicalCooldowns[localEvent.id] = localEvent.cooldownMonths || 24;
        nextFamilyCooldowns[localEvent.riskFamily] = 12;

        // Se o evento possuir duração persistente (3 a 18 meses), registra na lista de condições ativas
        if (localEvent.duration && localEvent.duration > 0) {
          remainingConditions.push({
            id: `${localEvent.id}_${nextMonth}_${nextYear}`,
            eventId: localEvent.id,
            title: localEvent.title,
            remainingMonths: localEvent.duration,
            monthlyEffects: localEvent.monthlyEffects || {},
            delayedEffects: localEvent.delayedEffects || {},
            resolutionNarrative: localEvent.resolutionNarrative
          });
        }

        const factorsText = (selectedCand.matchedFactors && selectedCand.matchedFactors.length > 0)
          ? selectedCand.matchedFactors.join(', ')
          : 'vulnerabilidades institucionais observadas no período';

        cityEvents.push({
          id: localEvent.id,
          type: 'ideologicalProblem',
          category: localEvent.category || 'política',
          nolanProfile: localEvent.nolanProfile,
          riskFamily: localEvent.riskFamily,
          severity: localEvent.severity || 'light',
          title: localEvent.title,
          text: localEvent.narrative,
          immediateBenefit: localEvent.immediateBenefit || null,
          duration: localEvent.duration || 0,
          factorsText: `Fatores: ${factorsText}`,
          explanation: localEvent.explanation,
          effects: localEvent.effects || {},
          month: nextMonth,
          year: nextYear
        });

        monthHeadlines.push({
          month: nextMonth,
          year: nextYear,
          cityName: city.name,
          title: localEvent.title,
          category: localEvent.category || 'política',
          text: localEvent.narrative,
          isIdeological: true,
          severity: localEvent.severity || 'light'
        });

        monthExplanation = localEvent.explanation;

        if (city.id === playerCityId) {
          diaryEntries.unshift({
            month: nextMonth,
            year: nextYear,
            type: 'local',
            title: `${city.name}: ${localEvent.title}`,
            text: localEvent.narrative,
            isIdeological: true
          });
        }
      } else {
        // Evento padrão
        cityEvents.push({
          id: localEvent.id,
          type: 'standard',
          category: localEvent.category,
          title: localEvent.title,
          text: localEvent.narrative,
          explanation: localEvent.explanation,
          effects: localEvent.effects || {},
          month: nextMonth,
          year: nextYear
        });

        monthHeadlines.push({
          month: nextMonth,
          year: nextYear,
          cityName: city.name,
          title: localEvent.title,
          category: localEvent.category,
          text: localEvent.narrative
        });

        monthExplanation = localEvent.explanation;

        if (city.id === playerCityId) {
          diaryEntries.unshift({
            month: nextMonth,
            year: nextYear,
            type: 'local',
            title: `${city.name}: ${localEvent.title}`,
            text: localEvent.narrative
          });
        }
      }
    }
  }

  // 2. Cálculo das Mudanças dos Indicadores
  // mudança = inércia + reversão_ao_centro + relações_cruzadas + influência_ética + efeito_evento + ruído_moderado
  const changes = {};

  for (const key of Object.keys(INDICATOR_DEFS)) {
    const val = oldInd[key];
    
    // Inércia: tende a manter uma pequena fração da tendência do mês anterior
    const inertia = (prevTrends[key] || 0) * 0.35;
    
    // Reversão moderada à média (puxa suavemente para 50 para evitar saturação perpétua em 0 ou 100)
    const meanReversion = (50 - val) * 0.035;

    // Relações estruturais cruzadas entre indicadores
    let relations = 0;
    switch (key) {
      case 'economy':
        // Infraestrutura sustenta economia; educação gera inovação no médio prazo; desigualdade extrema prejudica
        relations += (oldInd.infrastructure - 50) * 0.03;
        relations += (oldInd.education - 50) * 0.025;
        relations += (oldInd.stability - 50) * 0.02;
        break;

      case 'jobs':
        // Economia aquecida gera empregos; custo alto de infraestrutura pode limitar
        relations += (oldInd.economy - 50) * 0.05;
        relations += (oldInd.infrastructure - 50) * 0.02;
        break;

      case 'safety':
        // Empregos e coesão reduzem criminalidade; confiança e ordem apoiam cooperação
        relations += (oldInd.jobs - 50) * 0.025;
        relations += (oldInd.equality - 50) * 0.020;
        relations += (oldInd.trust - 50) * 0.020;
        break;

      case 'health':
        // Saneamento/infraestrutura, investimentos econômicos e meio ambiente apoiam a saúde
        relations += (oldInd.infrastructure - 50) * 0.025;
        relations += (oldInd.economy - 50) * 0.020;
        relations += (oldInd.environment - 50) * 0.035;
        break;

      case 'education':
        // Dinamismo econômico e igualdade de acesso sustentam boas escolas
        relations += (oldInd.economy - 50) * 0.025;
        relations += (oldInd.equality - 50) * 0.020;
        break;

      case 'housing':
        // Economia aquecida eleva demanda habitacional; infraestrutura amplia loteamentos
        relations -= (oldInd.economy - 50) * 0.020;
        relations += (oldInd.infrastructure - 50) * 0.025;
        break;

      case 'equality':
        // Educação e serviços públicos favorecem igualdade; dinamismo de mercado gera dispersão moderada
        relations += (oldInd.education - 50) * 0.025;
        relations -= (oldInd.economy - 50) * 0.015;
        break;

      case 'infrastructure':
        // Economia fornece recursos e estabilidade permite obras de longo prazo
        relations += (oldInd.economy - 50) * 0.035;
        relations += (oldInd.stability - 50) * 0.025;
        break;

      case 'environment':
        // Atividade industrial intensa requer tecnologias limpas e educação ambiental
        relations += (oldInd.education - 50) * 0.025;
        relations -= (oldInd.economy - 50) * 0.020;
        break;

      case 'personalFreedom':
        // Educação e confiança sustentam garantias e pluralismo civil
        relations += (oldInd.education - 50) * 0.020;
        relations += (oldInd.trust - 50) * 0.020;
        break;

      case 'stability':
        // Confiança, empregos e coesão pacificam a pólis
        relations -= (50 - oldInd.equality) * 0.018;
        relations += (oldInd.trust - 50) * 0.025;
        relations += (oldInd.jobs - 50) * 0.025;
        break;

      case 'trust':
        // Segurança, estabilidade e equidade aumentam a confiança pública
        relations += (oldInd.safety - 50) * 0.020;
        relations += (oldInd.equality - 50) * 0.020;
        relations += (oldInd.stability - 50) * 0.020;
        break;
    }

    // Influência Ética Moderada
    // Liberdade econômica (0-100) e Liberdade pessoal (0-100)
    let ethicalPush = 0;
    const econDev = city.econFreedom - 50;
    const personalDev = city.civicFreedom - 50;

    if (key === 'economy') ethicalPush += econDev * 0.025;
    if (key === 'jobs') ethicalPush += econDev * 0.020;
    if (key === 'housing') ethicalPush -= econDev * 0.012; // maior liberdade de mercado aquece preços
    if (key === 'equality') ethicalPush -= econDev * 0.015; // coordenação pública foca redistribuição
    if (key === 'personalFreedom') ethicalPush += personalDev * 0.035;
    if (key === 'trust') ethicalPush += (personalDev * 0.015) - (Math.abs(econDev) * 0.008);
    if (key === 'safety') {
      // Baixa liberdade pessoal tenta impor ordem; alta liberdade pessoal requer confiança mútua
      if (personalDev < -20) ethicalPush += 0.35;
      else if (personalDev > 20) ethicalPush -= 0.25;
    }

    // Efeito de evento local
    let eventEffect = 0;
    if (localEvent) {
      if (localEvent.effects && localEvent.effects[key]) {
        eventEffect += localEvent.effects[key];
      }
      if (localEvent.immediateBenefitEffects && localEvent.immediateBenefitEffects[key]) {
        eventEffect += localEvent.immediateBenefitEffects[key];
      }
      if (localEvent.ethicalModifiers) {
        const mod = localEvent.ethicalModifiers(city);
        if (mod && mod[key]) eventEffect += mod[key];
      }
    }

    // Efeitos mensais acumulados de condições persistentes ativas
    if (monthlyConditionEffects[key]) {
      eventEffect += monthlyConditionEffects[key];
    }

    // Efeitos atrasados aplicados na resolução de condições encerradas
    if (delayedEffectsToApply[key]) {
      eventEffect += delayedEffectsToApply[key];
    }

    // Efeito de evento global
    if (activeGlobalEvent) {
      if (activeGlobalEvent.effects && activeGlobalEvent.effects[key]) {
        eventEffect += activeGlobalEvent.effects[key];
      }
      if (activeGlobalEvent.ethicalModifiers) {
        const mod = activeGlobalEvent.ethicalModifiers(city);
        if (mod && mod[key]) eventEffect += mod[key];
      }
    }

    // Ruído Gaussiano Suave
    const noise = rng.gaussian(0, 0.6);

    // Mudança final do indicador no mês
    const delta = inertia + meanReversion + relations + ethicalPush + eventEffect + noise;
    changes[key] = delta;

    // Novo valor clampar rigorosamente entre 0 e 100
    newInd[key] = Math.round(clamp(val + delta, 0, 100));
  }

  // 3. Atualização das Tendências Visuais (↑, →, ↓)
  const newTrends = {};
  for (const key of Object.keys(INDICATOR_DEFS)) {
    const d = changes[key];
    if (d > 0.8) newTrends[key] = 1; // subindo ↑
    else if (d < -0.8) newTrends[key] = -1; // caindo ↓
    else newTrends[key] = 0; // estável →
  }

  // 4. Recalcula Qualidade de Vida e Custo de Vida
  const qualityOfLife = calculateQualityOfLife(newInd);
  const costOfLiving = Math.round(
    clamp((newInd.economy * 0.45) + ((100 - newInd.housing) * 0.45) + (city.population / 70000), 20, 98)
  );

  // Se não houve evento local, gera explicação sintética do mês
  if (!monthExplanation) {
    if (newTrends.economy > 0 && newTrends.housing < 0) {
      monthExplanation = 'A expansão comercial elevou a renda, mas pressionou o mercado imobiliário local.';
    } else if (newTrends.safety > 0 && newTrends.trust > 0) {
      monthExplanation = 'Melhorias na ordem urbana e policiamento reforçaram a sensação de tranquilidade cívica.';
    } else if (newTrends.environment > 0) {
      monthExplanation = 'Preservação de áreas verdes e controle de efluentes trouxeram ganhos de sustentabilidade.';
    } else if (newTrends.health < 0) {
      monthExplanation = 'Pequenas oscilações sazonais aumentaram a procura por serviços de pronto-atendimento.';
    } else {
      monthExplanation = 'O mês transcorreu dentro dos padrões normais de estabilidade para a comunidade.';
    }
  }

  // Histórico recente dos últimos 12 meses
  const updatedHistory = [
    {
      month: nextMonth,
      year: nextYear,
      qol: qualityOfLife,
      economy: newInd.economy,
      safety: newInd.safety,
      personalFreedom: newInd.personalFreedom,
      costOfLiving
    },
    ...(city.history || [])
  ].slice(0, 24);

  return {
    ...city,
    indicators: newInd,
    trends: newTrends,
    qualityOfLife,
    costOfLiving,
    attractiveness: 50, // será recalculado no passo de migração
    history: updatedHistory,
    recentEvents: [...cityEvents, ...(city.recentEvents || [])].slice(0, 8),
    lastMonthExplanation: monthExplanation,
    ideologicalCooldowns: nextIdeologicalCooldowns,
    familyCooldowns: nextFamilyCooldowns,
    activeConditions: remainingConditions,
    ideologicalHistory: updatedIdeologicalHistory
  };
}

// Modela fluxos migratórios e crescimento vegetativo entre as 20 cidades
function processInterCityMigration(cities, rng) {
  // Primeiro atualiza a atratividade de todas as cidades
  const withAttractiveness = cities.map(c => ({
    ...c,
    attractiveness: calculateAttractiveness(c)
  }));

  // Média continental de atratividade
  const avgAttractiveness = withAttractiveness.reduce((acc, c) => acc + c.attractiveness, 0) / withAttractiveness.length;

  return withAttractiveness.map(city => {
    // Crescimento vegetativo natural (nascimentos - óbitos): entre 0.05% e 0.25% ao mês, ponderado por saúde
    const naturalRate = 0.0010 + ((city.indicators.health - 50) * 0.00003);

    // Saldo migratório líquido: se atratividade > média continental, atrai moradores; caso contrário, perde
    const attractivenessDiff = city.attractiveness - avgAttractiveness;
    const migrationRate = (attractivenessDiff * 0.00012) + (rng.gaussian(0, 0.00004));

    const totalGrowthRate = naturalRate + migrationRate;
    const deltaPop = Math.round(city.population * totalGrowthRate);
    const newPopulation = Math.max(25000, city.population + deltaPop);

    return {
      ...city,
      population: newPopulation,
      populationGrowth: deltaPop
    };
  });
}

// Executa a migração do jogador para uma cidade de destino
export function migratePlayerToCity(state, destinationCityId) {
  const currentCity = state.cities.find(c => c.id === state.currentCityId);
  const destCity = state.cities.find(c => c.id === destinationCityId);

  if (!destCity || destCity.id === state.currentCityId) {
    return { success: false, reason: 'Você já reside nesta cidade.' };
  }

  const cost = calculateMigrationCost(currentCity, destCity);
  if (state.credits < cost) {
    return {
      success: false,
      reason: `Créditos insuficientes. A mudança exige ${cost} créditos, mas você possui ${state.credits}. Faltam ${cost - state.credits} créditos.`
    };
  }

  // Deduz créditos
  const remainingCredits = state.credits - cost;
  
  // Registra no diário
  const newDiary = [
    {
      month: state.month,
      year: state.year,
      type: 'migration',
      title: `Mudança para ${destCity.name}`,
      text: `Você migrou de ${currentCity.name} para ${destCity.name} ao custo de ${cost} créditos. Distância percorrida: ${calculateCityDistance(currentCity, destCity)} km.`
    },
    ...state.diary
  ];

  // A mudança de residência consome 1 mês
  const intermediateState = {
    ...state,
    credits: remainingCredits,
    currentCityId: destinationCityId,
    diary: newDiary
  };

  return {
    success: true,
    cost,
    state: intermediateState
  };
}
