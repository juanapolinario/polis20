/**
 * Gerador de Números Pseudoaleatórios (PRNG) Determinístico
 * Baseado no algoritmo Mulberry32 com gerador de hash cyrb53 para sementes em texto.
 */

// Gera um hash inteiro de 32 bits a partir de qualquer string ou número
export function hashString(str) {
  const s = String(str);
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c64e6d ^ 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0);
}

// Cria uma instância determinística do Mulberry32
export function createRNG(seedInput) {
  let seed = typeof seedInput === 'number' && Number.isInteger(seedInput)
    ? seedInput >>> 0
    : hashString(seedInput || 'HorizontesCivicos_2026');

  // Função interna de avanço de estado mulberry32
  function next() {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    // Retorna número float entre [0, 1)
    next,
    
    // Retorna número float entre [min, max)
    range(min, max) {
      return min + next() * (max - min);
    },

    // Retorna número inteiro entre [min, max]
    rangeInt(min, max) {
      return Math.floor(min + next() * (max - min + 1));
    },

    // Escolhe aleatoriamente um item de um array
    choice(arr) {
      if (!arr || arr.length === 0) return null;
      const idx = Math.floor(next() * arr.length);
      return arr[idx];
    },

    // Embaralha um array sem mutar o original
    shuffle(arr) {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },

    // Retorna valor aproximado de distribuição normal (Box-Muller)
    gaussian(mean = 0, stdev = 1) {
      let u = 1 - next();
      let v = next();
      let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      return mean + z * stdev;
    },

    // Obtém o estado atual da semente para serialização
    getState() {
      return seed;
    },

    // Restaura o estado da semente
    setState(savedSeed) {
      seed = savedSeed >>> 0;
    }
  };
}

// Clampa um valor numérico entre limites min e max
export function clamp(val, min = 0, max = 100) {
  return Math.min(Math.max(val, min), max);
}
