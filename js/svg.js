/**
 * Horizontes Cívicos - Gerador de Cenas em Pixel Art com Animações Específicas
 * Renderiza um mapa urbano detalhado em estética retro pixel art (resolução nativa 480x270 com crispEdges).
 * Inclui animações CSS nativas vetoriais diferenciadas para:
 * 1. Cada arquétipo de cidade (Libertária, Conservadora, Progressista, Estatista, Centrista).
 * 2. Tráfego urbano contínuo e ondulações marítimas.
 * 3. Eventos de alto impacto (protestos ativos, sirenes policiais, chuva/poluição ambiental, guindastes em obras, festivais culturais).
 */

// Helper para desenhar retângulos com coordenadas inteiras de pixels
function px(x, y, w, h, fill, opacity = 1, extraClass = '') {
  const opStr = opacity < 1 ? ` opacity="${opacity}"` : '';
  const clsStr = extraClass ? ` class="${extraClass}"` : '';
  return `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(w)}" height="${Math.round(h)}" fill="${fill}"${opStr}${clsStr} />`;
}

// Helper para desenhar linhas de pixel
function pxLine(x1, y1, x2, y2, stroke, width = 1, dash = '', extraClass = '') {
  const dashStr = dash ? ` stroke-dasharray="${dash}"` : '';
  const clsStr = extraClass ? ` class="${extraClass}"` : '';
  return `<line x1="${Math.round(x1)}" y1="${Math.round(y1)}" x2="${Math.round(x2)}" y2="${Math.round(y2)}" stroke="${stroke}" stroke-width="${width}"${dashStr}${clsStr} />`;
}

// Helper para árvore em pixel art
function drawPixelTree(x, y, lush = true) {
  const trunk = '#3e2723';
  const leafDark = lush ? '#14532d' : '#3f3f20';
  const leafMid = lush ? '#15803d' : '#5c5326';
  const leafLight = lush ? '#22c55e' : '#786c32';

  return `
    ${px(x + 3, y + 8, 2, 6, trunk)}
    ${px(x + 1, y + 4, 6, 5, leafDark)}
    ${px(x + 2, y + 2, 4, 5, leafMid)}
    ${px(x + 3, y + 1, 2, 3, leafLight)}
    ${px(x + 2, y + 3, 2, 2, leafLight)}
  `;
}

// Helper para carro em pixel art
function drawPixelCar(x, y, color = '#e11d48', dir = 1) {
  const wheel = '#0f172a';
  const glass = '#94a3b8';
  return `
    ${px(x, y + 2, 10, 3, color)}
    ${px(x + (dir > 0 ? 2 : 1), y, 6, 2, color)}
    ${px(x + (dir > 0 ? 3 : 2), y, 4, 2, glass)}
    ${px(x + 1, y + 4, 2, 2, wheel)}
    ${px(x + 7, y + 4, 2, 2, wheel)}
    ${px(x + (dir > 0 ? 9 : 0), y + 3, 1, 1, '#fef08a')}
  `;
}

// Helper para poste de luz em pixel art
function drawPixelLamp(x, y, lit = true) {
  const pole = '#475569';
  const glow = lit ? '#fef08a' : '#334155';
  return `
    ${px(x + 1, y, 1, 8, pole)}
    ${px(x, y, 3, 1, pole)}
    ${px(x + 1, y + 1, 1, 1, glow)}
    ${lit ? px(x - 1, y + 2, 5, 2, '#fef08a', 0.25) : ''}
  `;
}

// Helper para prédio em pixel art com fachada, sombra e janelas
function drawPixelBuilding(x, y, w, h, colors, windowDensity = 1, litRatio = 0.5) {
  const { wall, wallShadow, roof, windowLit, windowDark } = colors;
  let out = '';

  out += px(x, y, w, h, wall);
  out += px(x + w - 3, y, 3, h, wallShadow);
  out += px(x - 1, y - 2, w + 2, 2, roof);
  out += px(x, y - 4, w, 2, roof);

  const startY = y + 4;
  const endY = y + h - 5;
  const startX = x + 3;
  const endX = x + w - 5;

  let seed = (x * 13 + y * 37) % 100;

  for (let rY = startY; rY < endY; rY += 5) {
    for (let rX = startX; rX < endX; rX += 4) {
      seed = (seed + 17) % 100;
      const isLit = (seed / 100) < litRatio;
      const winColor = isLit ? windowLit : windowDark;
      out += px(rX, rY, 2, 3, winColor);
    }
  }

  return out;
}

// Renderizador principal da cena em Pixel Art animada
export function renderCitySvg(city, options = {}) {
  if (!city) return '';
  const ind = city.indicators || {};
  const archetype = city.archetypeId || 'centrist';
  const geo = city.geographyId || 'planalto';

  const econ = ind.economy ?? 50;
  const env = ind.environment ?? 50;
  const infra = ind.infrastructure ?? 50;
  const housing = ind.housing ?? 50;
  const safety = ind.safety ?? 50;
  const stability = ind.stability ?? 50;

  // Verifica se há um acontecimento impactante recente
  const recentEvent = (city.recentEvents && city.recentEvents.length > 0) ? city.recentEvents[0] : null;
  const eventCat = recentEvent ? recentEvent.category : '';

  // Paleta retro pixel art
  const pal = {
    skyTop: '#090d16',
    skyBottom: '#11192e',
    groundGreen: env > 48 ? '#143823' : '#27311b',
    groundDry: '#3b3123',
    waterClean: '#1b436c',
    waterDeep: '#102742',
    waterShallow: '#265d96',
    waterWave: '#7dd3fc',
    waterPolluted: '#2a3531',
    sand: '#8c7647',
    sandLight: '#b59b61',
    road: '#1c2230',
    roadLine: '#f1f5f9',
    sidewalk: '#334155',
    curb: '#242e42'
  };

  const waterBase = env > 45 ? pal.waterClean : pal.waterPolluted;
  const isHighEcon = econ > 55;
  const litRate = Math.min(Math.max((econ / 100) * 0.75 + 0.15, 0.1), 0.9);

  // 1. Definições de Estilos CSS e Animações dentro do SVG
  const animStyles = `
    <style>
      .pixel-art-canvas {
        image-rendering: pixelated;
        image-rendering: -moz-crisp-edges;
        image-rendering: crisp-edges;
        shape-rendering: crispEdges;
      }

      /* Animação Contínua: Tráfego Urbano */
      @keyframes driveRight {
        0% { transform: translateX(-80px); }
        100% { transform: translateX(540px); }
      }
      @keyframes driveLeft {
        0% { transform: translateX(540px); }
        100% { transform: translateX(-80px); }
      }
      .anim-traffic-r1 { animation: driveRight 15s linear infinite; }
      .anim-traffic-r2 { animation: driveRight 19s linear infinite 6s; }
      .anim-traffic-l1 { animation: driveLeft 14s linear infinite; }
      .anim-traffic-l2 { animation: driveLeft 18s linear infinite 5s; }

      /* Animação: Ondulações da Água */
      @keyframes waveDrift {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(3px); }
      }
      .anim-wave { animation: waveDrift 3s ease-in-out infinite; }

      /* Animações por Arquétipo: */

      /* 1. Libertária: Luzes do topo e letreiro neon */
      @keyframes beaconBlink {
        0%, 100% { opacity: 0.2; fill: #7f1d1d; }
        50% { opacity: 1; fill: #f43f5e; }
      }
      .anim-beacon { animation: beaconBlink 1.1s infinite; }

      @keyframes neonCycle {
        0%, 100% { fill: #38bdf8; }
        50% { fill: #ec4899; }
      }
      .anim-neon-text { animation: neonCycle 3s infinite ease-in-out; }

      /* 2. Conservadora: Bandeira cívica ondulando */
      @keyframes flagWave {
        0%, 100% { transform: skewY(0deg) scaleX(1); }
        50% { transform: skewY(3deg) scaleX(0.93); }
      }
      .anim-civic-flag { transform-origin: 87px 131px; animation: flagWave 2s infinite ease-in-out; }

      /* 3. Progressista: Hélices da turbina eólica girando */
      @keyframes turbineRotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .anim-wind-blades {
        transform-origin: 370px 70px;
        animation: turbineRotate 3.2s linear infinite;
      }
      @keyframes solarSheen {
        0%, 75%, 100% { opacity: 0.3; }
        85% { opacity: 1; fill: #ffffff; }
      }
      .anim-solar-sheen { animation: solarSheen 4.5s infinite; }

      /* 4. Estatista: Fumaça da indústria de base subindo */
      @keyframes smokeRise1 {
        0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
        50% { transform: translate(3px, -8px) scale(1.3); opacity: 0.35; }
        100% { transform: translate(7px, -18px) scale(1.6); opacity: 0; }
      }
      @keyframes smokeRise2 {
        0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
        50% { transform: translate(4px, -10px) scale(1.3); opacity: 0.35; }
        100% { transform: translate(8px, -20px) scale(1.7); opacity: 0; }
      }
      .anim-smoke-puff1 { animation: smokeRise1 3s infinite linear; }
      .anim-smoke-puff2 { animation: smokeRise2 3s infinite linear 1.5s; }

      /* 5. Centrista: Borrifo do chafariz da praça */
      @keyframes fountainSplash {
        0%, 100% { transform: scaleY(0.75); opacity: 0.6; }
        50% { transform: scaleY(1.3); opacity: 1; fill: #bae6fd; }
      }
      .anim-fountain-water { transform-origin: 195px 110px; animation: fountainSplash 1.3s infinite ease-in-out; }

      /* Animações de Eventos de Alto Impacto: */
      @keyframes sirenRedFlash {
        0%, 100% { opacity: 1; fill: #ef4444; }
        50% { opacity: 0.15; fill: #450a0a; }
      }
      @keyframes sirenBlueFlash {
        0%, 100% { opacity: 0.15; fill: #172554; }
        50% { opacity: 1; fill: #3b82f6; }
      }
      .anim-siren-red { animation: sirenRedFlash 0.4s infinite; }
      .anim-siren-blue { animation: sirenBlueFlash 0.4s infinite; }

      @keyframes protestWaving {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-3px) rotate(2deg); }
      }
      .anim-protest-crowd { transform-origin: 215px 182px; animation: protestWaving 0.9s infinite ease-in-out; }

      @keyframes rainFall {
        0% { transform: translate(0, -20px); opacity: 0; }
        50% { opacity: 0.75; }
        100% { transform: translate(-8px, 40px); opacity: 0; }
      }
      .anim-rain-streak { animation: rainFall 0.7s linear infinite; }

      @keyframes craneSway {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(7deg); }
      }
      .anim-crane-arm { transform-origin: 420px 48px; animation: craneSway 7s ease-in-out infinite; }

      @keyframes festiveFlash {
        0% { fill: #f43f5e; }
        33% { fill: #38bdf8; }
        66% { fill: #facc15; }
        100% { fill: #10b981; }
      }
      .anim-festive-bulb { animation: festiveFlash 1.2s infinite; }

      @keyframes eventAlertPulse {
        0%, 100% { opacity: 0.85; }
        50% { opacity: 1; filter: drop-shadow(0 0 6px #f43f5e); }
      }
      .anim-event-badge { animation: eventAlertPulse 1.8s infinite ease-in-out; }

      /* Respeito a prefers-reduced-motion */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
        }
      }
    </style>
  `;

  let sceneSvg = animStyles;

  // 2. Céu e Horizonte Noturno
  sceneSvg += `
    ${px(0, 0, 480, 20, '#060911')}
    ${px(0, 20, 480, 20, '#090e1c')}
    ${px(0, 40, 480, 25, '#0f172a')}
    ${px(0, 65, 480, 25, '#131e36')}
  `;

  // Estrelas discretas no horizonte
  const stars = [
    [45, 8], [95, 14], [160, 6], [220, 18], [280, 9], [340, 15], [410, 7], [460, 12],
    [70, 28], [130, 32], [250, 26], [380, 30]
  ];
  stars.forEach(([sx, sy]) => {
    sceneSvg += px(sx, sy, 1, 1, '#94a3b8', 0.8);
  });

  // 3. Terreno Geográfico Específico (8 Tipos)
  let terrainSvg = '';
  switch (geo) {
    case 'litoral':
      terrainSvg = `
        ${px(0, 70, 330, 200, pal.groundGreen)}
        ${px(330, 70, 15, 200, pal.sand)}
        ${px(345, 70, 10, 200, pal.sandLight)}
        ${px(355, 70, 125, 200, waterBase)}
        ${px(380, 70, 100, 200, pal.waterDeep)}

        <!-- Ondas Animadas na Costa -->
        <g class="anim-wave">
          ${px(355, 85, 3, 5, pal.waterWave)}
          ${px(357, 115, 4, 4, pal.waterWave)}
          ${px(356, 145, 3, 7, pal.waterWave)}
          ${px(358, 175, 5, 4, pal.waterWave)}
          ${px(355, 215, 4, 6, pal.waterWave)}
          ${px(357, 245, 3, 6, pal.waterWave)}
        </g>

        <!-- Doca e Píer -->
        ${px(340, 160, 45, 6, '#451a03')}
        ${px(350, 166, 3, 10, '#260e02')}
        ${px(370, 166, 3, 10, '#260e02')}
        ${px(385, 155, 18, 5, '#f8fafc')}
        ${px(388, 150, 8, 5, '#0284c7')}
        ${px(392, 144, 1, 6, '#64748b')}
        ${px(320, 152, 12, 6, '#dc2626')}
        ${px(320, 146, 12, 6, '#2563eb')}
        ${px(305, 152, 12, 6, '#16a34a')}
      `;
      break;

    case 'margem_rio':
      terrainSvg = `
        ${px(0, 70, 480, 200, pal.groundGreen)}
        ${px(0, 130, 480, 32, waterBase)}
        ${px(0, 134, 480, 24, pal.waterDeep)}
        ${px(0, 128, 480, 2, pal.sand)}
        ${px(0, 162, 480, 2, pal.sand)}

        <g class="anim-wave">
          ${px(60, 140, 8, 1, pal.waterWave)}
          ${px(150, 146, 12, 1, pal.waterWave)}
          ${px(280, 138, 10, 1, pal.waterWave)}
          ${px(390, 148, 14, 1, pal.waterWave)}
        </g>

        <!-- Grande Ponte Rodoviária -->
        ${px(230, 120, 35, 52, '#334155')}
        ${px(232, 120, 31, 52, '#1e293b')}
        ${px(247, 120, 1, 52, '#f8fafc', 0.6)}
        ${px(226, 132, 4, 28, '#0f172a')}
        ${px(265, 132, 4, 28, '#0f172a')}
      `;
      break;

    case 'montanhosa':
      terrainSvg = `
        <polygon points="0,75 50,25 110,75" fill="#2d3748" />
        <polygon points="40,35 50,25 60,35" fill="#f1f5f9" />
        <polygon points="90,75 160,18 240,75" fill="#1f2937" />
        <polygon points="145,30 160,18 178,30" fill="#f1f5f9" />
        <polygon points="210,75 300,28 390,75" fill="#2d3748" />
        <polygon points="285,38 300,28 318,38" fill="#f1f5f9" />
        <polygon points="360,75 425,20 480,75" fill="#1f2937" />
        <polygon points="412,32 425,20 440,32" fill="#f1f5f9" />
        ${px(0, 75, 480, 195, '#1e2530')}
      `;
      break;

    case 'arida':
      terrainSvg = `
        ${px(0, 65, 480, 205, '#292015')}
        ${px(0, 65, 480, 35, '#3b2f1e')}
        ${px(40, 58, 80, 12, '#4d3d27')}
        ${px(200, 52, 110, 18, '#4d3d27')}
        ${px(370, 56, 90, 14, '#4d3d27')}
        ${px(30, 95, 2, 7, '#15803d')}
        ${px(28, 97, 2, 3, '#15803d')}
        ${px(32, 98, 2, 3, '#15803d')}
        ${px(440, 110, 2, 8, '#15803d')}
        ${px(438, 112, 2, 3, '#15803d')}
        ${px(442, 114, 2, 3, '#15803d')}
      `;
      break;

    case 'floresta':
      terrainSvg = `
        ${px(0, 65, 480, 205, '#143520')}
        ${Array.from({ length: 28 }).map((_, i) => drawPixelTree(i * 17, 52 + (i % 3) * 3, true)).join('')}
        ${Array.from({ length: 8 }).map((_, i) => drawPixelTree(455, 90 + i * 18, true)).join('')}
        ${Array.from({ length: 8 }).map((_, i) => drawPixelTree(6, 90 + i * 18, true)).join('')}
      `;
      break;

    case 'arquipelago':
      terrainSvg = `
        ${px(0, 65, 480, 205, waterBase)}
        ${px(0, 100, 480, 170, pal.waterDeep)}
        ${px(30, 85, 220, 155, pal.groundGreen)}
        ${px(25, 80, 230, 5, pal.sand)}
        ${px(245, 85, 5, 155, pal.sand)}
        ${px(25, 235, 230, 5, pal.sand)}
        ${px(25, 85, 5, 155, pal.sand)}
        ${px(290, 95, 165, 140, pal.groundGreen)}
        ${px(285, 90, 175, 5, pal.sand)}
        ${px(450, 95, 5, 140, pal.sand)}
        ${px(285, 230, 175, 5, pal.sand)}
        ${px(285, 95, 5, 140, pal.sand)}
        <!-- Ponte entre ilhas -->
        ${px(245, 150, 48, 12, '#475569')}
        ${px(245, 152, 48, 8, '#1e293b')}
        ${px(245, 155, 48, 2, '#f8fafc', 0.5)}
        ${px(260, 162, 4, 12, '#0f172a')}
        ${px(275, 162, 4, 12, '#0f172a')}
      `;
      break;

    default: // planalto e vale
      terrainSvg = `
        ${px(0, 65, 480, 205, pal.groundGreen)}
        ${px(0, 65, 480, 8, '#18243b')}
      `;
      break;
  }
  sceneSvg += terrainSvg;

  // 4. Sistema Viário e Tráfego com Animação Fluida de Pixel Art
  const roadColor = infra > 45 ? pal.road : '#282d38';
  sceneSvg += `
    ${px(0, 180, 480, 24, roadColor)}
    ${px(0, 176, 480, 4, pal.sidewalk)}
    ${px(0, 204, 480, 4, pal.sidewalk)}
    ${Array.from({ length: 24 }).map((_, i) => px(i * 20 + 4, 191, 10, 2, pal.roadLine)).join('')}
    ${Array.from({ length: 8 }).map((_, i) => px(110, 181 + i * 3, 10, 2, pal.roadLine)).join('')}
    ${Array.from({ length: 8 }).map((_, i) => px(350, 181 + i * 3, 10, 2, pal.roadLine)).join('')}
    ${px(220, 80, 24, 190, roadColor)}
    ${px(216, 80, 4, 190, pal.sidewalk)}
    ${px(244, 80, 4, 190, pal.sidewalk)}
    ${Array.from({ length: 9 }).map((_, i) => px(231, 85 + i * 20, 2, 10, pal.roadLine)).join('')}
    ${px(216, 176, 32, 32, '#2b3345')}
    ${px(228, 188, 8, 8, '#38bdf8', 0.4)}
  `;

  // Postes de Luz ao longo da Avenida
  const lamps = [
    [50, 170], [150, 170], [270, 170], [390, 170],
    [50, 208], [150, 208], [270, 208], [390, 208]
  ];
  lamps.forEach(([lx, ly]) => {
    sceneSvg += drawPixelLamp(lx, ly, safety > 40);
  });

  // Carros em Movimento Animado Contínuo pela Avenida
  sceneSvg += `
    <g class="anim-traffic-r1">${drawPixelCar(0, 183, '#e11d48', 1)}</g>
    <g class="anim-traffic-r2">${drawPixelCar(0, 183, '#38bdf8', 1)}</g>
    <g class="anim-traffic-l1">${drawPixelCar(0, 195, '#10b981', -1)}</g>
    <g class="anim-traffic-l2">${drawPixelCar(0, 195, '#f8fafc', -1)}</g>
  `;

  // 5. Arquiteturas com Animações Específicas por Arquétipo
  let buildingsSvg = '';

  switch (archetype) {
    case 'libertarian':
      buildingsSvg = `
        <!-- Torre Alfa com Antena e Luz Piscante -->
        ${drawPixelBuilding(60, 75, 45, 95, {
          wall: '#1e3a5f', wallShadow: '#10233b', roof: '#0284c7',
          windowLit: '#38bdf8', windowDark: '#0c1d33'
        }, 1, litRate)}
        ${px(82, 55, 2, 20, '#64748b')}
        ${px(81, 53, 4, 2, '#f43f5e', 1, 'anim-beacon')}

        <!-- Torre Beta com Heliponto e Letreiro Neon Pulsante -->
        ${drawPixelBuilding(115, 60, 55, 110, {
          wall: '#1e293b', wallShadow: '#0f172a', roof: '#334155',
          windowLit: '#fef08a', windowDark: '#172033'
        }, 1, litRate)}
        ${px(125, 56, 35, 4, '#0f172a')}
        ${px(138, 57, 9, 2, '#f8fafc')}
        ${px(142, 55, 2, 6, '#f8fafc')}
        <!-- Letreiro Comercial Neon Animado -->
        ${px(122, 70, 40, 6, '#0369a1')}
        ${px(125, 72, 34, 2, '#38bdf8', 1, 'anim-neon-text')}

        ${drawPixelBuilding(270, 70, 50, 100, {
          wall: '#1b2d42', wallShadow: '#111d2e', roof: '#0369a1',
          windowLit: '#38bdf8', windowDark: '#0e1a29'
        }, 1, litRate)}

        ${drawPixelBuilding(330, 85, 45, 85, {
          wall: '#26334d', wallShadow: '#182236', roof: '#475569',
          windowLit: '#fef08a', windowDark: '#131b2b'
        }, 1, litRate)}

        <!-- Comércio Sul -->
        ${drawPixelBuilding(60, 215, 40, 45, {
          wall: '#334155', wallShadow: '#1e293b', roof: '#475569',
          windowLit: '#fde047', windowDark: '#182030'
        }, 1, litRate)}
        ${px(60, 235, 40, 4, '#dc2626')}
        ${Array.from({ length: 5 }).map((_, i) => px(60 + i * 8, 235, 4, 4, '#f8fafc')).join('')}

        ${drawPixelBuilding(110, 218, 45, 42, {
          wall: '#283548', wallShadow: '#1a2333', roof: '#38475e',
          windowLit: '#38bdf8', windowDark: '#141c2b'
        }, 1, litRate)}
        ${px(110, 238, 45, 4, '#0284c7')}

        ${drawPixelBuilding(270, 216, 50, 44, {
          wall: '#303c54', wallShadow: '#1f2738', roof: '#4b5563',
          windowLit: '#fde047', windowDark: '#161d2b'
        }, 1, litRate)}

        ${drawPixelBuilding(330, 215, 45, 45, {
          wall: '#2a3547', wallShadow: '#1c2433', roof: '#374151',
          windowLit: '#38bdf8', windowDark: '#161c28'
        }, 1, litRate)}
      `;
      break;

    case 'conservative':
      buildingsSvg = `
        <!-- Palácio com Cúpula e Colunata -->
        ${drawPixelBuilding(100, 75, 75, 95, {
          wall: '#374151', wallShadow: '#1f2937', roof: '#4b5563',
          windowLit: '#fef08a', windowDark: '#19202c'
        }, 1, litRate)}
        <polygon points="100,75 137,50 175,75" fill="#4b5563" stroke="#1f2937" stroke-width="1" />
        ${px(135, 45, 5, 6, '#f59e0b')}
        ${Array.from({ length: 6 }).map((_, i) => px(106 + i * 11, 140, 4, 30, '#9ca3af')).join('')}

        <!-- Bandeira Cívica Monumental com Animação de Vento -->
        ${px(85, 130, 2, 35, '#cbd5e1')}
        <g class="anim-civic-flag">
          ${px(87, 131, 12, 7, '#d97706')}
          ${px(87, 138, 12, 1, '#1e293b')}
        </g>

        <!-- Ministério da Ordem com Relógio -->
        ${drawPixelBuilding(275, 80, 70, 90, {
          wall: '#374151', wallShadow: '#1f2937', roof: '#4b5563',
          windowLit: '#fde047', windowDark: '#19202c'
        }, 1, litRate)}
        ${px(302, 65, 16, 15, '#4b5563')}
        ${px(307, 70, 6, 6, '#fef08a')}

        <!-- Casario Tradicional Sul -->
        ${drawPixelBuilding(55, 215, 45, 45, {
          wall: '#4a2820', wallShadow: '#301812', roof: '#374151',
          windowLit: '#fde047', windowDark: '#21100b'
        }, 1, litRate)}
        ${drawPixelBuilding(110, 215, 45, 45, {
          wall: '#4a2820', wallShadow: '#301812', roof: '#374151',
          windowLit: '#fde047', windowDark: '#21100b'
        }, 1, litRate)}
        ${drawPixelBuilding(275, 215, 45, 45, {
          wall: '#4a2820', wallShadow: '#301812', roof: '#374151',
          windowLit: '#fde047', windowDark: '#21100b'
        }, 1, litRate)}
        ${drawPixelBuilding(330, 215, 45, 45, {
          wall: '#4a2820', wallShadow: '#301812', roof: '#374151',
          windowLit: '#fde047', windowDark: '#21100b'
        }, 1, litRate)}

        <!-- Estátua Cívica na Praça -->
        ${px(195, 145, 10, 6, '#64748b')}
        ${px(198, 137, 4, 8, '#94a3b8')}
        ${px(197, 134, 6, 3, '#cbd5e1')}
      `;
      break;

    case 'progressive':
      buildingsSvg = `
        <!-- Centro Cultural e Teto Verde -->
        ${drawPixelBuilding(70, 85, 65, 85, {
          wall: '#263852', wallShadow: '#192538', roof: '#15803d',
          windowLit: '#fef08a', windowDark: '#121d2e'
        }, 1, litRate)}
        ${px(72, 81, 61, 4, '#22c55e')}
        ${drawPixelTree(80, 72, true)}
        ${drawPixelTree(115, 72, true)}

        <!-- Cooperativa Habitacional com Painéis Solares Cintilantes -->
        ${drawPixelBuilding(275, 80, 65, 90, {
          wall: '#293a4f', wallShadow: '#1b2738', roof: '#1e3a8a',
          windowLit: '#38bdf8', windowDark: '#131e2e'
        }, 1, litRate)}
        ${Array.from({ length: 4 }).map((_, i) => px(280 + i * 14, 73, 11, 6, '#0284c7')).join('')}
        ${Array.from({ length: 4 }).map((_, i) => px(282 + i * 14, 75, 7, 2, '#bae6fd', 1, 'anim-solar-sheen')).join('')}

        <!-- Turbina Eólica Urbana com Hélices Girando em Tempo Real -->
        ${px(370, 70, 2, 35, '#cbd5e1')}
        <g class="anim-wind-blades">
          ${px(366, 68, 10, 2, '#f8fafc')}
          ${px(370, 62, 2, 14, '#f8fafc')}
        </g>

        <!-- Bairro Criativo Sul -->
        ${drawPixelBuilding(60, 215, 50, 45, {
          wall: '#27384a', wallShadow: '#192433', roof: '#166534',
          windowLit: '#fde047', windowDark: '#131c26'
        }, 1, litRate)}
        ${px(63, 240, 6, 12, '#ec4899')}
        ${px(69, 243, 8, 9, '#8b5cf6')}
        ${px(77, 239, 7, 13, '#38bdf8')}
        ${px(84, 242, 6, 10, '#f59e0b')}

        ${drawPixelBuilding(120, 218, 45, 42, {
          wall: '#223347', wallShadow: '#172230', roof: '#15803d',
          windowLit: '#38bdf8', windowDark: '#111b26'
        }, 1, litRate)}

        ${drawPixelBuilding(275, 215, 55, 45, {
          wall: '#25374d', wallShadow: '#192536', roof: '#166534',
          windowLit: '#fde047', windowDark: '#141e2b'
        }, 1, litRate)}

        <!-- Ciclovia Verde com Ciclista em Movimento -->
        ${px(0, 201, 480, 3, '#16a34a')}
        <g class="anim-traffic-r2">
          ${px(0, 201, 4, 2, '#38bdf8')}
          ${px(2, 199, 2, 2, '#fed7aa')}
        </g>
      `;
      break;

    case 'statist':
      buildingsSvg = `
        <!-- Ministério Central Brutalista -->
        ${drawPixelBuilding(90, 70, 80, 100, {
          wall: '#334155', wallShadow: '#1e293b', roof: '#475569',
          windowLit: '#fef08a', windowDark: '#172030'
        }, 1, litRate)}
        ${px(115, 52, 30, 18, '#475569')}
        ${px(125, 48, 10, 4, '#64748b')}

        <!-- Complexo Industrial com Chaminés e Fumaça Animada Contínua -->
        ${drawPixelBuilding(270, 85, 75, 85, {
          wall: '#374151', wallShadow: '#1f2937', roof: '#4b5563',
          windowLit: '#fde047', windowDark: '#19222e'
        }, 1, litRate)}
        ${px(320, 52, 6, 33, '#78350f')}
        ${px(334, 46, 7, 39, '#78350f')}

        <!-- Plumas de Fumaça Animadas Subindo e se Dissipando -->
        <g class="anim-smoke-puff1">
          ${px(318, 44, 10, 6, '#94a3b8', 0.6)}
          ${px(315, 36, 14, 7, '#64748b', 0.4)}
        </g>
        <g class="anim-smoke-puff2">
          ${px(332, 38, 11, 6, '#94a3b8', 0.6)}
          ${px(330, 30, 15, 7, '#64748b', 0.4)}
        </g>

        <!-- Superquadras Sul -->
        ${drawPixelBuilding(60, 215, 50, 45, {
          wall: '#334155', wallShadow: '#1e293b', roof: '#475569',
          windowLit: '#fde047', windowDark: '#19202c'
        }, 1, litRate)}
        ${drawPixelBuilding(120, 215, 50, 45, {
          wall: '#334155', wallShadow: '#1e293b', roof: '#475569',
          windowLit: '#fde047', windowDark: '#19202c'
        }, 1, litRate)}
        ${drawPixelBuilding(270, 215, 50, 45, {
          wall: '#334155', wallShadow: '#1e293b', roof: '#475569',
          windowLit: '#fde047', windowDark: '#19202c'
        }, 1, litRate)}
        ${drawPixelBuilding(330, 215, 50, 45, {
          wall: '#334155', wallShadow: '#1e293b', roof: '#475569',
          windowLit: '#fde047', windowDark: '#19202c'
        }, 1, litRate)}

        <!-- Obelisco da Ordem Popular -->
        ${px(195, 125, 6, 25, '#94a3b8')}
        <polygon points="195,125 198,118 201,125" fill="#e2e8f0" />
      `;
      break;

    default: // centrist
      buildingsSvg = `
        <!-- Prefeitura com Torre e Campanário -->
        ${drawPixelBuilding(95, 78, 65, 92, {
          wall: '#334155', wallShadow: '#1e293b', roof: '#475569',
          windowLit: '#fef08a', windowDark: '#172233'
        }, 1, litRate)}
        ${px(121, 55, 14, 23, '#475569')}
        <polygon points="121,55 128,42 135,55" fill="#0284c7" />
        ${px(125, 62, 6, 6, '#fef08a')}

        ${drawPixelBuilding(270, 75, 55, 95, {
          wall: '#263852', wallShadow: '#182436', roof: '#0369a1',
          windowLit: '#38bdf8', windowDark: '#121b29'
        }, 1, litRate)}
        ${drawPixelBuilding(335, 90, 45, 80, {
          wall: '#2c374a', wallShadow: '#1c2433', roof: '#475569',
          windowLit: '#fde047', windowDark: '#141c28'
        }, 1, litRate)}

        <!-- Parque Municipal Central com Chafariz de Água Animado -->
        ${px(180, 95, 30, 30, '#15803d')}
        ${px(190, 105, 10, 10, '#0284c7')}
        ${px(193, 107, 4, 5, '#7dd3fc', 1, 'anim-fountain-water')}
        ${drawPixelTree(182, 92, true)}
        ${drawPixelTree(203, 114, true)}

        <!-- Bairro Residencial e Comercial Sul -->
        ${drawPixelBuilding(60, 215, 45, 45, {
          wall: '#383b47', wallShadow: '#222530', roof: '#b91c1c',
          windowLit: '#fde047', windowDark: '#171921'
        }, 1, litRate)}
        <polygon points="60,215 82,204 105,215" fill="#991b1b" />

        ${drawPixelBuilding(115, 218, 45, 42, {
          wall: '#2d3748', wallShadow: '#1a202c', roof: '#4a5568',
          windowLit: '#38bdf8', windowDark: '#121824'
        }, 1, litRate)}

        ${drawPixelBuilding(270, 215, 45, 45, {
          wall: '#334155', wallShadow: '#1e293b', roof: '#b91c1c',
          windowLit: '#fde047', windowDark: '#161d2b'
        }, 1, litRate)}
        <polygon points="270,215 292,204 315,215" fill="#991b1b" />

        ${drawPixelBuilding(325, 215, 45, 45, {
          wall: '#2d3748', wallShadow: '#1a202c', roof: '#4b5563',
          windowLit: '#38bdf8', windowDark: '#141b26'
        }, 1, litRate)}
      `;
      break;
  }
  sceneSvg += buildingsSvg;

  // 6. Camada Dinâmica: Meio Ambiente
  let envSvg = '';
  if (env > 50) {
    const treeCoords = [
      [42, 168], [178, 168], [252, 168], [378, 168],
      [42, 212], [178, 212], [252, 212], [378, 212],
      [205, 95], [205, 125], [205, 155]
    ];
    treeCoords.forEach(([tx, ty]) => {
      envSvg += drawPixelTree(tx, ty, true);
    });
  } else {
    const dryTrees = [[42, 168], [252, 168], [378, 212]];
    dryTrees.forEach(([tx, ty]) => {
      envSvg += drawPixelTree(tx, ty, false);
    });
    envSvg += px(0, 50, 480, 80, '#475569', 0.18);
  }
  sceneSvg += envSvg;

  // 7. Camada Dinâmica: Moradia e Densidade Urbana
  if (housing < 42) {
    sceneSvg += `
      ${px(72, 70, 6, 5, '#0284c7')}
      ${px(130, 55, 8, 5, '#0284c7')}
      ${px(285, 65, 7, 5, '#0284c7')}
      ${px(342, 80, 6, 5, '#0284c7')}
      ${px(80, 71, 3, 3, '#94a3b8')}
      ${px(298, 66, 3, 3, '#94a3b8')}
    `;
  }

  // 8. ANIMAÇÕES DE EVENTOS DE ALTO IMPACTO (Reagindo a Acontecimentos Específicos)
  let eventVisualsSvg = '';

  // A) Protestos / Greve Geral / Tensão Política (estabilidade baixa ou evento de política)
  if (stability < 42 || eventCat === 'política') {
    eventVisualsSvg += `
      <!-- Multidão Animada com Cartazes Ondulando em Tempo Real -->
      <g class="anim-protest-crowd">
        ${px(205, 185, 2, 4, '#f8fafc')} ${px(205, 183, 2, 2, '#fbcfe8')}
        ${px(209, 184, 2, 4, '#38bdf8')} ${px(209, 182, 2, 2, '#fed7aa')}
        ${px(213, 186, 2, 4, '#e11d48')} ${px(213, 184, 2, 2, '#fbcfe8')}
        ${px(217, 185, 2, 4, '#10b981')} ${px(217, 183, 2, 2, '#fed7aa')}
        ${px(221, 184, 2, 4, '#f59e0b')} ${px(221, 182, 2, 2, '#fbcfe8')}

        <!-- Faixas e Cartazes em Movimento -->
        ${px(204, 178, 12, 3, '#f43f5e')}
        ${px(217, 177, 10, 3, '#f59e0b')}
        ${px(209, 181, 1, 3, '#78350f')}
        ${px(220, 180, 1, 3, '#78350f')}
      </g>
    `;
  }

  // B) Insegurança / Operação Policial / Surto de Crimes (segurança baixa ou evento de segurança)
  if (safety < 42 || eventCat === 'segurança') {
    eventVisualsSvg += `
      <!-- Viatura com Sirene Vermelha e Azul Alternando Vigorosamente -->
      ${drawPixelCar(175, 183, '#1e293b', 1)}
      ${px(179, 181, 2, 2, '#ef4444', 1, 'anim-siren-red')}
      ${px(181, 181, 2, 2, '#3b82f6', 1, 'anim-siren-blue')}
      
      <!-- Cones de Trânsito Refletivos -->
      ${px(160, 184, 2, 3, '#ea580c')}
      ${px(160, 185, 2, 1, '#ffffff')}
      ${px(168, 184, 2, 3, '#ea580c')}
      ${px(168, 185, 2, 1, '#ffffff')}
    `;
  }

  // C) Chuva / Tempestade / Crise Climática (evento de meio ambiente ou chuva)
  if (eventCat === 'meio ambiente' || (recentEvent && recentEvent.id && (recentEvent.id.includes('seca') || recentEvent.id.includes('enchente') || recentEvent.id.includes('vazamento')))) {
    // Linhas diagonais de chuva em pixel caindo animadas
    eventVisualsSvg += `
      <g>
        ${Array.from({ length: 24 }).map((_, i) => {
          const rx = (i * 21 + 7) % 460;
          const ry = 40 + (i * 13) % 180;
          return pxLine(rx, ry, rx - 3, ry + 8, '#7dd3fc', 1, '', 'anim-rain-streak');
        }).join('')}
      </g>
    `;
  }

  // D) Boom Econômico / Polo Tecnológico / Obras Ativas
  if (isHighEcon || eventCat === 'economia' || eventCat === 'tecnologia') {
    eventVisualsSvg += `
      <!-- Guindaste com Lança Horizontal Oscilando Suavemente -->
      ${px(420, 48, 2, 45, '#eab308')}
      <g class="anim-crane-arm">
        ${px(398, 48, 40, 2, '#eab308')}
        ${px(398, 46, 12, 2, '#ca8a04')}
        ${px(420, 42, 2, 6, '#eab308')}
        ${pxLine(420, 42, 436, 48, '#713f12', 1)}
        ${pxLine(420, 42, 405, 48, '#713f12', 1)}
        ${px(428, 50, 1, 14, '#64748b')}
        ${px(426, 64, 5, 4, '#ea580c')}
      </g>
    `;
  }

  // E) Festival Cultural / Movimento Artístico
  if (eventCat === 'cultura') {
    eventVisualsSvg += `
      <!-- Varal de Luzes Festivas Coloridas na Avenida -->
      ${pxLine(30, 175, 210, 175, '#475569', 1, '2 2')}
      ${pxLine(250, 175, 450, 175, '#475569', 1, '2 2')}
      ${Array.from({ length: 14 }).map((_, i) => px(35 + i * 13, 176, 2, 2, '#f43f5e', 1, 'anim-festive-bulb')).join('')}
      ${Array.from({ length: 14 }).map((_, i) => px(255 + i * 13, 176, 2, 2, '#10b981', 1, 'anim-festive-bulb')).join('')}
    `;
  }

  sceneSvg += eventVisualsSvg;

  // 9. Badge Animado HUD no Canto Superior quando há um Evento de Alto Impacto
  if (recentEvent) {
    sceneSvg += `
      <g class="anim-event-badge" transform="translate(305, 8)">
        ${px(0, 0, 168, 16, '#0f172a', 0.9)}
        <rect x="0" y="0" width="168" height="16" fill="none" stroke="#f43f5e" stroke-width="1" />
        ${px(3, 3, 10, 10, '#f43f5e')}
        <text x="8" y="11" fill="#ffffff" font-size="8" font-weight="bold" font-family="monospace" text-anchor="middle">!</text>
        <text x="18" y="11" fill="#f8fafc" font-size="7.5" font-weight="bold" font-family="system-ui">${recentEvent.title.slice(0, 24)}</text>
      </g>
    `;
  }

  // Monta o SVG completo
  return `
    <svg viewBox="0 0 480 270" class="city-svg-viewport pixel-art-canvas" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapa urbano animado em pixel art da cidade ${city.name}">
      ${sceneSvg}
      <rect x="0" y="0" width="480" height="270" fill="none" stroke="#1e293b" stroke-width="2" />
    </svg>
  `.trim();
}
