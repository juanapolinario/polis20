/**
 * Horizontes Cívicos - Gerenciador de Persistência
 * Trata salvamento no localStorage, exportação e importação em JSON com validação de schema.
 */

const STORAGE_KEY = 'horizontes_civicos_save_v1';
const CURRENT_VERSION = 1;

// Salva o estado atual e o estado do gerador pseudoaleatório no localStorage
export function saveGame(state, rngState) {
  try {
    const payload = {
      version: CURRENT_VERSION,
      savedAt: new Date().toISOString(),
      rngState: rngState,
      state: state
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return { success: true };
  } catch (err) {
    console.error('Erro ao salvar partida:', err);
    return { success: false, error: err.message };
  }
}

// Carrega a partida salva do localStorage
export function loadGame() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    const validation = validateSaveData(parsed);
    if (!validation.valid) {
      console.warn('Dados salvos inválidos:', validation.error);
      return null;
    }
    return parsed;
  } catch (err) {
    console.error('Erro ao recuperar partida salva:', err);
    return null;
  }
}

// Verifica se existe um salvamento válido disponível
export function hasSavedGame() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;
    const parsed = JSON.parse(data);
    return validateSaveData(parsed).valid;
  } catch {
    return false;
  }
}

// Limpa o salvamento do localStorage
export function clearSave() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('Erro ao limpar salvamento:', err);
    return false;
  }
}

// Exporta a partida como arquivo JSON para download pelo navegador
export function exportGameToJson(state, rngState) {
  const payload = {
    version: CURRENT_VERSION,
    exportedAt: new Date().toISOString(),
    rngState: rngState,
    state: state
  };
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `horizontes_civicos_ano${state.year}_mes${state.month}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Importa e valida um arquivo JSON fornecido pelo jogador
export function importGameFromJson(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('Nenhum arquivo selecionado.'));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsed = JSON.parse(text);
        const validation = validateSaveData(parsed);
        if (!validation.valid) {
          return reject(new Error(`Arquivo de salvamento inválido: ${validation.error}`));
        }
        resolve(parsed);
      } catch (err) {
        reject(new Error('Falha ao processar arquivo JSON. Verifique se o formato está correto.'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo físico.'));
    reader.readAsText(file);
  });
}

// Validador de integridade do payload de salvamento
export function validateSaveData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Objeto de dados ausente ou nulo.' };
  }
  if (typeof data.version !== 'number' || data.version < 1) {
    return { valid: false, error: 'Versão de salvamento não reconhecida.' };
  }
  if (!data.state || typeof data.state !== 'object') {
    return { valid: false, error: 'Estrutura de estado ausente.' };
  }

  const s = data.state;
  if (!Array.isArray(s.cities) || s.cities.length !== 20) {
    return { valid: false, error: `O mundo deve conter exatamente 20 cidades (encontradas: ${s.cities ? s.cities.length : 0}).` };
  }
  if (typeof s.month !== 'number' || typeof s.year !== 'number') {
    return { valid: false, error: 'Informações de data (mês/ano) ausentes.' };
  }
  if (typeof s.currentCityId !== 'number') {
    return { valid: false, error: 'Cidade de residência inválida.' };
  }
  if (typeof s.credits !== 'number') {
    return { valid: false, error: 'Saldo de créditos ausente.' };
  }

  // Validação amostral de integridade dos indicadores da primeira cidade
  const firstCity = s.cities[0];
  if (!firstCity.indicators || typeof firstCity.indicators.economy !== 'number') {
    return { valid: false, error: 'Estrutura de indicadores de cidades corrompida.' };
  }

  return { valid: true };
}
