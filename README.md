# Horizontes Cívicos — Simulador Político-Social de Cidades

Um simulador social, político e econômico contemplativo e rejogável para navegadores web modernos, construído com tecnologias puras (HTML5 semântico, CSS3 moderno, JavaScript ES6 modular e SVG procedural).

> **Aviso do Modelo:**
> *Este é um modelo ficcional e simplificado. Ele não pretende prever o desempenho de sociedades reais.*

---

## 1. Como Executar

Por utilizar **Módulos JavaScript nativos (`import`/`export`)**, navegadores modernos exigem que a aplicação seja servida sob um servidor HTTP local para respeitar as políticas de segurança de origem (CORS).

Você pode utilizar qualquer servidor estático de sua preferência:

### Opção A: Com Python (geralmente pré-instalado)
```bash
python -m http.server 8000
```
Em seguida, abra no navegador: [http://localhost:8000](http://localhost:8000)

### Opção B: Com Node.js (`npx serve` ou `http-server`)
```bash
npx -y serve .
```
ou
```bash
npx -y http-server . -p 8080
```

### Opção C: Extensão "Live Server" do VS Code
Basta clicar com o botão direito em `index.html` e selecionar **"Open with Live Server"**.

---

## 2. Estrutura dos Arquivos

```
Polis20/
├── index.html              # Interface SPA (Tela Inicial, Minha Cidade, Mundo, Comparar, Diário, Modais)
├── styles.css              # Design System (Atlas político futurista, modo escuro, layout responsivo)
├── js/
│   ├── rng.js              # Gerador PRNG determinístico (Mulberry32 + hash de semente cyrb53)
│   ├── data.js             # 45 nomes de cidades, 8 geografias, 10 especializações, 32 eventos, 5 arquétipos
│   ├── simulation.js       # Motor puro da simulação mensal (inércia, relações cruzadas, migração, créditos)
│   ├── svg.js              # Ilustrações urbanas em Pixel Art 480x270 com animações dinâmicas contínuas e de eventos
│   ├── audio.js            # Sintetizador procedural de áudio (Web Audio API: bipes, avanços, fanfarras, sirenes, moedas)
│   ├── storage.js          # Persistência em localStorage e importação/exportação de JSON versionado
│   ├── ui.js               # HUD de jogo, Diagrama de Nolan clássico 45°, News Ticker SimCity, números flutuantes e modais
│   └── app.js              # Orquestrador do ciclo de vida da aplicação
└── README.md               # Documentação técnica e guia de extensão
```

---

## 3. Explicação Resumida da Simulação

O jogo simula **20 cidades fictícias** simultaneamente. O jogador é um cidadão e observador do continente que começa morando na cidade fundada por ele.

### A. Eixos Políticos (Diagrama de Nolan)
- **Liberdade Econômica (0 a 100):** Mede o grau de desregulamentação comercial e primazia da iniciativa privada versus coordenação, serviços universais e planejamento coletivo.
- **Liberdade Pessoal (0 a 100):** Mede o grau de autonomia individual e tolerância à diversidade de costumes versus controle normativo e disciplina cívica.
- Classificações: **Libertária**, **Conservadora**, **Progressista**, **Estatista** e **Centrista**.

### B. Fórmula de Mudança Mensal de Indicadores
A cada mês, cada um dos 12 indicadores (Economia, Empregos, Segurança, Saúde, Educação, Moradia, Igualdade, Infraestrutura, Meio Ambiente, Liberdade Pessoal, Estabilidade e Confiança) é atualizado pela seguinte fórmula:

$$\Delta = \text{Inércia} + \text{Reversão à Média} + \text{Relações Cruzadas} + \text{Influência Ética} + \text{Acontecimentos} + \text{Ruído}$$

- **Inércia:** Preserva 35% do vetor de aceleração do mês anterior, criando ciclos econômicos realistas de expansão e recessão.
- **Reversão à Média:** Força suave em direção a 50 pontos para evitar colapsos irremediáveis ou saturação perpétua em 0 ou 100.
- **Relações Cruzadas:** Causalidades estruturais (ex: economia forte aquece empregos e pressiona aluguéis; educação sustenta inovação a longo prazo; degradação ambiental corrói a saúde).
- **Influência Ética:** Moduladores probabilísticos moderados, com compensações e riscos inerentes a cada espectro, evitando qualquer viés ideológico vencedor.
- **Ruído Moderado:** Variável gaussiana ($\sigma \approx 0.6$) para simular a imprevisibilidade da vida social.

### C. Dinâmica do Jogador (Cidadão)
- O jogador começa com 100 créditos pessoais.
- Seu saldo mensal varia com base no custo de vida, moradia e oportunidades de emprego na sua cidade de residência.
- O jogador pode consultar qualquer uma das outras 19 cidades, analisar distâncias, vantagens, dificuldades e decidir migrar a qualquer momento, pagando o custo de mudança correspondente.

---

## 4. Como Criar Novos Eventos

Os eventos estão centralizados em `js/data.js` na constante `EVENTS_DATABASE`. Para adicionar um novo acontecimento, basta acrescentar um objeto seguindo este formato:

```javascript
{
  id: 'meu_novo_evento',
  category: 'economia', // 'economia', 'segurança', 'saúde', 'educação', 'habitação', 'política', 'cultura', 'meio ambiente', 'tecnologia', 'migração', 'global'
  title: 'Título Noticioso do Evento',
  narrative: 'Texto jornalístico descrevendo o acontecimento no contexto da cidade.',
  weight: 10, // Peso de probabilidade de sorteio (normalmente entre 7 e 12)
  isGlobal: false, // true para atingir todo o continente
  conditions: {
    minEcon: 40, // Condições opcionais: min/max para qualquer indicador
    maxHousing: 60
  },
  effects: {
    economy: +4,
    jobs: +3,
    housing: -2
  },
  // Variação de resposta da cidade conforme sua ética
  ethicalModifiers: (city) => {
    if (city.econFreedom > 60) return { economy: +2 };
    return {};
  },
  explanation: 'Explicação didática das causas e efeitos nos indicadores.'
}
```

---

## 5. Como Ajustar o Balanceamento

Todos os pesos e constantes de sensibilidade estão centralizados em:
- **`js/simulation.js`**:
  - `calculateQualityOfLife`: pesos de cada indicador no índice composto de qualidade de vida.
  - `calculateAttractiveness`: fórmula de atração de migrantes e retenção populacional.
  - `simulateSingleCityMonth`: taxas de inércia (`0.35`), reversão à média (`0.035`) e relações cruzadas.
  - `calculateMigrationCost`: custo base e tarifas por quilômetro e custo de vida.
- **`js/data.js`**:
  - Modificadores das 8 Geografias e 10 Especializações.

---

## 6. Limitações Conhecidas do MVP

- O mapa das cidades é cartográfico e esquemático, não representando relevo geodésico do mundo real.
- A simulação não possui backend ou multiplayer; todos os cálculos ocorrem 100% no navegador do usuário.
- O jogador atua exclusivamente como cidadão e observador cívico, não podendo legislar ou emitir decretos administrativos diretos.
