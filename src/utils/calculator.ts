/**
 * Safe expression evaluation for the Calculator tool
 * Handles +, -, *, /, %, parenthesis, and precedence
 */

export function evaluateExpression(expression: string): { result: number; error: string | null } {
  const sanitized = expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\s+/g, '');

  if (!sanitized) {
    return { result: 0, error: null };
  }

  // Check for invalid characters
  if (!/^[-+*/%().0-9]+$/.test(sanitized)) {
    return { result: 0, error: 'Invalid characters in expression' };
  }

  // Tokenize
  const tokens: (number | string)[] = [];
  let i = 0;
  const len = sanitized.length;

  while (i < len) {
    const c = sanitized[i];

    if ('+-*/%()'.includes(c)) {
      // Check if unary minus
      if (c === '-' && (i === 0 || '(*+/'.includes(sanitized[i - 1]))) {
        let numStr = '-';
        i++;
        while (i < len && /[0-9.]/.test(sanitized[i])) {
          numStr += sanitized[i];
          i++;
        }
        if (numStr === '-') {
          return { result: 0, error: 'Malformed expression' };
        }
        tokens.push(parseFloat(numStr));
        continue;
      }
      tokens.push(c);
      i++;
    } else if (/[0-9.]/.test(c)) {
      let numStr = '';
      while (i < len && /[0-9.]/.test(sanitized[i])) {
        numStr += sanitized[i];
        i++;
      }
      if ((numStr.match(/\./g) || []).length > 1) {
        return { result: 0, error: 'Multiple decimals in number' };
      }
      tokens.push(parseFloat(numStr));
    } else {
      i++;
    }
  }

  // Shunting-yard algorithm to RPN
  const outputQueue: (number | string)[] = [];
  const opStack: string[] = [];

  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '%': 2,
  };

  for (const token of tokens) {
    if (typeof token === 'number') {
      outputQueue.push(token);
    } else if ('+-*/%'.includes(token)) {
      while (
        opStack.length > 0 &&
        opStack[opStack.length - 1] !== '(' &&
        precedence[opStack[opStack.length - 1]] >= precedence[token]
      ) {
        outputQueue.push(opStack.pop()!);
      }
      opStack.push(token);
    } else if (token === '(') {
      opStack.push(token);
    } else if (token === ')') {
      let foundMatching = false;
      while (opStack.length > 0) {
        const top = opStack.pop()!;
        if (top === '(') {
          foundMatching = true;
          break;
        }
        outputQueue.push(top);
      }
      if (!foundMatching) {
        return { result: 0, error: 'Mismatched parentheses' };
      }
    }
  }

  while (opStack.length > 0) {
    const top = opStack.pop()!;
    if (top === '(' || top === ')') {
      return { result: 0, error: 'Mismatched parentheses' };
    }
    outputQueue.push(top);
  }

  // Evaluate RPN
  const evalStack: number[] = [];
  for (const token of outputQueue) {
    if (typeof token === 'number') {
      evalStack.push(token);
    } else {
      if (evalStack.length < 2) {
        return { result: 0, error: 'Malformed expression' };
      }
      const b = evalStack.pop()!;
      const a = evalStack.pop()!;
      let res = 0;
      switch (token) {
        case '+':
          res = a + b;
          break;
        case '-':
          res = a - b;
          break;
        case '*':
          res = a * b;
          break;
        case '/':
          if (b === 0) return { result: 0, error: 'Cannot divide by zero' };
          res = a / b;
          break;
        case '%':
          if (b === 0) return { result: 0, error: 'Cannot divide by zero' };
          res = (a * b) / 100;
          break;
      }
      evalStack.push(res);
    }
  }

  if (evalStack.length !== 1) {
    return { result: 0, error: 'Malformed expression' };
  }

  const finalVal = evalStack[0];
  if (!Number.isFinite(finalVal) || Number.isNaN(finalVal)) {
    return { result: 0, error: 'Calculation error' };
  }

  // Round slightly to eliminate floating point weirdness e.g. 0.1 + 0.2 = 0.30000000000000004
  const rounded = Math.round(finalVal * 1e12) / 1e12;
  return { result: rounded, error: null };
}
