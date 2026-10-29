export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}

export interface PasswordStrength {
  score: 1 | 2 | 3 | 4 | 5;
  label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  entropy: number;
  color: string;
  feedback: string;
}

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const AMBIGUOUS_CHARS = new Set(['i', 'I', 'l', 'L', '1', 'o', 'O', '0', '|', '`', '\'']);

export function generatePassword(options: PasswordOptions): { password: string; error?: string } {
  let charPool = '';

  const filterAmbiguous = (str: string) => {
    if (!options.excludeAmbiguous) return str;
    return str.split('').filter((c) => !AMBIGUOUS_CHARS.has(c)).join('');
  };

  const uppers = filterAmbiguous(UPPERCASE_CHARS);
  const lowers = filterAmbiguous(LOWERCASE_CHARS);
  const numbers = filterAmbiguous(NUMBER_CHARS);
  const symbols = filterAmbiguous(SYMBOL_CHARS);

  if (options.includeUppercase) charPool += uppers;
  if (options.includeLowercase) charPool += lowers;
  if (options.includeNumbers) charPool += numbers;
  if (options.includeSymbols) charPool += symbols;

  if (charPool.length === 0) {
    return { password: '', error: 'Select at least one character type' };
  }

  const length = Math.max(4, Math.min(128, options.length));
  const guaranteedChars: string[] = [];

  // Guarantee at least one of each selected set if pool allows
  const getRandomFrom = (charset: string) => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return charset[array[0] % charset.length];
  };

  if (options.includeUppercase && uppers.length > 0) guaranteedChars.push(getRandomFrom(uppers));
  if (options.includeLowercase && lowers.length > 0) guaranteedChars.push(getRandomFrom(lowers));
  if (options.includeNumbers && numbers.length > 0) guaranteedChars.push(getRandomFrom(numbers));
  if (options.includeSymbols && symbols.length > 0) guaranteedChars.push(getRandomFrom(symbols));

  const remainingLength = Math.max(0, length - guaranteedChars.length);
  const randomIndices = new Uint32Array(remainingLength);
  crypto.getRandomValues(randomIndices);

  const resultChars = [...guaranteedChars];
  for (let i = 0; i < remainingLength; i++) {
    resultChars.push(charPool[randomIndices[i] % charPool.length]);
  }

  // Shuffle using Fisher-Yates with crypto random
  for (let i = resultChars.length - 1; i > 0; i--) {
    const r = new Uint32Array(1);
    crypto.getRandomValues(r);
    const j = r[0] % (i + 1);
    [resultChars[i], resultChars[j]] = [resultChars[j], resultChars[i]];
  }

  return { password: resultChars.join('') };
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 1,
      label: 'Very Weak',
      entropy: 0,
      color: '#EF4444',
      feedback: 'Enter or generate a password to evaluate',
    };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  const entropy = Math.round(password.length * Math.log2(Math.max(1, poolSize)));

  if (entropy < 28 || password.length < 6) {
    return {
      score: 1,
      label: 'Very Weak',
      entropy,
      color: '#EF4444',
      feedback: 'Very easy to crack. Increase length and add varied characters.',
    };
  } else if (entropy < 45 || password.length < 8) {
    return {
      score: 2,
      label: 'Weak',
      entropy,
      color: '#F97316',
      feedback: 'Could be guessed by automated dictionary or brute force attacks.',
    };
  } else if (entropy < 65 || password.length < 12) {
    return {
      score: 3,
      label: 'Medium',
      entropy,
      color: '#EAB308',
      feedback: 'Good protection for general accounts. Add symbols to strengthen.',
    };
  } else if (entropy < 85 || password.length < 16) {
    return {
      score: 4,
      label: 'Strong',
      entropy,
      color: '#10B981',
      feedback: 'Strong password. Suitable for financial and sensitive accounts.',
    };
  } else {
    return {
      score: 5,
      label: 'Very Strong',
      entropy,
      color: '#059669',
      feedback: 'Excellent high-entropy master password.',
    };
  }
}
