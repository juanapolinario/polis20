/**
 * Horizontes Cívicos - Teste Automatizado de Balanceamento e Diagnóstico
 * Simula 50 sementes independentes × 20 cidades × 120 meses (10 anos)
 * Total: 120.000 cidades-mês simuladas.
 */

import { createRNG } from '../js/rng.js';
import { generateInitialCities, INDICATOR_DEFS } from '../js/data.js';
import { createInitialGameState, advanceMonth } from '../js/simulation.js';

console.log('='.repeat(70));
console.log('INICIANDO DIAGNÓSTICO DE BALANCEAMENTO DE PROBLEMAS POLÍTICOS');
console.log('Metodologia: 50 Sementes × 20 Cidades × 120 Meses (120.000 cidades-mês)');
console.log('='.repeat(70));

const SEEDS_COUNT = 50;
const MONTHS_PER_RUN = 120;

const stats = {
  totalCityMonths: 0,
  totalLocalEvents: 0,
  totalIdeologicalEvents: 0,
  totalStandardEvents: 0,
  eventsByProfile: {
    libertarian: 0,
    conservative: 0,
    progressive: 0,
    statist: 0,
    centrist: 0
  },
  eventsByFamily: {},
  eventsBySeverity: {
    light: 0,
    moderate: 0,
    severe: 0
  },
  escalationsCount: 0,
  cooldownViolations: 0,
  eventFrequency: {},
  indicatorDeltas: {},
  nanCount: 0,
  citiesHitZero: 0,
  citiesHitHundred: 0,
  qolByProfile: {
    libertarian: { sum: 0, count: 0 },
    conservative: { sum: 0, count: 0 },
    progressive: { sum: 0, count: 0 },
    statist: { sum: 0, count: 0 },
    centrist: { sum: 0, count: 0 }
  }
};

for (const key of Object.keys(INDICATOR_DEFS)) {
  stats.indicatorDeltas[key] = { sum: 0, count: 0 };
}

const escalationEventIds = new Set([
  'ideological_lib_oligopolio',
  'ideological_cons_cidadaos_nao_pertencem',
  'ideological_prog_participacao_exaustiva',
  'ideological_stat_mercado_clandestino',
  'ideological_stat_vigilancia_permanente',
  'ideological_stat_cidadania_segunda_classe',
  'ideological_cent_paralisia_coalizao'
]);

const startTime = Date.now();

for (let s = 0; s < SEEDS_COUNT; s++) {
  const seedString = `Koyzis_Balance_Seed_${s + 1}`;
  const rng = createRNG(seedString);
  const initialCities = generateInitialCities('Metrópole Central', 50, 50, rng);
  let state = createInitialGameState(initialCities, seedString, 'Auditor Cívico');

  // Rastreio de ocorrências anteriores por cidade para verificar cooldowns rigorosos
  // { cityId: { eventId: lastMonthOccurred } }
  const lastOccurrence = {};
  for (const c of initialCities) {
    lastOccurrence[c.id] = {};
  }

  for (let monthStep = 0; monthStep < MONTHS_PER_RUN; monthStep++) {
    const prevCitySnapshots = state.cities.map(c => ({
      id: c.id,
      indicators: { ...c.indicators }
    }));

    state = advanceMonth(state, rng);
    const currentSimMonth = state.year * 12 + state.month;

    // Inspeciona os eventos gerados neste mês em cada uma das 20 cidades
    for (const city of state.cities) {
      stats.totalCityMonths++;

      // Validação de NaN e integridade numérica
      for (const [indKey, indVal] of Object.entries(city.indicators)) {
        if (Number.isNaN(indVal) || typeof indVal !== 'number') {
          stats.nanCount++;
        }
        if (indVal <= 0) stats.citiesHitZero++;
        if (indVal >= 100) stats.citiesHitHundred++;
      }

      const prevCity = prevCitySnapshots.find(p => p.id === city.id);
      if (prevCity) {
        for (const indKey of Object.keys(INDICATOR_DEFS)) {
          const delta = city.indicators[indKey] - prevCity.indicators[indKey];
          stats.indicatorDeltas[indKey].sum += delta;
          stats.indicatorDeltas[indKey].count++;
        }
      }

      // Analisa o evento mais recente se ocorreu neste mês exato
      if (city.recentEvents && city.recentEvents.length > 0) {
        const latestEv = city.recentEvents[0];
        if (latestEv.month === state.month && latestEv.year === state.year) {
          stats.totalLocalEvents++;

          if (latestEv.type === 'ideologicalProblem') {
            stats.totalIdeologicalEvents++;

            // Perfil
            if (stats.eventsByProfile[latestEv.nolanProfile] !== undefined) {
              stats.eventsByProfile[latestEv.nolanProfile]++;
            }

            // Família de Risco
            const fam = latestEv.riskFamily || 'outros';
            stats.eventsByFamily[fam] = (stats.eventsByFamily[fam] || 0) + 1;

            // Severidade
            const sev = latestEv.severity || 'light';
            if (stats.eventsBySeverity[sev] !== undefined) {
              stats.eventsBySeverity[sev]++;
            }

            // Escaladas
            if (escalationEventIds.has(latestEv.id)) {
              stats.escalationsCount++;
            }

            // Frequência individual
            stats.eventFrequency[latestEv.id] = (stats.eventFrequency[latestEv.id] || 0) + 1;

            // Cooldown check (mínimo 24 meses)
            const lastMonth = lastOccurrence[city.id][latestEv.id];
            if (lastMonth !== undefined) {
              const diff = currentSimMonth - lastMonth;
              if (diff < 24) {
                stats.cooldownViolations++;
              }
            }
            lastOccurrence[city.id][latestEv.id] = currentSimMonth;
          } else {
            stats.totalStandardEvents++;
          }
        }
      }
    }
  }

  // Coleta QoL final por perfil arquétipo
  for (const city of state.cities) {
    const arch = city.archetypeId || 'centrist';
    if (stats.qolByProfile[arch]) {
      stats.qolByProfile[arch].sum += city.qualityOfLife;
      stats.qolByProfile[arch].count++;
    }
  }
}

const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);

// Teste de determinismo estrito (executar a mesma semente duas vezes e comparar JSON)
console.log('\nVerificando determinismo estrito...');
const rng1 = createRNG('Deterministic_Test_Seed');
const cities1 = generateInitialCities('Metrópole Central', 50, 50, rng1);
let state1 = createInitialGameState(cities1, 'Deterministic_Test_Seed', 'Auditor');
for (let m = 0; m < 24; m++) state1 = advanceMonth(state1, rng1);

const rng2 = createRNG('Deterministic_Test_Seed');
const cities2 = generateInitialCities('Metrópole Central', 50, 50, rng2);
let state2 = createInitialGameState(cities2, 'Deterministic_Test_Seed', 'Auditor');
for (let m = 0; m < 24; m++) state2 = advanceMonth(state2, rng2);

const json1 = JSON.stringify(state1);
const json2 = JSON.stringify(state2);
const isDeterministic = json1 === json2;

console.log(`Determinismo estrito confirmado: ${isDeterministic ? 'SIM (100% IDÊNTICO)' : 'FALHA (DIVERGENTE)'}`);

// Resumo e Relatório
const ideologicalPct = ((stats.totalIdeologicalEvents / stats.totalLocalEvents) * 100).toFixed(1);
const standardPct = ((stats.totalStandardEvents / stats.totalLocalEvents) * 100).toFixed(1);

console.log('\n' + '='.repeat(70));
console.log('RELATÓRIO RESUMIDO DE SIMULAÇÃO (50 SEMENTES / 120 MESES)');
console.log('='.repeat(70));
console.log(`Tempo de execução: ${durationSeconds}s`);
console.log(`Cidades-mês simuladas: ${stats.totalCityMonths.toLocaleString()}`);
console.log(`Total de acontecimentos locais: ${stats.totalLocalEvents}`);
console.log(`- Eventos padrão (EVENTS_DATABASE): ${stats.totalStandardEvents} (${standardPct}%)`);
console.log(`- Problemas ideológicos (Koyzis): ${stats.totalIdeologicalEvents} (${ideologicalPct}%) [Alvo: 20% - 30%]`);
console.log(`- Violações de cooldown (deve ser 0): ${stats.cooldownViolations}`);
console.log(`- Ocorrências de NaN ou inválidos (deve ser 0): ${stats.nanCount}`);
console.log(`- Cidades em saturação 0 ou 100: zero=${stats.citiesHitZero}, 100=${stats.citiesHitHundred}`);
console.log(`- Escaladas severas disparadas: ${stats.escalationsCount}`);

console.log('\n--- DISTRIBUIÇÃO POR PERFIL DE NOLAN ---');
for (const [prof, count] of Object.entries(stats.eventsByProfile)) {
  const pct = ((count / stats.totalIdeologicalEvents) * 100).toFixed(1);
  console.log(`  ${prof.padEnd(14)}: ${count.toString().padStart(5)} ocorrências (${pct}%)`);
}

console.log('\n--- DISTRIBUIÇÃO POR SEVERIDADE ---');
for (const [sev, count] of Object.entries(stats.eventsBySeverity)) {
  const pct = ((count / stats.totalIdeologicalEvents) * 100).toFixed(1);
  console.log(`  ${sev.padEnd(10)}: ${count.toString().padStart(5)} ocorrências (${pct}%)`);
}

console.log('\n--- QUALIDADE DE VIDA MÉDIA FINAL POR ARQUÉTIPO (APÓS 10 ANOS) ---');
for (const [arch, data] of Object.entries(stats.qolByProfile)) {
  const avgQol = (data.sum / Math.max(1, data.count)).toFixed(1);
  console.log(`  ${arch.padEnd(14)}: ${avgQol}/100 (amostras: ${data.count})`);
}

console.log('\n--- FREQUÊNCIA POR FAMÍLIA DE RISCO (KOYZIS) ---');
const sortedFamilies = Object.entries(stats.eventsByFamily).sort((a, b) => b[1] - a[1]);
for (const [fam, count] of sortedFamilies) {
  console.log(`  ${fam.padEnd(28)}: ${count}`);
}

console.log('\n--- TOP 5 EVENTOS MAIS FREQUENTES ---');
const sortedEvents = Object.entries(stats.eventFrequency).sort((a, b) => b[1] - a[1]);
for (const [evId, count] of sortedEvents.slice(0, 5)) {
  console.log(`  ${evId.padEnd(38)}: ${count}`);
}

console.log('\n' + '='.repeat(70));
if (
  ideologicalPct >= 18 &&
  ideologicalPct <= 32 &&
  stats.cooldownViolations === 0 &&
  stats.nanCount === 0 &&
  isDeterministic
) {
  console.log('RESULTADO FINAL: APROVADO EM TODOS OS CRITÉRIOS DE BALANCEAMENTO!');
} else {
  console.log('RESULTADO FINAL: ATENÇÃO - NECESSÁRIO AJUSTE DE PARÂMETROS.');
}
console.log('='.repeat(70));
