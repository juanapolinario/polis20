/**
 * Horizontes Cívicos - Gerenciador de Interface de Usuário (UI)
 * Gerencia a tela inicial com Diagrama de Nolan interativo, abas, renderização de componentes,
 * mapa abstrato, grade de cidades, comparações, diário e modais.
 */

import { INDICATOR_DEFS, POLITICAL_ARCHETYPES, classifyPolitics, GEOGRAPHIES, SPECIALIZATIONS } from './data.js';
import { renderCitySvg } from './svg.js';
import { calculateMigrationCost, calculateCityDistance } from './simulation.js';

export class UIManager {
  constructor(handlers) {
    this.handlers = handlers; // { onCreateWorld, onAdvanceMonth, onAdvanceYear, onMigrate, onSave, onExport, onImport, onReset, onLoadSaved }
    this.activeTab = 'tab-city';
    this.selectedCompareCityIds = [0, 1]; // IDs default para comparação
    this.worldFilter = { archetype: 'all', search: '', sort: 'qol' };
    this.inspectingCityId = null;
    this.nolanEcon = 50;
    this.nolanPersonal = 50;
  }

  // Inicializa os listeners estáticos da interface
  init() {
    this.setupStartScreenEvents();
    this.setupNavigationEvents();
    this.setupHeaderEvents();
    this.setupModalEvents();
  }

  // Configura a tela de criação do mundo e o Diagrama de Nolan interativo
  setupStartScreenEvents() {
    const econSlider = document.getElementById('nolan-econ-slider');
    const personalSlider = document.getElementById('nolan-personal-slider');
    const econVal = document.getElementById('nolan-econ-val');
    const personalVal = document.getElementById('nolan-personal-val');
    const nolanChart = document.getElementById('nolan-chart');
    const nolanSvg = document.getElementById('nolan-svg');
    const markerGroup = document.getElementById('nolan-marker-group');

    const updateNolanUI = (econ, personal) => {
      this.nolanEcon = Math.round(Math.min(Math.max(econ, 0), 100));
      this.nolanPersonal = Math.round(Math.min(Math.max(personal, 0), 100));

      if (econSlider) econSlider.value = this.nolanEcon;
      if (personalSlider) personalSlider.value = this.nolanPersonal;
      if (econVal) econVal.textContent = this.nolanEcon;
      if (personalVal) personalVal.textContent = this.nolanPersonal;

      // Converte coordenadas (econ, personal) de 0 a 100 para a geometria do Losango de Nolan
      // Vértice Superior (100, 100) -> (200, 40)
      // Vértice Inferior (0, 0)     -> (200, 360)
      // Vértice Esquerdo (0, 100)   -> (40, 200)
      // Vértice Direito (100, 0)    -> (360, 200)
      // Centro (50, 50)             -> (200, 200)
      const svgX = 200 + 1.6 * (this.nolanEcon - this.nolanPersonal);
      const svgY = 360 - 1.6 * (this.nolanEcon + this.nolanPersonal);

      if (markerGroup) {
        markerGroup.setAttribute('transform', `translate(${svgX.toFixed(1)}, ${svgY.toFixed(1)})`);
      }

      // Atualiza a classificação resultante
      const archetype = classifyPolitics(this.nolanEcon, this.nolanPersonal);
      const titleEl = document.getElementById('start-archetype-name');
      const descEl = document.getElementById('start-archetype-desc');
      const sumEl = document.getElementById('start-archetype-summary');
      if (titleEl) titleEl.textContent = archetype.name;
      if (descEl) descEl.textContent = archetype.description;
      if (sumEl) sumEl.textContent = archetype.summary;

      // Destaca a região ativa no SVG
      document.querySelectorAll('.nolan-region').forEach(el => el.classList.remove('region-active'));
      const activeRegionEl = document.getElementById(`nolan-region-${archetype.id}`);
      if (activeRegionEl) activeRegionEl.classList.add('region-active');
    };

    if (econSlider) {
      econSlider.addEventListener('input', (e) => updateNolanUI(Number(e.target.value), this.nolanPersonal));
    }
    if (personalSlider) {
      personalSlider.addEventListener('input', (e) => updateNolanUI(this.nolanEcon, Number(e.target.value)));
    }

    // Suporte a clique direto e arrasto no gráfico de Nolan (Losango clássico)
    if (nolanChart && nolanSvg) {
      const handleChartInteract = (e) => {
        const rect = nolanSvg.getBoundingClientRect();
        const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

        // Mapeia coordenadas da tela para o viewBox 400x400 do SVG
        const svgClickX = ((clientX - rect.left) / rect.width) * 400;
        const svgClickY = ((clientY - rect.top) / rect.height) * 400;

        // Inverte a transformação geométrica do Losango de Nolan:
        // X = 200 + 160(e - p)  =>  e - p = (X - 200) / 160
        // Y = 360 - 160(e + p)  =>  e + p = (360 - Y) / 160
        // e = (160 + X - Y) / 320
        // p = (560 - X - Y) / 320
        const eFloat = (160 + svgClickX - svgClickY) / 320;
        const pFloat = (560 - svgClickX - svgClickY) / 320;

        const newEcon = Math.round(Math.min(Math.max(eFloat * 100, 0), 100));
        const newPersonal = Math.round(Math.min(Math.max(pFloat * 100, 0), 100));

        updateNolanUI(newEcon, newPersonal);
      };

      let isDragging = false;
      nolanChart.addEventListener('mousedown', (e) => {
        isDragging = true;
        handleChartInteract(e);
      });
      window.addEventListener('mousemove', (e) => {
        if (isDragging) handleChartInteract(e);
      });
      window.addEventListener('mouseup', () => { isDragging = false; });

      // Suporte a toque móvel
      nolanChart.addEventListener('touchstart', (e) => {
        isDragging = true;
        handleChartInteract(e);
      }, { passive: true });
      nolanChart.addEventListener('touchmove', (e) => {
        if (isDragging) handleChartInteract(e);
      }, { passive: true });
      nolanChart.addEventListener('touchend', () => { isDragging = false; });

      // Acessibilidade por teclado no Losango de Nolan
      nolanChart.addEventListener('keydown', (e) => {
        let step = e.shiftKey ? 5 : 2;
        if (e.key === 'ArrowRight') { updateNolanUI(this.nolanEcon + step, this.nolanPersonal); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { updateNolanUI(this.nolanEcon - step, this.nolanPersonal); e.preventDefault(); }
        if (e.key === 'ArrowUp') { updateNolanUI(this.nolanEcon, this.nolanPersonal + step); e.preventDefault(); }
        if (e.key === 'ArrowDown') { updateNolanUI(this.nolanEcon, this.nolanPersonal - step); e.preventDefault(); }
      });
    }

    // Botão Criar Mundo
    const btnCreate = document.getElementById('btn-create-world');
    if (btnCreate) {
      btnCreate.addEventListener('click', () => {
        const cityName = document.getElementById('input-city-name')?.value?.trim() || 'Nova Esperança';
        const citizenName = document.getElementById('input-citizen-name')?.value?.trim() || 'Cidadão Observador';
        const seed = document.getElementById('input-seed')?.value?.trim() || `Mundo_${Date.now()}`;
        this.handlers.onCreateWorld({
          cityName,
          citizenName,
          seed,
          econFreedom: this.nolanEcon,
          personalFreedom: this.nolanPersonal
        });
      });
    }

    // Botão Continuar Jogo Salvo
    const btnContinue = document.getElementById('btn-continue-saved');
    if (btnContinue) {
      btnContinue.addEventListener('click', () => {
        this.handlers.onLoadSaved();
      });
    }

    // Executa primeira atualização com os valores padrões
    updateNolanUI(50, 50);
  }

  // Configura a barra de navegação entre as 4 abas principais
  setupNavigationEvents() {
    const navButtons = document.querySelectorAll('.nav-tab-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const active = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    document.querySelectorAll('.tab-content-panel').forEach(panel => {
      panel.classList.toggle('hidden', panel.id !== tabId);
    });

    // Se mudou para comparar ou mundo, dispara re-render dos componentes dinâmicos
    if (this.currentGameState) {
      if (tabId === 'tab-compare') this.renderCompareTab(this.currentGameState);
      if (tabId === 'tab-world') this.renderWorldTab(this.currentGameState);
      if (tabId === 'tab-diary') this.renderDiaryTab(this.currentGameState);
    }
  }

  // Configura botões de salvar, avançar tempo, exportar, importar e reiniciar
  setupHeaderEvents() {
    const btnAdv1 = document.getElementById('btn-advance-1m');
    const btnAdv12 = document.getElementById('btn-advance-12m');
    const btnSave = document.getElementById('btn-quick-save');
    const btnExport = document.getElementById('btn-export-json');
    const btnImport = document.getElementById('btn-import-json');
    const fileImportInput = document.getElementById('input-file-import');
    const btnReset = document.getElementById('btn-new-world');

    if (btnAdv1) btnAdv1.addEventListener('click', () => this.handlers.onAdvanceMonth());
    if (btnAdv12) {
      btnAdv12.addEventListener('click', () => {
        this.openModal('modal-confirm-advance12');
      });
    }

    const btnConfirm12m = document.getElementById('btn-confirm-advance12');
    if (btnConfirm12m) {
      btnConfirm12m.addEventListener('click', () => {
        this.closeModal('modal-confirm-advance12');
        this.handlers.onAdvanceYear();
      });
    }

    if (btnSave) btnSave.addEventListener('click', () => this.handlers.onSave());
    if (btnExport) btnExport.addEventListener('click', () => this.handlers.onExport());

    if (btnImport && fileImportInput) {
      btnImport.addEventListener('click', () => fileImportInput.click());
      fileImportInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
          this.handlers.onImport(file);
          fileImportInput.value = ''; // reseta
        }
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.openModal('modal-confirm-reset');
      });
    }

    const btnConfirmReset = document.getElementById('btn-confirm-reset');
    if (btnConfirmReset) {
      btnConfirmReset.addEventListener('click', () => {
        this.closeModal('modal-confirm-reset');
        this.handlers.onReset();
      });
    }
  }

  // Gerenciamento de modais
  setupModalEvents() {
    document.querySelectorAll('.modal-backdrop, .btn-modal-close').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          const modal = el.closest('.modal-container') || el;
          modal.classList.add('hidden');
        }
      });
    });

    // Fechar ao pressionar ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-container:not(.hidden)').forEach(m => m.classList.add('hidden'));
      }
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }

  // Notificação Toast não intrusiva
  showToast(message, type = 'info') {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast-notice toast-${type} show`;
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.className = 'toast-notice hidden';
    }, 3800);
  }

  // Mostra ou esconde tela inicial vs tela do jogo
  showScreen(screenName) {
    const startScreen = document.getElementById('screen-start');
    const mainScreen = document.getElementById('screen-main');

    if (screenName === 'main') {
      startScreen?.classList.add('hidden');
      mainScreen?.classList.remove('hidden');
    } else {
      mainScreen?.classList.add('hidden');
      startScreen?.classList.remove('hidden');
    }
  }

  // Renderiza toda a interface com o estado mais recente
  render(state) {
    this.currentGameState = state;
    this.renderHeader(state);
    this.renderCityTab(state);
    if (this.activeTab === 'tab-world') this.renderWorldTab(state);
    if (this.activeTab === 'tab-compare') this.renderCompareTab(state);
    if (this.activeTab === 'tab-diary') this.renderDiaryTab(state);
  }

  // Renderiza o cabeçalho superior
  renderHeader(state) {
    const dateEl = document.getElementById('hdr-date');
    const cityEl = document.getElementById('hdr-current-city');
    const creditsEl = document.getElementById('hdr-credits');
    const citizenEl = document.getElementById('hdr-citizen-name');

    const currentCity = state.cities.find(c => c.id === state.currentCityId) || state.cities[0];

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const monthStr = monthNames[state.month - 1] || `Mês ${state.month}`;

    if (dateEl) dateEl.textContent = `${monthStr}, Ano ${state.year}`;
    if (cityEl) cityEl.textContent = currentCity.name;
    if (citizenEl) citizenEl.textContent = state.citizenName || 'Cidadão';

    if (creditsEl) {
      const delta = state.monthlyCreditsDelta || 0;
      const sign = delta >= 0 ? `+${delta}` : `${delta}`;
      const deltaColor = delta >= 0 ? 'text-emerald-400' : 'text-rose-400';
      creditsEl.innerHTML = `
        <span class="font-bold">${state.credits}</span>
        <span class="text-xs text-slate-400">créditos</span>
        <span class="text-xs ${deltaColor} font-mono">(${sign}/mês)</span>
      `;
    }
  }

  // Renderiza a aba "Minha Cidade"
  renderCityTab(state) {
    const currentCity = state.cities.find(c => c.id === state.currentCityId) || state.cities[0];
    const containerSvg = document.getElementById('city-svg-container');
    const cityNameEl = document.getElementById('mycity-name');
    const cityGeoSpecEl = document.getElementById('mycity-geospec');
    const cityArchetypeEl = document.getElementById('mycity-archetype');
    const cityPopEl = document.getElementById('mycity-population');
    const cityQolEl = document.getElementById('mycity-qol');
    const cityCostEl = document.getElementById('mycity-cost');
    const cityExplEl = document.getElementById('mycity-explanation');
    const indicatorsGrid = document.getElementById('mycity-indicators-grid');
    const recentEventsList = document.getElementById('mycity-recent-events');

    // 1. Ilustração SVG Dinâmica
    if (containerSvg) {
      containerSvg.innerHTML = renderCitySvg(currentCity);
    }

    // 2. Metadados Gerais
    if (cityNameEl) cityNameEl.textContent = currentCity.name;
    if (cityGeoSpecEl) {
      cityGeoSpecEl.textContent = `${currentCity.geographyName} • Especialização em ${currentCity.specializationName}`;
    }
    if (cityArchetypeEl) {
      cityArchetypeEl.innerHTML = `
        <span class="badge badge-${currentCity.archetypeId}">${currentCity.archetypeName}</span>
        <span class="text-xs text-slate-400 ml-2">Econ: ${currentCity.econFreedom} | Pessoal: ${currentCity.civicFreedom}</span>
      `;
    }
    if (cityPopEl) {
      const growthSign = currentCity.populationGrowth >= 0 ? `+${currentCity.populationGrowth.toLocaleString('pt-BR')}` : currentCity.populationGrowth.toLocaleString('pt-BR');
      cityPopEl.innerHTML = `${currentCity.population.toLocaleString('pt-BR')} <span class="text-xs text-slate-400">hab (${growthSign}/mês)</span>`;
    }
    if (cityQolEl) {
      cityQolEl.textContent = `${currentCity.qualityOfLife} / 100`;
    }
    if (cityCostEl) {
      cityCostEl.textContent = `${currentCity.costOfLiving} pts`;
    }
    const explBox = document.querySelector('.city-monthly-explanation-box');
    const hasActiveEvent = currentCity.recentEvents && currentCity.recentEvents.length > 0 &&
      currentCity.recentEvents[0].month === state.month && currentCity.recentEvents[0].year === state.year;

    if (explBox) {
      explBox.classList.toggle('has-event', !!hasActiveEvent);
      const title = explBox.querySelector('.explanation-title');
      if (title) {
        title.textContent = hasActiveEvent ? 'Alerta de Evento Impactante' : 'Dinâmica do Mês';
      }
    }

    if (cityExplEl) {
      cityExplEl.textContent = currentCity.lastMonthExplanation || 'Cidade em equilíbrio institucional relativo.';
    }

    // 3. Grid de Indicadores com Barras e Símbolos Acessíveis (↑, →, ↓)
    if (indicatorsGrid) {
      indicatorsGrid.innerHTML = Object.entries(INDICATOR_DEFS).map(([key, def]) => {
        const val = currentCity.indicators[key] ?? 50;
        const trend = currentCity.trends[key] ?? 0;
        
        let trendSymbol = '→';
        let trendClass = 'trend-stable';
        let trendAria = 'estável';
        if (trend > 0) {
          trendSymbol = '↑';
          trendClass = 'trend-up';
          trendAria = 'em alta';
        } else if (trend < 0) {
          trendSymbol = '↓';
          trendClass = 'trend-down';
          trendAria = 'em queda';
        }

        return `
          <div class="indicator-card">
            <div class="indicator-header">
              <span class="indicator-name">${def.name}</span>
              <div class="indicator-val-box">
                <span class="indicator-val font-mono">${val}</span>
                <span class="trend-symbol ${trendClass}" aria-label="Tendência: ${trendAria}">${trendSymbol}</span>
              </div>
            </div>
            <div class="indicator-bar-track" role="progressbar" aria-valuenow="${val}" aria-valuemin="0" aria-valuemax="100" aria-label="${def.name}: ${val}">
              <div class="indicator-bar-fill" style="width: ${val}%;"></div>
            </div>
            <p class="indicator-desc">${def.shortDesc}</p>
          </div>
        `;
      }).join('');
    }

    // 4. Acontecimentos Recentes da Cidade
    if (recentEventsList) {
      if (!currentCity.recentEvents || currentCity.recentEvents.length === 0) {
        recentEventsList.innerHTML = '<p class="text-sm text-slate-400 italic">Nenhum evento extraordinário nos últimos meses.</p>';
      } else {
        recentEventsList.innerHTML = currentCity.recentEvents.map((ev, idx) => `
          <div class="event-feed-item ${idx === 0 && hasActiveEvent ? 'event-item-latest' : ''}">
            <div class="event-feed-header">
              <span class="badge badge-category badge-cat-${ev.category}">${ev.category.toUpperCase()}</span>
              <span class="text-xs text-slate-400">Mês ${ev.month}, Ano ${ev.year}</span>
              ${idx === 0 && hasActiveEvent ? '<span class="badge badge-cat-global ml-auto">IMPACTO RECENTE</span>' : ''}
            </div>
            <h4 class="event-feed-title">${ev.title}</h4>
            <p class="event-feed-text">${ev.text}</p>
            ${ev.explanation ? `<p class="event-feed-explanation"><strong>Causas:</strong> ${ev.explanation}</p>` : ''}
          </div>
        `).join('');
      }
    }
  }

  // Renderiza a aba "Mundo" com Mapa Esquemático e Grade de Cartões
  renderWorldTab(state) {
    const mapContainer = document.getElementById('world-map-svg');
    const cardsGrid = document.getElementById('world-cards-grid');
    const filterSelect = document.getElementById('world-filter-archetype');
    const sortSelect = document.getElementById('world-sort-by');
    const searchInput = document.getElementById('world-search-input');

    // Configura listeners de filtro/ordenação uma vez
    if (filterSelect && !filterSelect.dataset.hasListener) {
      filterSelect.addEventListener('change', (e) => {
        this.worldFilter.archetype = e.target.value;
        this.renderWorldTab(this.currentGameState);
      });
      filterSelect.dataset.hasListener = 'true';
    }
    if (sortSelect && !sortSelect.dataset.hasListener) {
      sortSelect.addEventListener('change', (e) => {
        this.worldFilter.sort = e.target.value;
        this.renderWorldTab(this.currentGameState);
      });
      sortSelect.dataset.hasListener = 'true';
    }
    if (searchInput && !searchInput.dataset.hasListener) {
      searchInput.addEventListener('input', (e) => {
        this.worldFilter.search = e.target.value.toLowerCase();
        this.renderWorldTab(this.currentGameState);
      });
      searchInput.dataset.hasListener = 'true';
    }

    // Filtra cidades
    let filtered = state.cities.filter(city => {
      if (this.worldFilter.archetype !== 'all' && city.archetypeId !== this.worldFilter.archetype) return false;
      if (this.worldFilter.search && !city.name.toLowerCase().includes(this.worldFilter.search)) return false;
      return true;
    });

    // Ordena cidades
    filtered.sort((a, b) => {
      switch (this.worldFilter.sort) {
        case 'qol': return b.qualityOfLife - a.qualityOfLife;
        case 'economy': return b.indicators.economy - a.indicators.economy;
        case 'safety': return b.indicators.safety - a.indicators.safety;
        case 'freedom': return b.indicators.personalFreedom - a.indicators.personalFreedom;
        case 'equality': return b.indicators.equality - a.indicators.equality;
        case 'population': return b.population - a.population;
        default: return a.id - b.id;
      }
    });

    // 1. Mapa Abstrato Interativo (1000x800)
    if (mapContainer) {
      const currentCity = state.cities.find(c => c.id === state.currentCityId);
      const nodesSvg = state.cities.map(city => {
        const isCurrent = city.id === state.currentCityId;
        const color = isCurrent ? '#38bdf8' : '#94a3b8';
        const r = isCurrent ? 14 : 9;
        
        return `
          <g class="map-city-node" data-city-id="${city.id}" style="cursor: pointer;" tabindex="0" role="button" aria-label="Cidade ${city.name}">
            <circle cx="${city.mapPos.x}" cy="${city.mapPos.y}" r="${r}" fill="${color}" stroke="#0f172a" stroke-width="3" />
            ${isCurrent ? `<circle cx="${city.mapPos.x}" cy="${city.mapPos.y}" r="${r + 7}" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 2" />` : ''}
            <text x="${city.mapPos.x}" y="${city.mapPos.y + 22}" text-anchor="middle" fill="#e2e8f0" font-size="12" font-family="system-ui" font-weight="${isCurrent ? 'bold' : 'normal'}">${city.name}</text>
          </g>
        `;
      }).join('');

      // Linhas suaves de conexão de rotas comerciais
      let routesSvg = '';
      for (let i = 0; i < state.cities.length - 1; i++) {
        const c1 = state.cities[i];
        const c2 = state.cities[i + 1];
        routesSvg += `<line x1="${c1.mapPos.x}" y1="${c1.mapPos.y}" x2="${c2.mapPos.x}" y2="${c2.mapPos.y}" stroke="#1e293b" stroke-width="1" stroke-dasharray="3 3" />`;
      }

      mapContainer.innerHTML = `
        <svg viewBox="0 0 1000 800" class="world-map-viewport" role="img" aria-label="Mapa cartográfico com as 20 cidades">
          <rect width="1000" height="800" fill="#0c1322" rx="10" />
          <g class="map-grid" opacity="0.1">
            ${Array.from({ length: 9 }).map((_, i) => `<line x1="${(i+1)*100}" y1="0" x2="${(i+1)*100}" y2="800" stroke="#94a3b8" />`).join('')}
            ${Array.from({ length: 7 }).map((_, i) => `<line x1="0" y1="${(i+1)*100}" x2="1000" y2="${(i+1)*100}" stroke="#94a3b8" />`).join('')}
          </g>
          ${routesSvg}
          ${nodesSvg}
        </svg>
      `;

      // Cliques no mapa para abrir modal de detalhes
      mapContainer.querySelectorAll('.map-city-node').forEach(node => {
        node.addEventListener('click', () => {
          const cityId = Number(node.getAttribute('data-city-id'));
          this.openCityInspectModal(cityId);
        });
      });
    }

    // 2. Grade de Cartões
    if (cardsGrid) {
      cardsGrid.innerHTML = filtered.map(city => {
        const isCurrent = city.id === state.currentCityId;
        const currentCity = state.cities.find(c => c.id === state.currentCityId);
        const dist = calculateCityDistance(currentCity, city);
        const migCost = calculateMigrationCost(currentCity, city);

        return `
          <div class="world-city-card ${isCurrent ? 'card-current-residence' : ''}">
            <div class="card-header">
              <div>
                <h3 class="card-title">${city.name}</h3>
                <span class="badge badge-${city.archetypeId}">${city.archetypeName}</span>
              </div>
              ${isCurrent ? '<span class="badge badge-current">Sua Residência</span>' : ''}
            </div>

            <p class="card-geospec">${city.geographyName} • ${city.specializationName}</p>

            <div class="card-stats-row">
              <div class="stat-col">
                <span class="stat-lbl">Qualidade de Vida</span>
                <span class="stat-val font-mono">${city.qualityOfLife}</span>
              </div>
              <div class="stat-col">
                <span class="stat-lbl">População</span>
                <span class="stat-val font-mono">${(city.population / 1000).toFixed(0)}k</span>
              </div>
              <div class="stat-col">
                <span class="stat-lbl">Custo Vida</span>
                <span class="stat-val font-mono">${city.costOfLiving}</span>
              </div>
            </div>

            <div class="card-actions">
              <button class="btn btn-outline btn-sm btn-inspect-city" data-city-id="${city.id}">Ver Detalhes</button>
              ${!isCurrent ? `
                <button class="btn btn-primary btn-sm btn-migrate-quick" data-city-id="${city.id}" title="Distância: ${dist}km | Custo: ${migCost} créditos">
                  Mudar (${migCost} cr)
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');

      cardsGrid.querySelectorAll('.btn-inspect-city').forEach(btn => {
        btn.addEventListener('click', () => {
          const cityId = Number(btn.getAttribute('data-city-id'));
          this.openCityInspectModal(cityId);
        });
      });

      cardsGrid.querySelectorAll('.btn-migrate-quick').forEach(btn => {
        btn.addEventListener('click', () => {
          const cityId = Number(btn.getAttribute('data-city-id'));
          this.handlers.onMigrate(cityId);
        });
      });
    }
  }

  // Abre modal de inspeção minuciosa e migração
  openCityInspectModal(cityId) {
    const city = this.currentGameState.cities.find(c => c.id === cityId);
    if (!city) return;
    const currentCity = this.currentGameState.cities.find(c => c.id === this.currentGameState.currentCityId);
    const isCurrent = city.id === currentCity.id;

    const modal = document.getElementById('modal-city-inspect');
    const content = document.getElementById('city-inspect-content');
    if (!modal || !content) return;

    const dist = calculateCityDistance(currentCity, city);
    const migCost = calculateMigrationCost(currentCity, city);
    const canAfford = this.currentGameState.credits >= migCost;

    // Vantagens e Dificuldades comparativas
    const advantages = [];
    const challenges = [];

    if (city.indicators.economy > currentCity.indicators.economy) advantages.push('Economia mais pujante e atração de investimentos.');
    else if (city.indicators.economy < currentCity.indicators.economy) challenges.push('Economia com menor dinamismo comercial.');

    if (city.costOfLiving < currentCity.costOfLiving) advantages.push('Custo de vida mais acessível para os moradores.');
    else if (city.costOfLiving > currentCity.costOfLiving) challenges.push('Custo de vida e aluguéis mais elevados.');

    if (city.indicators.safety > currentCity.indicators.safety) advantages.push('Índices de segurança e tranquilidade pública superiores.');
    else if (city.indicators.safety < currentCity.indicators.safety) challenges.push('Maior vulnerabilidade a episódios de criminalidade.');

    if (city.indicators.personalFreedom > currentCity.indicators.personalFreedom) advantages.push('Maior liberdade de expressão e autonomia individual.');
    else if (city.indicators.personalFreedom < currentCity.indicators.personalFreedom) challenges.push('Maior controle normativo e fiscalização cívica.');

    if (advantages.length === 0) advantages.push('Padrão de vida semelhante ao da sua cidade atual.');
    if (challenges.length === 0) challenges.push('Sem desvantagens evidentes em relação à residência atual.');

    content.innerHTML = `
      <div class="inspect-header">
        <div>
          <h2 class="inspect-title">${city.name}</h2>
          <p class="inspect-subtitle">${city.geographyName} • Especialização em ${city.specializationName}</p>
        </div>
        <span class="badge badge-${city.archetypeId}">${city.archetypeName}</span>
      </div>

      <div class="inspect-svg-preview">
        ${renderCitySvg(city)}
      </div>

      <div class="inspect-comparison-box">
        <h4>Comparativo com sua residência atual (${currentCity.name})</h4>
        <div class="inspect-metrics-grid">
          <div><strong>Distância:</strong> ${dist} km</div>
          <div><strong>Custo de Mudança:</strong> ${migCost} créditos</div>
          <div><strong>Seus Créditos:</strong> ${this.currentGameState.credits} créditos</div>
          <div><strong>Qualidade de Vida:</strong> ${city.qualityOfLife} (vs ${currentCity.qualityOfLife})</div>
        </div>

        <div class="pros-cons-grid">
          <div class="pros-box">
            <h5>Principais Vantagens</h5>
            <ul>${advantages.map(a => `<li>✓ ${a}</li>`).join('')}</ul>
          </div>
          <div class="cons-box">
            <h5>Principais Desafios</h5>
            <ul>${challenges.map(c => `<li>⚠ ${c}</li>`).join('')}</ul>
          </div>
        </div>
      </div>

      <div class="inspect-actions">
        ${!isCurrent ? `
          <button class="btn btn-primary btn-migrate-now" ${!canAfford ? 'disabled' : ''}>
            Mudar para ${city.name} (${migCost} créditos)
          </button>
          ${!canAfford ? `<p class="text-xs text-rose-400 mt-2">Créditos insuficientes. Faltam ${migCost - this.currentGameState.credits} créditos. Avance os meses para poupar recursos.</p>` : ''}
        ` : '<p class="text-sm text-cyan-400 font-medium">Você já reside nesta cidade.</p>'}
      </div>
    `;

    const btnMigrate = content.querySelector('.btn-migrate-now');
    if (btnMigrate && canAfford) {
      btnMigrate.addEventListener('click', () => {
        this.closeModal('modal-city-inspect');
        this.handlers.onMigrate(city.id);
      });
    }

    this.openModal('modal-city-inspect');
  }

  // Renderiza a aba "Comparar" (até 3 cidades lado a lado)
  renderCompareTab(state) {
    const selectA = document.getElementById('compare-city-a');
    const selectB = document.getElementById('compare-city-b');
    const selectC = document.getElementById('compare-city-c');
    const tableContainer = document.getElementById('compare-table-container');

    // Popula selects se necessário
    [selectA, selectB, selectC].forEach((sel, idx) => {
      if (!sel) return;
      if (sel.options.length === 0) {
        if (idx === 2) {
          sel.innerHTML = '<option value="">-- Nenhuma (Opcional) --</option>' + state.cities.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        } else {
          sel.innerHTML = state.cities.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
        sel.value = this.selectedCompareCityIds[idx] ?? (idx === 0 ? state.currentCityId : (idx === 1 ? (state.currentCityId === 0 ? 1 : 0) : ''));
        
        sel.addEventListener('change', () => {
          this.selectedCompareCityIds[idx] = sel.value === '' ? null : Number(sel.value);
          this.renderCompareTab(this.currentGameState);
        });
      }
    });

    const activeIds = this.selectedCompareCityIds.filter(id => id !== null && id !== undefined);
    const compareCities = activeIds.map(id => state.cities.find(c => c.id === id)).filter(Boolean);

    if (!tableContainer || compareCities.length === 0) return;

    tableContainer.innerHTML = `
      <div class="compare-table-wrapper">
        <table class="compare-table" role="table">
          <thead>
            <tr>
              <th scope="col">Indicador / Atributo</th>
              ${compareCities.map(c => `
                <th scope="col" class="compare-city-header">
                  <div class="font-bold text-base text-slate-100">${c.name}</div>
                  <span class="badge badge-${c.archetypeId}">${c.archetypeName}</span>
                  ${c.id === state.currentCityId ? '<span class="badge badge-current block mt-1">Residência</span>' : ''}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            <tr class="section-row"><td colspan="${compareCities.length + 1}">Informações Gerais</td></tr>
            <tr>
              <td><strong>População</strong></td>
              ${compareCities.map(c => `<td>${c.population.toLocaleString('pt-BR')} hab</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Qualidade de Vida</strong></td>
              ${compareCities.map(c => `<td class="font-bold font-mono text-cyan-400">${c.qualityOfLife} / 100</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Custo de Vida</strong></td>
              ${compareCities.map(c => `<td class="font-mono">${c.costOfLiving} pts</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Especialização</strong></td>
              ${compareCities.map(c => `<td>${c.specializationName}</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Geografia</strong></td>
              ${compareCities.map(c => `<td>${c.geographyName}</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Liberdade Econômica</strong></td>
              ${compareCities.map(c => `<td class="font-mono">${c.econFreedom}</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Liberdade Pessoal</strong></td>
              ${compareCities.map(c => `<td class="font-mono">${c.civicFreedom}</td>`).join('')}
            </tr>

            <tr class="section-row"><td colspan="${compareCities.length + 1}">Indicadores Sociais e Econômicos (0 a 100)</td></tr>
            ${Object.entries(INDICATOR_DEFS).map(([key, def]) => `
              <tr>
                <td><strong>${def.name}</strong></td>
                ${compareCities.map(c => {
                  const val = c.indicators[key] ?? 50;
                  return `
                    <td>
                      <div class="flex items-center gap-2">
                        <span class="font-mono font-medium">${val}</span>
                        <div class="mini-bar-track">
                          <div class="mini-bar-fill" style="width: ${val}%;"></div>
                        </div>
                      </div>
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Renderiza a aba "Diário" (Crônica Histórica)
  renderDiaryTab(state) {
    const container = document.getElementById('diary-timeline-container');
    const filterSelect = document.getElementById('diary-filter-type');

    if (!container) return;

    if (filterSelect && !filterSelect.dataset.hasListener) {
      filterSelect.addEventListener('change', () => {
        this.renderDiaryTab(this.currentGameState);
      });
      filterSelect.dataset.hasListener = 'true';
    }

    const typeFilter = filterSelect ? filterSelect.value : 'all';
    const entries = state.diary.filter(e => {
      if (typeFilter === 'all') return true;
      return e.type === typeFilter;
    });

    if (entries.length === 0) {
      container.innerHTML = '<p class="text-sm text-slate-400 italic">Nenhum registro para o filtro selecionado.</p>';
      return;
    }

    container.innerHTML = entries.map(entry => {
      let icon = '📖';
      let badgeClass = 'badge-cat-política';
      if (entry.type === 'migration') { icon = '✈'; badgeClass = 'badge-cat-migração'; }
      if (entry.type === 'global') { icon = '🌐'; badgeClass = 'badge-cat-global'; }
      if (entry.type === 'annual') { icon = '⭐'; badgeClass = 'badge-cat-cultura'; }
      if (entry.type === 'local') { icon = '🏛'; badgeClass = 'badge-cat-economia'; }

      return `
        <div class="diary-entry-card diary-type-${entry.type}">
          <div class="diary-entry-header">
            <span class="diary-icon">${icon}</span>
            <div>
              <h4 class="diary-title">${entry.title}</h4>
              <span class="text-xs text-slate-400">Mês ${entry.month}, Ano ${entry.year}</span>
            </div>
            <span class="badge ${badgeClass} ml-auto">${entry.type.toUpperCase()}</span>
          </div>
          <p class="diary-body">${entry.text}</p>
        </div>
      `;
    }).join('');
  }
}
