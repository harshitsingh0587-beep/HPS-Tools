export type UnitCategory = 'length' | 'area' | 'weight' | 'temperature' | 'volume' | 'speed';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
}

export const UNIT_CATEGORIES: Record<
  UnitCategory,
  { label: string; units: UnitDefinition[] }
> = {
  length: {
    label: 'Length',
    units: [
      { id: 'm', name: 'Meter', symbol: 'm' },
      { id: 'km', name: 'Kilometer', symbol: 'km' },
      { id: 'cm', name: 'Centimeter', symbol: 'cm' },
      { id: 'mm', name: 'Millimeter', symbol: 'mm' },
      { id: 'mi', name: 'Mile', symbol: 'mi' },
      { id: 'yd', name: 'Yard', symbol: 'yd' },
      { id: 'ft', name: 'Foot', symbol: 'ft' },
      { id: 'in', name: 'Inch', symbol: 'in' },
    ],
  },
  area: {
    label: 'Area',
    units: [
      { id: 'sqm', name: 'Square Meter', symbol: 'm²' },
      { id: 'sqkm', name: 'Square Kilometer', symbol: 'km²' },
      { id: 'sqcm', name: 'Square Centimeter', symbol: 'cm²' },
      { id: 'sqft', name: 'Square Foot', symbol: 'ft²' },
      { id: 'sqyd', name: 'Square Yard', symbol: 'yd²' },
      { id: 'ac', name: 'Acre', symbol: 'ac' },
      { id: 'ha', name: 'Hectare', symbol: 'ha' },
    ],
  },
  weight: {
    label: 'Weight & Mass',
    units: [
      { id: 'kg', name: 'Kilogram', symbol: 'kg' },
      { id: 'g', name: 'Gram', symbol: 'g' },
      { id: 'mg', name: 'Milligram', symbol: 'mg' },
      { id: 'lb', name: 'Pound', symbol: 'lb' },
      { id: 'oz', name: 'Ounce', symbol: 'oz' },
      { id: 't', name: 'Metric Ton', symbol: 't' },
    ],
  },
  temperature: {
    label: 'Temperature',
    units: [
      { id: 'C', name: 'Celsius', symbol: '°C' },
      { id: 'F', name: 'Fahrenheit', symbol: '°F' },
      { id: 'K', name: 'Kelvin', symbol: 'K' },
    ],
  },
  volume: {
    label: 'Volume',
    units: [
      { id: 'l', name: 'Liter', symbol: 'L' },
      { id: 'ml', name: 'Milliliter', symbol: 'mL' },
      { id: 'gal', name: 'Gallon (US)', symbol: 'gal' },
      { id: 'qt', name: 'Quart (US)', symbol: 'qt' },
      { id: 'pt', name: 'Pint (US)', symbol: 'pt' },
      { id: 'cup', name: 'Cup (US)', symbol: 'cup' },
      { id: 'floz', name: 'Fluid Ounce (US)', symbol: 'fl oz' },
      { id: 'm3', name: 'Cubic Meter', symbol: 'm³' },
    ],
  },
  speed: {
    label: 'Speed',
    units: [
      { id: 'mps', name: 'Meters per second', symbol: 'm/s' },
      { id: 'kmh', name: 'Kilometers per hour', symbol: 'km/h' },
      { id: 'mph', name: 'Miles per hour', symbol: 'mph' },
      { id: 'knot', name: 'Knot', symbol: 'kn' },
    ],
  },
};

// Base ratios to standard SI unit (meter, kg, liter, m/s)
const LENGTH_FACTORS: Record<string, number> = {
  m: 1,
  km: 1000,
  cm: 0.01,
  mm: 0.001,
  mi: 1609.344,
  yd: 0.9144,
  ft: 0.3048,
  in: 0.0254,
};

const AREA_FACTORS: Record<string, number> = {
  sqm: 1,
  sqkm: 1000000,
  sqcm: 0.0001,
  sqft: 0.09290304,
  sqyd: 0.83612736,
  ac: 4046.8564224,
  ha: 10000,
};

const WEIGHT_FACTORS: Record<string, number> = {
  kg: 1,
  g: 0.001,
  mg: 0.000001,
  lb: 0.45359237,
  oz: 0.028349523125,
  t: 1000,
};

const VOLUME_FACTORS: Record<string, number> = {
  l: 1,
  ml: 0.001,
  gal: 3.785411784,
  qt: 0.946352946,
  pt: 0.473176473,
  cup: 0.2365882365,
  floz: 0.0295735295625,
  m3: 1000,
};

const SPEED_FACTORS: Record<string, number> = {
  mps: 1,
  kmh: 1 / 3.6,
  mph: 0.44704,
  knot: 0.514444,
};

export function convertUnits(
  value: number,
  category: UnitCategory,
  fromUnit: string,
  toUnit: string
): { result: number; error: string | null; formula: string } {
  if (isNaN(value)) {
    return { result: 0, error: 'Please enter a valid numeric value', formula: '' };
  }

  if (fromUnit === toUnit) {
    return { result: value, error: null, formula: 'Identical units (1:1)' };
  }

  if (category === 'temperature') {
    // Temperature special case
    let celsius = 0;
    if (fromUnit === 'C') celsius = value;
    else if (fromUnit === 'F') celsius = ((value - 32) * 5) / 9;
    else if (fromUnit === 'K') celsius = value - 273.15;

    let target = 0;
    let formula = '';
    if (toUnit === 'C') {
      target = celsius;
      formula = fromUnit === 'F' ? '(°F - 32) × 5/9' : 'K - 273.15';
    } else if (toUnit === 'F') {
      target = (celsius * 9) / 5 + 32;
      formula = fromUnit === 'C' ? '(°C × 9/5) + 32' : '(K - 273.15) × 9/5 + 32';
    } else if (toUnit === 'K') {
      target = celsius + 273.15;
      formula = fromUnit === 'C' ? '°C + 273.15' : '((°F - 32) × 5/9) + 273.15';
    }

    const rounded = Math.round(target * 100000) / 100000;
    return { result: rounded, error: null, formula };
  }

  let factors: Record<string, number>;
  switch (category) {
    case 'length':
      factors = LENGTH_FACTORS;
      break;
    case 'area':
      factors = AREA_FACTORS;
      break;
    case 'weight':
      factors = WEIGHT_FACTORS;
      break;
    case 'volume':
      factors = VOLUME_FACTORS;
      break;
    case 'speed':
      factors = SPEED_FACTORS;
      break;
    default:
      return { result: 0, error: 'Unsupported category', formula: '' };
  }

  const fromFactor = factors[fromUnit];
  const toFactor = factors[toUnit];

  if (!fromFactor || !toFactor) {
    return { result: 0, error: 'Invalid unit selection', formula: '' };
  }

  // Convert to base, then to target
  const baseValue = value * fromFactor;
  const targetValue = baseValue / toFactor;
  const rounded = Math.round(targetValue * 1e8) / 1e8;

  const ratio = Math.round((fromFactor / toFactor) * 1e6) / 1e6;
  const formula = `Multiply by ${ratio}`;

  return { result: rounded, error: null, formula };
}
