/**
 * Horizontes Cívicos - Controlador Principal da Aplicação
 * Conecta motor de simulação, persistência, interface do usuário e PRNG determinístico.
 */

import { createRNG } from './rng.js';
import { generateInitialCities } from './data.js';
import { createInitialGameState, advanceMonth, migratePlayerToCity } from './simulation.js';
import { saveGame, loadGame, hasSavedGame, clearSave, exportGameToJson, importGameFromJson } from './storage.js';
import { UIManager } from './ui.js';
import { sfx } from './audio.js';

class AppController {
  constructor() {
    this.gameState = null;
    this.rng = null;

    // Inicializa o gerenciador de UI passando os callbacks de ação
    this.ui = new UIManager({
      onCreateWorld: (params) => this.handleCreateWorld(params),
      onAdvanceMonth: () => this.handleAdvanceMonth(),
      onAdvanceYear: () => this.handleAdvanceYear(),
      onMigrate: (targetCityId) => this.handleMigrate(targetCityId),
      onSave: () => this.handleSave(),
      onExport: () => this.handleExport(),
      onImport: (file) => this.handleImport(file),
      onReset: () => this.handleReset(),
      onLoadSaved: () => this.handleLoadSaved()
    });
  }

  init() {
    this.ui.init();

    // Verifica se já existe um jogo salvo no navegador
    if (hasSavedGame()) {
      const btnContinue = document.getElementById('btn-continue-saved');
      if (btnContinue) {
        btnContinue.classList.remove('hidden');
      }
    }
  }

  // Cria um novo mundo a partir das opções da tela inicial
  handleCreateWorld({ cityName, citizenName, seed, econFreedom, personalFreedom }) {
    try {
      this.rng = createRNG(seed);
      const cities = generateInitialCities(cityName, econFreedom, personalFreedom, this.rng);
      this.gameState = createInitialGameState(cities, seed, citizenName);

      // Salva automaticamente o estado inicial
      saveGame(this.gameState, this.rng.getState());

      // Transiciona a interface para o simulador
      this.ui.showScreen('main');
      this.ui.render(this.gameState);
      this.ui.showToast(`Mundo "${cityName}" iniciado com sucesso!`, 'success');
    } catch (err) {
      console.error('Erro ao criar mundo:', err);
      this.ui.showToast(`Erro ao criar o mundo: ${err.message}`, 'error');
    }
  }

  // Avança 1 mês
  handleAdvanceMonth() {
    if (!this.gameState || !this.rng) return;
    try {
      this.gameState = advanceMonth(this.gameState, this.rng);
      
      // Auto-save no final do mês
      saveGame(this.gameState, this.rng.getState());

      this.ui.render(this.gameState);
    } catch (err) {
      console.error('Erro ao avançar o mês:', err);
      this.ui.showToast('Erro ao processar o avanço mensal.', 'error');
    }
  }

  // Avança 12 meses consecutivos
  handleAdvanceYear() {
    if (!this.gameState || !this.rng) return;
    try {
      for (let i = 0; i < 12; i++) {
        this.gameState = advanceMonth(this.gameState, this.rng);
      }
      saveGame(this.gameState, this.rng.getState());
      this.ui.render(this.gameState);
      this.ui.showToast(`Avançados 12 meses com sucesso! Agora estamos no Ano ${this.gameState.year}.`, 'success');
    } catch (err) {
      console.error('Erro ao avançar o ano:', err);
      this.ui.showToast('Erro durante a simulação de 12 meses.', 'error');
    }
  }

  // Realiza a migração do jogador para outra cidade
  handleMigrate(destinationCityId) {
    if (!this.gameState) return;
    const result = migratePlayerToCity(this.gameState, destinationCityId);
    if (!result.success) {
      sfx.play('error');
      this.ui.showToast(result.reason, 'warning');
      return;
    }

    sfx.play('migrate');

    // Aplica o novo estado intermediário e avança 1 mês como tempo de mudança
    this.gameState = result.state;
    this.handleAdvanceMonth();

    const destCity = this.gameState.cities.find(c => c.id === destinationCityId);
    this.ui.showToast(`Você migrou com sucesso para ${destCity.name}!`, 'success');
    this.ui.switchTab('tab-city'); // Redireciona para a aba da cidade atual
  }

  // Salvar manual
  handleSave() {
    if (!this.gameState || !this.rng) return;
    const res = saveGame(this.gameState, this.rng.getState());
    if (res.success) {
      this.ui.showToast('Partida salva com sucesso no navegador.', 'success');
    } else {
      this.ui.showToast(`Falha ao salvar: ${res.error}`, 'error');
    }
  }

  // Exportar JSON
  handleExport() {
    if (!this.gameState || !this.rng) return;
    exportGameToJson(this.gameState, this.rng.getState());
    this.ui.showToast('Arquivo de salvamento exportado.', 'info');
  }

  // Importar JSON
  async handleImport(file) {
    try {
      const payload = await importGameFromJson(file);
      this.gameState = payload.state;
      this.rng = createRNG(payload.rngState || payload.state.seed);
      if (payload.rngState) {
        this.rng.setState(payload.rngState);
      }

      saveGame(this.gameState, this.rng.getState());
      this.ui.showScreen('main');
      this.ui.render(this.gameState);
      this.ui.showToast('Partida importada e restaurada com sucesso!', 'success');
    } catch (err) {
      console.error('Falha na importação:', err);
      this.ui.showToast(err.message, 'error');
    }
  }

  // Continua partida existente
  handleLoadSaved() {
    const saved = loadGame();
    if (!saved) {
      this.ui.showToast('Nenhum salvamento válido encontrado.', 'warning');
      return;
    }
    this.gameState = saved.state;
    this.rng = createRNG(saved.rngState || saved.state.seed);
    if (saved.rngState) {
      this.rng.setState(saved.rngState);
    }

    this.ui.showScreen('main');
    this.ui.render(this.gameState);
    this.ui.showToast(`Partida retomada no Mês ${this.gameState.month}, Ano ${this.gameState.year}.`, 'info');
  }

  // Reinicia o jogo (Novo Mundo)
  handleReset() {
    clearSave();
    this.gameState = null;
    this.rng = null;
    this.ui.showScreen('start');
    const btnContinue = document.getElementById('btn-continue-saved');
    if (btnContinue) btnContinue.classList.add('hidden');
    this.ui.showToast('Mundo reiniciado. Configure uma nova cidade inicial.', 'info');
  }
}

// Inicialização automática quando o DOM carregar
window.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});
