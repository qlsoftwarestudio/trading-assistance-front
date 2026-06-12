export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  content: string[];
  hasCalculator?: boolean;
  calculatorType?: "rr" | "position";
  quiz: QuizQuestion[];
}

export interface Level {
  id: string;
  number: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export const levels: Level[] = [
  {
    id: "fundamentos",
    number: 0,
    title: "Fundamentos",
    description: "Exchange, órdenes y simulador de R:R.",
    lessons: [
      {
        id: "l0-exchange",
        title: "¿Qué es un exchange?",
        description: "Spot vs Futures vs Margin.",
        durationMinutes: 5,
        content: [
          "Un exchange es una plataforma donde se compran y venden activos financieros. En cripto, Binance es el exchange más grande del mundo.",
          "Spot: comprás el activo real. Futures: operás contratos sobre el precio con apalancamiento. Margin: prestás fondos para operar con más capital.",
          "Nuestro bot opera en Binance Futures con leverage 5x controlado.",
        ],
        quiz: [
          {
            id: "q0-1",
            question: "¿En qué mercado opera el Trading Assistant?",
            options: ["Spot", "Futures", "Margin", "OTC"],
            correctIndex: 1,
            explanation: "El bot opera en Binance Futures para aprovechar el apalancamiento controlado.",
          },
          {
            id: "q0-2",
            question: "¿Qué apalancamiento usa la estrategia?",
            options: ["2x", "5x", "10x", "20x"],
            correctIndex: 1,
            explanation: "Usamos 5x de leverage. Es el punto óptimo entre exposición y riesgo manejable.",
          },
        ],
      },
      {
        id: "l0-ordenes",
        title: "Órdenes básicas",
        description: "Market, Limit, SL y TP.",
        durationMinutes: 7,
        content: [
          "Market: ejecuta inmediatamente al mejor precio disponible.",
          "Limit: indicás el precio exacto. Se ejecuta solo si el mercado llega ahí.",
          "Stop-Loss (SL): cierra tu posición si el precio va en contra por un % definido. Protege el capital.",
          "Take-Profit (TP): cierra tu posición con ganancia cuando alcanza el % objetivo.",
          "El bot usa SL 0.6% y TP 1.2% para mantener un ratio riesgo:recompensa de 1:2.",
        ],
        hasCalculator: true,
        calculatorType: "rr",
        quiz: [
          {
            id: "q0-3",
            question: "Si el precio de entrada es 100, SL 0.6% y TP 1.2%, ¿dónde está el TP?",
            options: ["99.4", "100.6", "101.2", "98.8"],
            correctIndex: 2,
            explanation: "TP = 100 * (1 + 0.012) = 101.2. El SL sería 100 * (1 - 0.006) = 99.4.",
          },
        ],
      },
    ],
  },
  {
    id: "analisis-basico",
    number: 1,
    title: "Análisis Técnico Básico",
    description: "Velas, soportes, resistencias y volumen.",
    lessons: [
      {
        id: "l1-velas",
        title: "Velas japonesas",
        description: "Body, wicks, bullish y bearish.",
        durationMinutes: 6,
        content: [
          "Cada vela representa un período de tiempo (15 minutos en nuestro bot).",
          "Body verde = subió, rojo = bajó. Wicks (mechas) muestran máximo y mínimo.",
          "Mecha inferior larga + body pequeño verde = rechazo a la baja, posible rebote.",
        ],
        quiz: [
          {
            id: "q1-1",
            question: "¿Qué indica una mecha inferior muy larga?",
            options: [
              "El precio subió mucho",
              "El precio rechazó mínimos y rebotó",
              "Volumen bajo",
              "Tendencia bajista confirmada",
            ],
            correctIndex: 1,
            explanation: "Una mecha inferior larga muestra que el precio bajó pero fue rechazado, indicando presión compradora.",
          },
        ],
      },
      {
        id: "l1-soporte",
        title: "Soportes y Resistencias",
        description: "Zonas clave en el gráfico.",
        durationMinutes: 8,
        content: [
          "Soporte: zona donde el precio ha rebotado al alza varias veces. Los compradores defienden ese nivel.",
          "Resistencia: zona donde el precio ha sido rechazado a la baja varias veces.",
          "Cuando una resistencia se rompe, puede convertirse en soporte (y viceversa).",
        ],
        quiz: [
          {
            id: "q1-2",
            question: "Si el precio rompe una resistencia con volumen alto, ¿qué es más probable?",
            options: [
              "La resistencia se convierte en soporte",
              "El precio vuelve inmediatamente abajo",
              "La tendencia bajista se confirma",
              "Nada cambia",
            ],
            correctIndex: 0,
            explanation: "Al romper una resistencia con volumen, esa zona suele convertirse en soporte en retrocesos futuros.",
          },
        ],
      },
      {
        id: "l1-volumen",
        title: "Volumen",
        description: "Confirmación de movimientos y spike.",
        durationMinutes: 6,
        content: [
          "Volumen mide cuánto se negoció. Confirma la fuerza del movimiento.",
          "Alcista + volumen creciente = tendencia saludable. Alcista + volumen decreciente = debilidad.",
          "El bot usa 'volume spike': volumen actual >2x el promedio de 20 velas = señal de fuerza.",
        ],
        quiz: [
          {
            id: "q1-3",
            question: "¿Qué umbral de volumen usa el bot para confirmar un 'spike'?",
            options: ["1.5x", "2.0x", "3.0x", "5.0x"],
            correctIndex: 1,
            explanation: "El bot requiere volumen >2x el promedio de 20 velas para considerar un spike válido.",
          },
        ],
      },
    ],
  },
  {
    id: "indicadores",
    number: 2,
    title: "Indicadores Clave",
    description: "RSI(7), EMA, filtros de contexto.",
    lessons: [
      {
        id: "l2-rsi",
        title: "RSI",
        description: "Sobrecompra, sobreventa y reversión.",
        durationMinutes: 10,
        content: [
          "RSI mide velocidad y magnitud de movimientos recientes. Escala 0-100.",
          ">70 sobrecompra, <30 sobreventa. El bot usa período 7 (más sensible que 14).",
          "RSI < 20 = extremo. Si volumen alto y RSI empieza a subir, el bot abre LONG.",
        ],
        quiz: [
          {
            id: "q2-1",
            question: "¿Qué período de RSI usa el bot?",
            options: ["5", "7", "14", "21"],
            correctIndex: 1,
            explanation: "RSI(7) es más sensible que RSI(14), ideal para detectar oportunidades en 15m.",
          },
          {
            id: "q2-2",
            question: "Si RSI = 18 y volumen es 2.5x el promedio, ¿qué puede pasar?",
            options: [
              "El bot ignora la señal",
              "El bot abre LONG como 'oversold spike'",
              "El bot abre SHORT",
              "El bot se desconecta",
            ],
            correctIndex: 1,
            explanation: "RSI < 20 + volumen > 2x + RSI revertiendo al alza activa el 'oversold spike' LONG override.",
          },
        ],
      },
      {
        id: "l2-ema",
        title: "EMA",
        description: "Filtro de contexto de tendencia.",
        durationMinutes: 8,
        content: [
          "EMA da más peso a precios recientes, respondiendo más rápido que SMA.",
          "El bot usa EMA como filtro: precio > EMA en 1h/4h/1d = contexto alcista.",
          "Si contexto bajista pero RSI<15 + volumen alto, el bot puede override.",
        ],
        quiz: [
          {
            id: "q2-3",
            question: "¿Para qué usa el bot la EMA?",
            options: [
              "Para generar la señal de entrada",
              "Como filtro de contexto de tendencia",
              "Para calcular el trailing stop",
              "Para definir el tamaño de posición",
            ],
            correctIndex: 1,
            explanation: "La EMA filtra el contexto macro (1h/4h/1d) para evitar operar en contra de la tendencia mayor.",
          },
        ],
      },
      {
        id: "l2-filtros",
        title: "Filtros de Contexto",
        description: "Multi-timeframe: 1h, 4h, 1d.",
        durationMinutes: 8,
        content: [
          "Timeframe principal: 15m. Pero una señal en 15m puede ser trampa si la tendencia mayor es contraria.",
          "1h = corto plazo, 4h = medio, 1d = largo plazo.",
          "Excepción: 'oversold spike' (RSI<20 + volumen alto) puede override filtros bajistas.",
        ],
        quiz: [
          {
            id: "q2-4",
            question: "¿Qué puede override los filtros de contexto bajista?",
            options: [
              "Una vela verde grande",
              "Oversold spike (RSI<20 + volumen alto)",
              "EMA cruzando al alza",
              "Cualquier señal LONG",
            ],
            correctIndex: 1,
            explanation: "Solo el 'oversold spike' con RSI extremo y volumen confirmado puede override los filtros de contexto.",
          },
        ],
      },
    ],
  },
  {
    id: "gestion-riesgo",
    number: 3,
    title: "Gestión de Riesgo",
    description: "Position sizing, trailing stop y protección.",
    lessons: [
      {
        id: "l3-sizing",
        title: "Position Sizing",
        description: "¿Cuánto arriesgar por trade?",
        durationMinutes: 8,
        content: [
          "El bot usa 10% del capital por trade. Nunca más del 10% en una sola operación.",
          "Con leverage 5x, el riesgo real sobre el capital total es controlado.",
          "Regla de oro: nunca arriesgar más del 1-2% del capital total en un solo trade.",
        ],
        hasCalculator: true,
        calculatorType: "position",
        quiz: [
          {
            id: "q3-1",
            question: "¿Qué % del capital usa el bot por posición?",
            options: ["5%", "10%", "20%", "50%"],
            correctIndex: 1,
            explanation: "El bot usa 10% del capital por trade. Con leverage 5x, la exposición es 50% pero el riesgo está en SL 0.6%.",
          },
        ],
      },
      {
        id: "l3-trailing",
        title: "Trailing Stop Dinámico",
        description: "Proteger ganancias en movimiento.",
        durationMinutes: 8,
        content: [
          "El trailing stop se mueve con el precio a favor para proteger ganancias.",
          "Dinámico: <0.5% profit → trailing 0.6%, 0.5-1% → 0.4%, >1% → 0.25%.",
          "A mayor profit, más ajustado el trailing para asegurar ganancias.",
        ],
        quiz: [
          {
            id: "q3-2",
            question: "Si el profit es 1.5%, ¿qué trailing stop aplica el bot?",
            options: ["0.6%", "0.4%", "0.25%", "0.1%"],
            correctIndex: 2,
            explanation: ">1% profit → trailing 0.25%. Cuanto más profit, más ajustado el trailing para asegurar ganancias.",
          },
        ],
      },
      {
        id: "l3-proteccion",
        title: "Protección de Capital",
        description: "Max daily loss y cooldown.",
        durationMinutes: 6,
        content: [
          "Máxima pérdida diaria: 5%. Si se alcanza, el bot se detiene hasta el día siguiente.",
          "Cooldown post-SL: 10 minutos de pausa después de un stop loss.",
          "Esto evita el 'revenge trading' y decisiones emocionales.",
        ],
        quiz: [
          {
            id: "q3-3",
            question: "¿Cuánto es el cooldown después de un stop loss?",
            options: ["5 min", "10 min", "30 min", "1 hora"],
            correctIndex: 1,
            explanation: "10 min de cooldown post-SL para evitar overtrading emocional después de una pérdida.",
          },
        ],
      },
    ],
  },
  {
    id: "estrategia-completa",
    number: 4,
    title: "Estrategia Completa",
    description: "Flujo del bot, backtesting y laboratorio.",
    lessons: [
      {
        id: "l4-flujo",
        title: "Flujo de Decisión",
        description: "Cómo decide el bot paso a paso.",
        durationMinutes: 10,
        content: [
          "Paso 1: ¿Cooldown activo? ¿Max daily loss alcanzado? Si sí, NO opera.",
          "Paso 2: Calcular RSI(7), volumen, EMA y filtros de contexto.",
          "Paso 3: ¿RSI<30 + volumen normal + contexto favorable? → Señal LONG estándar.",
          "Paso 4: ¿RSI<20 + volumen>2x + RSI revertiendo? → Oversold spike LONG (override contexto).",
          "Paso 5: Abrir posición con SL 0.6%, TP 1.2%, leverage 5x.",
          "Paso 6: Monitorear con trailing stop dinámico.",
        ],
        quiz: [
          {
            id: "q4-1",
            question: "¿Qué se verifica PRIMERO antes de generar una señal?",
            options: [
              "El RSI",
              "Cooldown y max daily loss",
              "El volumen",
              "La EMA",
            ],
            correctIndex: 1,
            explanation: "Primero se verifican protecciones: cooldown activo y max daily loss. Si alguno está activo, no hay señal.",
          },
        ],
      },
      {
        id: "l4-backtest",
        title: "Backtesting",
        description: "Validar en datos históricos.",
        durationMinutes: 8,
        content: [
          "Backtest: simular la estrategia en datos históricos para ver cómo habría funcionado.",
          "Métricas clave: Win Rate, Profit Factor, Max Drawdown, CAGR.",
          "Walk-forward: entrenar en 70% de datos, testear en 30% para detectar overfitting.",
        ],
        quiz: [
          {
            id: "q4-2",
            question: "¿Qué es el walk-forward analysis?",
            options: [
              "Operar en vivo",
              "Train 70% / Test 30% para detectar overfitting",
              "Usar solo datos recientes",
              "Ignorar el backtest",
            ],
            correctIndex: 1,
            explanation: "Walk-forward entrena en 70% y testea en 30% para verificar que la estrategia no está sobre-ajustada.",
          },
        ],
      },
      {
        id: "l4-lab",
        title: "Laboratorio de Señales",
        description: "Simular parámetros.",
        durationMinutes: 8,
        content: [
          "En el laboratorio podés ajustar parámetros y ver cuántas señales habría generado.",
          "Sliders: RSI threshold, volume multiplier, SL%, TP%.",
          "Vivís el proceso de optimización sin arriesgar capital.",
        ],
        quiz: [
          {
            id: "q4-3",
            question: "¿Qué pasa si subís mucho el TP%?",
            options: [
              "Más señales, menos win rate",
              "Menos señales, más win rate",
              "No cambia nada",
              "El bot se desconecta",
            ],
            correctIndex: 0,
            explanation: "TP más alto = menos señales alcanzan el target, pero las que sí lo hacen son más rentables. Es un trade-off.",
          },
        ],
      },
    ],
  },
  {
    id: "psicologia",
    number: 5,
    title: "Psicología y Operativa Real",
    description: "Emociones, diario y transición a live.",
    lessons: [
      {
        id: "l5-psicologia",
        title: "La Psicología del Trader",
        description: "FOMO, revenge trading, overtrading.",
        durationMinutes: 8,
        content: [
          "FOMO: entrar por miedo a perderse el movimiento. El bot nunca tiene FOMO, opera solo con señales confirmadas.",
          "Revenge trading: operar para recuperar pérdidas. El cooldown post-SL evita esto.",
          "Overtrading: operar demasiado. El bot tiene límites diarios y cooldown.",
        ],
        quiz: [
          {
            id: "q5-1",
            question: "¿Qué mecanismo del bot evita el revenge trading?",
            options: [
              "El trailing stop",
              "El cooldown post-SL",
              "El RSI",
              "La EMA",
            ],
            correctIndex: 1,
            explanation: "10 min de cooldown post-SL impide tomar decisiones emocionales inmediatamente después de una pérdida.",
          },
        ],
      },
      {
        id: "l5-metricas",
        title: "Métricas de Rendimiento",
        description: "CAGR, Sharpe, Drawdown.",
        durationMinutes: 8,
        content: [
          "CAGR: tasa de crecimiento anual compuesta. Nuestra meta es 42%.",
          "Sharpe Ratio: retorno ajustado por riesgo. >1 es bueno, >2 es excelente.",
          "Max Drawdown: caída máxima desde el pico. Menor es mejor para la salud emocional.",
        ],
        quiz: [
          {
            id: "q5-2",
            question: "¿Qué mide el Max Drawdown?",
            options: [
              "La ganancia máxima",
              "La caída máxima desde un pico",
              "El volumen promedio",
              "El número de trades",
            ],
            correctIndex: 1,
            explanation: "Max Drawdown = caída máxima desde el peak. Es clave para entender el dolor emocional de la estrategia.",
          },
        ],
      },
      {
        id: "l5-checklist",
        title: "Checklist para Live",
        description: "Antes de pasar a cuenta real.",
        durationMinutes: 6,
        content: [
          "1. Mínimo 2 semanas en Testnet con resultados consistentes.",
          "2. Entender cada parámetro de la estrategia.",
          "3. Tener capital que podés perder sin afectar tu vida.",
          "4. Configurar alertas Telegram y revisar logs diariamente.",
          "5. Nunca aumentar leverage por frustración.",
        ],
        quiz: [
          {
            id: "q5-3",
            question: "¿Cuánto tiempo mínimo en Testnet se recomienda?",
            options: ["1 día", "1 semana", "2 semanas", "1 mes"],
            correctIndex: 2,
            explanation: "Mínimo 2 semanas en Testnet para validar que la estrategia funciona en condiciones de mercado variadas.",
          },
        ],
      },
    ],
  },
];

export const achievementsList: { id: string; title: string; description: string; icon: string }[] = [
  { id: "primeros-pasos", title: "Primeros Pasos", description: "Completar Nivel 0", icon: "Footprints" },
  { id: "analista", title: "Analista Técnico", description: "Completar Nivel 1 con 80% de acierto", icon: "BarChart3" },
  { id: "indicador", title: "Indicador Viviente", description: "Completar Nivel 2 sin errores en quiz de RSI", icon: "Activity" },
  { id: "risk-manager", title: "Risk Manager", description: "Usar la calculadora de position sizing 5 veces", icon: "Shield" },
  { id: "cientifico", title: "Científico de Datos", description: "Completar Nivel 4 y generar 3 backtests", icon: "Microscope" },
  { id: "mente-fria", title: "Mente Fría", description: "Completar Nivel 5", icon: "Brain" },
  { id: "practicante", title: "Practicante", description: "Conectar API de Testnet", icon: "Plug" },
  { id: "observador", title: "Observador", description: "Ver el dashboard por 5 min", icon: "Eye" },
  { id: "dedicado", title: "Estudiante Dedicado", description: "7 días consecutivos en la plataforma", icon: "Flame" },
  { id: "perfecto", title: "Perfecto", description: "Completar un nivel sin errores en quizzes", icon: "Award" },
];

export const levelCount = levels.length;
export const totalLessons = levels.reduce((sum, l) => sum + l.lessons.length, 0);
