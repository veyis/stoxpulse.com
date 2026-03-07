// Technical indicators calculated from OHLCV price data
// Eliminates dependency on FMP Premium technical indicator endpoints

export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ── SMA (Simple Moving Average) ──────────────────────────────────

export function calculateSMA(closes: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += closes[i - j];
    }
    result.push(sum / period);
  }
  return result;
}

// Returns just the latest SMA value
export function latestSMA(closes: number[], period: number): number | null {
  if (closes.length < period) return null;
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += closes[i];
  }
  return sum / period;
}

// ── EMA (Exponential Moving Average) ─────────────────────────────

export function calculateEMA(closes: number[], period: number): (number | null)[] {
  if (closes.length < period) return closes.map(() => null);

  const k = 2 / (period + 1);
  const result: (number | null)[] = [];

  // Data comes newest-first, reverse for calculation
  const reversed = [...closes].reverse();

  // Seed EMA with SMA of first `period` values
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += reversed[i];
    result.push(null);
  }
  let ema = sum / period;
  result[period - 1] = ema;

  for (let i = period; i < reversed.length; i++) {
    ema = reversed[i] * k + ema * (1 - k);
    result.push(ema);
  }

  // Reverse back to newest-first
  return result.reverse();
}

// Returns just the latest EMA value
export function latestEMA(closes: number[], period: number): number | null {
  const emas = calculateEMA(closes, period);
  return emas[0] ?? null;
}

// ── RSI (Relative Strength Index — Wilder's Method) ──────────────

export function calculateRSI(closes: number[], period: number = 14): (number | null)[] {
  if (closes.length < period + 1) return closes.map(() => null);

  // Data comes newest-first, reverse for calculation
  const reversed = [...closes].reverse();
  const result: (number | null)[] = new Array(reversed.length).fill(null);

  // Calculate initial average gain/loss over first `period` changes
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const change = reversed[i] - reversed[i - 1];
    if (change >= 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  avgGain /= period;
  avgLoss /= period;

  // First RSI
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result[period] = 100 - 100 / (1 + rs);

  // Wilder's smoothing for remaining values
  for (let i = period + 1; i < reversed.length; i++) {
    const change = reversed[i] - reversed[i - 1];
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    result[i] = rsi;
  }

  // Reverse back to newest-first
  return result.reverse();
}

// Returns just the latest RSI value
export function latestRSI(closes: number[], period: number = 14): number | null {
  const rsis = calculateRSI(closes, period);
  return rsis[0] ?? null;
}

// ── MACD (Moving Average Convergence Divergence) ─────────────────

export interface MACDPoint {
  macd: number | null;
  signal: number | null;
  histogram: number | null;
}

export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDPoint[] {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  // MACD line = fast EMA - slow EMA
  const macdLine: (number | null)[] = fastEMA.map((fast, i) => {
    const slow = slowEMA[i];
    if (fast == null || slow == null) return null;
    return fast - slow;
  });

  // Signal line = EMA of MACD line (need to handle nulls)
  const validMacd = macdLine.filter((v): v is number => v != null);
  const signalEMA = calculateEMA(validMacd, signalPeriod);

  // Map signal back to full array
  let signalIdx = 0;
  const signalLine: (number | null)[] = macdLine.map((m) => {
    if (m == null) return null;
    return signalEMA[signalIdx++] ?? null;
  });

  return macdLine.map((macd, i) => {
    const signal = signalLine[i];
    return {
      macd,
      signal,
      histogram: macd != null && signal != null ? macd - signal : null,
    };
  });
}

// ── Bollinger Bands ──────────────────────────────────────────────

export interface BollingerPoint {
  upper: number | null;
  middle: number | null;
  lower: number | null;
}

export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerPoint[] {
  const sma = calculateSMA(closes, period);

  return sma.map((middle, i) => {
    if (middle == null) return { upper: null, middle: null, lower: null };

    // Calculate standard deviation over the period
    let sumSqDiff = 0;
    for (let j = 0; j < period; j++) {
      sumSqDiff += (closes[i - j] - middle) ** 2;
    }
    const stdDev = Math.sqrt(sumSqDiff / period);

    return {
      upper: middle + stdDevMultiplier * stdDev,
      middle,
      lower: middle - stdDevMultiplier * stdDev,
    };
  });
}

// ── ATR (Average True Range) ────────────────────────────────────

export function calculateATR(ohlc: OHLCV[], period: number = 14): (number | null)[] {
  if (ohlc.length < 2) return ohlc.map(() => null);

  // Data comes newest-first, reverse for calculation
  const reversed = [...ohlc].reverse();
  const result: (number | null)[] = new Array(reversed.length).fill(null);

  // Calculate true ranges
  const trueRanges: number[] = [reversed[0].high - reversed[0].low]; // first TR = high - low
  for (let i = 1; i < reversed.length; i++) {
    const tr = Math.max(
      reversed[i].high - reversed[i].low,
      Math.abs(reversed[i].high - reversed[i - 1].close),
      Math.abs(reversed[i].low - reversed[i - 1].close)
    );
    trueRanges.push(tr);
  }

  // First ATR = simple average of first `period` TRs
  if (trueRanges.length < period) return ohlc.map(() => null);

  let atr = 0;
  for (let i = 0; i < period; i++) {
    atr += trueRanges[i];
  }
  atr /= period;
  result[period - 1] = atr;

  // Wilder's smoothing for remaining
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
    result[i] = atr;
  }

  return result.reverse();
}

// Returns just the latest ATR value
export function latestATR(ohlc: OHLCV[], period: number = 14): number | null {
  const atrs = calculateATR(ohlc, period);
  return atrs[0] ?? null;
}

// ── Stochastic Oscillator ───────────────────────────────────────

export interface StochasticPoint {
  k: number | null;
  d: number | null;
}

export function calculateStochastic(
  ohlc: OHLCV[],
  kPeriod: number = 14,
  dPeriod: number = 3
): StochasticPoint[] {
  if (ohlc.length < kPeriod) return ohlc.map(() => ({ k: null, d: null }));

  // Data comes newest-first, reverse for calculation
  const reversed = [...ohlc].reverse();
  const kValues: (number | null)[] = new Array(reversed.length).fill(null);

  for (let i = kPeriod - 1; i < reversed.length; i++) {
    let highestHigh = -Infinity;
    let lowestLow = Infinity;
    for (let j = 0; j < kPeriod; j++) {
      highestHigh = Math.max(highestHigh, reversed[i - j].high);
      lowestLow = Math.min(lowestLow, reversed[i - j].low);
    }
    const range = highestHigh - lowestLow;
    kValues[i] = range === 0 ? 50 : ((reversed[i].close - lowestLow) / range) * 100;
  }

  // %D = SMA of %K
  const dValues: (number | null)[] = new Array(reversed.length).fill(null);
  for (let i = 0; i < reversed.length; i++) {
    if (kValues[i] == null) continue;
    let count = 0;
    let sum = 0;
    for (let j = 0; j < dPeriod && i - j >= 0; j++) {
      if (kValues[i - j] != null) {
        sum += kValues[i - j]!;
        count++;
      }
    }
    if (count === dPeriod) {
      dValues[i] = sum / count;
    }
  }

  const result = kValues.map((k, i) => ({ k, d: dValues[i] }));
  return result.reverse();
}

// ── Pivot Points (Standard) ─────────────────────────────────────

export interface PivotPoints {
  pp: number;
  r1: number;
  r2: number;
  r3: number;
  s1: number;
  s2: number;
  s3: number;
}

export function calculatePivotPoints(high: number, low: number, close: number): PivotPoints {
  const pp = (high + low + close) / 3;
  return {
    pp,
    r1: 2 * pp - low,
    r2: pp + (high - low),
    r3: high + 2 * (pp - low),
    s1: 2 * pp - high,
    s2: pp - (high - low),
    s3: low - 2 * (high - pp),
  };
}

// ── Convenience: All technicals from OHLCV data ─────────────────

export interface TechnicalSummary {
  rsi14: number | null;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  ema9: number | null;
  ema21: number | null;
  ema50: number | null;
  macd: MACDPoint;
  bollingerBands: BollingerPoint;
  atr14: number | null;
  stochastic: StochasticPoint;
  pivotPoints: PivotPoints | null;
}

export function calculateAllTechnicals(ohlc: OHLCV[]): TechnicalSummary {
  const closes = ohlc.map((d) => d.close);

  const rsi14 = latestRSI(closes, 14);
  const sma20 = latestSMA(closes, 20);
  const sma50 = latestSMA(closes, 50);
  const sma200 = latestSMA(closes, 200);
  const ema9 = latestEMA(closes, 9);
  const ema21 = latestEMA(closes, 21);
  const ema50 = latestEMA(closes, 50);
  const atr14 = latestATR(ohlc, 14);

  const macdAll = calculateMACD(closes, 12, 26, 9);
  const macd = macdAll[0] ?? { macd: null, signal: null, histogram: null };

  const bbAll = calculateBollingerBands(closes, 20, 2);
  const bollingerBands = bbAll[0] ?? { upper: null, middle: null, lower: null };

  const stochAll = calculateStochastic(ohlc, 14, 3);
  const stochastic = stochAll[0] ?? { k: null, d: null };

  // Pivot points from most recent completed day
  const pivotPoints = ohlc.length >= 2
    ? calculatePivotPoints(ohlc[1].high, ohlc[1].low, ohlc[1].close)
    : null;

  return {
    rsi14,
    sma20,
    sma50,
    sma200,
    ema9,
    ema21,
    ema50,
    macd,
    bollingerBands,
    atr14,
    stochastic,
    pivotPoints,
  };
}
