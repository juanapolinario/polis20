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
│   ├── ideological_data.js # 68 problemas ideológicos (Koyzis), cálculo de afinidade euclidiana e fatores de risco
│   ├── simulation.js       # Motor puro da simulação mensal (inércia, relações cruzadas, migração, loteria ponderada)
│   ├── svg.js              # Ilustrações urbanas em Pixel Art 480x270 com animações dinâmicas contínuas e de eventos
│   ├── audio.js            # Sintetizador procedural de áudio (Web Audio API: bipes, avanços, fanfarras, sirenes, moedas)
│   ├── storage.js          # Persistência v2 com migração retrocompatível (v1 -> v2) e importação/exportação
│   ├── ui.js               # HUD de jogo, Diagrama de Nolan clássico 45°, News Ticker, modais de crise com causas/efeitos
│   └── app.js              # Orquestrador do ciclo de vida da aplicação
├── scratch/
│   └── test_ideological_balance.js # Script headless para diagnóstico estocástico (50 sementes x 120 meses)
└── README.md               # Documentação técnica e guia de extensão
```

---

## 3. Explicação Resumida da Simulação

O jogo simula **20 cidades fictícias** simultaneamente. O jogador é um cidadão e observador do continente que começa morando na cidade fundada por ele.

### A. Eixos Políticos e Questionário do Diagrama de Nolan
- A orientação política da metrópole inicial do jogador é determinada pelo **Questionário Clássico de Nolan** (10 proposições: 5 sobre liberdades pessoais e 5 sobre liberdades econômicas).
- Cada questão pode ser respondida com **Concordo (+20 pts)**, **Talvez (+10 pts)** ou **Discordo (0 pts)**, totalizando de 0 a 100 pontos por eixo:
  - **Liberdade Pessoal (0 a 100):** Mede o grau de autonomia individual e tolerância à diversidade de costumes versus controle normativo e disciplina cívica.
  - **Liberdade Econômica (0 a 100):** Mede o grau de desregulamentação comercial e primazia da iniciativa privada versus coordenação, serviços universais e planejamento coletivo.
- O resultado projeta em tempo real a posição no **Diagrama de Nolan Clássico rotacionado a 45°**, classificando entre as 5 vertentes: **Libertária**, **Conservadora**, **Progressista**, **Estatista** e **Centrista**. Predefinições rápidas também estão disponíveis na interface.

### B. Fórmula de Mudança Mensal de Indicadores
A cada mês, cada um dos 12 indicadores (Economia, Empregos, Segurança, Saúde, Educação, Moradia, Igualdade, Infraestrutura, Meio Ambiente, Liberdade Pessoal, Estabilidade e Confiança) é atualizado pela seguinte fórmula:

$$\Delta = \text{Inércia} + \text{Reversão à Média} + \text{Relações Cruzadas} + \text{Influência Ética} + \text{Acontecimentos} + \text{Condições Ativas} + \text{Ruído}$$

- **Inércia:** Preserva 35% do vetor de aceleração do mês anterior, criando ciclos econômicos realistas de expansão e recessão.
- **Reversão à Média:** Força suave em direção a 50 pontos para evitar colapsos irremediáveis ou saturação perpétua em 0 ou 100.
- **Relações Cruzadas:** Causalidades estruturais (ex: economia forte aquece empregos e pressiona aluguéis; educação sustenta inovação a longo prazo; degradação ambiental corrói a saúde).
- **Influência Ética:** Moduladores probabilísticos moderados, com compensações e riscos inerentes a cada espectro, evitando qualquer viés ideológico vencedor.
- **Condições Ativas:** Desdobramentos temporais de crises políticas (3 a 18 meses) gerando impactos graduais e persistentes.
- **Ruído Moderado:** Variável gaussiana ($\sigma \approx 0.6$) para simular a imprevisibilidade da vida social.

### C. Dinâmica do Jogador (Cidadão)
- O jogador começa com 100 créditos pessoais.
- Seu saldo mensal varia com base no custo de vida, moradia e oportunidades de emprego na sua cidade de residência.
- O jogador pode consultar qualquer uma das outras 19 cidades, analisar distâncias, vantagens, dificuldades e decidir migrar a qualquer momento, pagando o custo de mudança correspondente.

---

## 4. Sistema de Problemas Políticos Ideológicos (David T. Koyzis)

Inspirado na análise institucional e filosófica de David T. Koyzis em *Visões e ilusões políticas* (*Political Visions and Illusions*), o simulador incorpora tensões e crises sistêmicas emergentes decorrentes da absolutização de princípios legítimos.

### A. Princípio Filosófico
> *"Um bem político parcial pode gerar injustiças quando é transformado em princípio absoluto e aplicado a toda a sociedade."*

Nenhum espectro ideológico é retratado de forma caricata, moralista ou vilanesca. Pelo contrário: todas as medidas partem de **intenções cívicas genuínas e compreensíveis**, gerando muitas vezes **benefícios iniciais reais** (aumento de dinamismo, coesão, ampliação de direitos ou segurança), mas cujos desdobramentos não antecipados e pontos cegos institucionais produzem efeitos colaterais cumulativos.

### B. Os 5 Espectros de Nolan e seus Bens Parciais Absolutizados
1. **Libertarianismo (Autonomia individual e mercado autorregulado):**
   - *Bem buscado:* Eficiência alocativa, dinamismo inovador e liberdade de contrato.
   - *Ponto cego:* Subinvestimento crônico em bens públicos indivisíveis, precarização de laços de solidariedade comunitária e vulnerabilidade a externalidades negativas ou monopólios privados.
2. **Conservadorismo (Continuidade institucional, ordem e patrimônio cultural):**
   - *Bem buscado:* Coesão comunitária, estabilidade intergeracional e respeito a instituições consolidadas.
   - *Ponto cego:* Rigidez excludente diante da pluralidade demográfica, resistência anacrônica à inovação e desconfiança de reformas adaptativas necessárias.
3. **Progressismo (Emancipação humana, combate a privilégios e democratismo):**
   - *Bem buscado:* Equidade distributiva, inclusão de minorias e extensão dos direitos civis.
   - *Ponto cego:* Proliferação hipertrófica de comissões regulatórias, atrito permanente com tradições locais e exaustão participativa de cidadãos comuns.
4. **Estatismo / Totalismo (Soberania coletiva, unidade e primazia do Estado):**
   - *Bem buscado:* Coordenação estratégica nacional, mitigação de assimetrias e garantia de ordem pública.
   - *Ponto cego:* Asfixia da sociedade civil autônoma, dependência de diretrizes burocráticas centralizadas e erosão de liberdades individuais em nome do plano estatal.
5. **Centrismo / Pragmatismo Tecnocrático (Consenso instrumental e equilíbrio):**
   - *Bem buscado:* Despolarização, governabilidade técnica e mediação de conflitos.
   - *Ponto cego:* Paralisia decisória diante de crises estruturais, miopia de curto prazo (adiamento sistemático de reformas duras) e alheamento democrático dos cidadãos em relação a elites de gabinete.

### C. Estrutura de Dados Expandida dos Eventos
Cada problema ideológico é modelado com rigor causal e descritivo em `js/ideological_data.js`:

```javascript
{
  id: 'ideological_lib_privatizacao_malhas',
  type: 'ideologicalProblem',
  nolanProfile: 'libertarian',
  family: 'mercado_desregulado',
  severity: 'moderate', // 'light', 'moderate', 'severe'
  title: 'Leilão Irrestrito da Malha Hídrica Municipal',
  narrative: 'A transferência da gestão do saneamento ao consórcio privado reduziu os custos operacionais imediatos...',
  immediateBenefit: 'Redução substancial do déficit de custeio municipal e atração de aportes de capital externo.',
  immediateBenefitEffects: { economy: +3, jobs: +1 },
  effects: { equality: -4, health: -2 },
  persistentEffects: { equality: -1 },
  durationMonths: 6,
  cooldownMonths: 24,
  riskFactors: ['housing', 'infrastructure'],
  concreteFactors: [
    'Concessão sem cláusula de universalização em áreas de baixa renda',
    'Tarifas dinâmicas indexadas à margem de retorno operacional'
  ],
  causalityExplanation: 'A lógica de lucratividade imediata incentivou a modernização das áreas rentáveis, mas precarizou a manutenção da periferia.',
  resolutionNarrative: 'A criação de um conselho misto de fiscalização estipulou metas mínimas de investimento comunitário, estabilizando o serviço.'
}
```

### D. Modelagem Probabilística e Dinâmica
- **Afinidade Contínua:** Calculada a partir da distância euclidiana da cidade em relação ao centroide do perfil no Diagrama de Nolan:
  $$\text{Distância} = \sqrt{(\text{econ} - \text{econ}_0)^2 + (\text{pers} - \text{pers}_0)^2}$$
  $$\text{Afinidade} = \max\left(0, 1 - \frac{\text{Distância}}{85}\right)^{1.35}$$
- **Intensidade Ideológica:** Aumenta exponencialmente quanto mais extrema for a posição da cidade em relação ao centro moderado $(50, 50)$, tornando centros moderados naturalmente mais resilientes e metrópoles dogmáticas mais suscetíveis a contradições internas.
- **Fatores de Risco e Vulnerabilidade:** Indicadores fracos (abaixo de 40) correlacionados à família de risco multiplicam o peso do sorteio em até 2.0x.
- **Proporção na Simulação:** Calibrado para representar entre **20% e 30%** de todos os acontecimentos locais (atingindo exatamente **28.2%** em testes em larga escala com 120.000 cidades-mês).
- **Limites de Sobrecarga:**
  - Máximo de **1 problema ideológico por cidade/mês**.
  - Máximo de **3 manchetes ideológicas** no boletim continental mensal.
  - Tempo de recarga estrito de no mínimo **24 meses** para o mesmo acontecimento e **12 meses** para acontecimentos da mesma família na mesma cidade.
- **Condições Persistentes e Resoluções:** Crises ativas duram de 3 a 18 meses gerando micro-impactos continuados. Ao se expirarem, um evento de resolução é arquivado no Diário Cívico com narrativa de acomodação institucional.

---

## 5. Como Criar Novos Eventos

Os eventos regulares permanecem em `js/data.js` (`EVENTS_DATABASE`), enquanto os problemas ideológicos residem em `js/ideological_data.js` (`IDEOLOGICAL_PROBLEMS_DATABASE`). O motor seleciona ambos através de uma loteria ponderada contínua unificada.

---

## 6. Diagnóstico e Verificação Automatizada (Headless)

O projeto inclui uma suíte de testes e diagnósticos estocásticos headless em Node.js para validar a estabilidade e o balanceamento do modelo:

```bash
node scratch/test_ideological_balance.js
```

### O que o teste avalia:
- **50 sementes independentes** executadas por **120 meses** (10 anos) em todas as **20 cidades** (120.000 cidades-mês).
- **Determinismo estrito:** Validação de que a mesma semente reproduz exatamente os mesmos números e eventos bit a bit.
- **Aderência estatística:** Proporção de eventos ideológicos entre 20% e 30%.
- **Integridade numérica:** Verificação de ausência absoluta de `NaN`, `undefined` ou infinitos.
- **Tempo de recarga:** Zero violações de cooldown de 24 meses.
- **Distribuição de Qualidade de Vida:** Confirma que nenhum arquétipo entra em colapso estrutural compulsório.

---

## 7. Compatibilidade de Saves (Migração v1 -> v2)

O módulo `js/storage.js` conta com um migrador automático:
- Jogos salvos na versão 1 continuam funcionando sem perda de progresso, créditos pessoais, população ou histórico.
- Os novos arrays e mapas de controle (`ideologicalCooldowns`, `familyCooldowns`, `activeConditions`, `ideologicalHistory`) são inseridos dinamicamente de forma segura durante a inicialização.

---

## 8. Limitações Conhecidas do Modelo

- O mapa das cidades é cartográfico e esquemático, não representando relevo geodésico do mundo real.
- A simulação não possui backend ou multiplayer; todos os cálculos ocorrem 100% no navegador do usuário via JavaScript e Web APIs.
- O jogador atua exclusivamente como cidadão e observador cívico, não podendo legislar ou emitir decretos administrativos diretos.
