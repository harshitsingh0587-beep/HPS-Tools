export interface LoanInput {
  loanAmount: number;
  annualInterestRate: number; // in percentage e.g. 5.5
  loanDurationMonths: number;
  extraMonthlyPayment?: number;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  totalInterestToDate: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  totalRepayment: number;
  totalMonthsToPayOff: number;
  amortizationSchedule: AmortizationRow[];
  interestSavedWithExtra: number;
  monthsSavedWithExtra: number;
  isZeroInterest: boolean;
  error?: string;
}

export function calculateLoan(input: LoanInput): LoanResult {
  const { loanAmount, annualInterestRate, loanDurationMonths, extraMonthlyPayment = 0 } = input;

  if (loanAmount <= 0) {
    return {
      monthlyPayment: 0,
      totalPrincipal: 0,
      totalInterest: 0,
      totalRepayment: 0,
      totalMonthsToPayOff: 0,
      amortizationSchedule: [],
      interestSavedWithExtra: 0,
      monthsSavedWithExtra: 0,
      isZeroInterest: false,
      error: 'Loan amount must be greater than 0',
    };
  }

  if (loanDurationMonths <= 0) {
    return {
      monthlyPayment: 0,
      totalPrincipal: 0,
      totalInterest: 0,
      totalRepayment: 0,
      totalMonthsToPayOff: 0,
      amortizationSchedule: [],
      interestSavedWithExtra: 0,
      monthsSavedWithExtra: 0,
      isZeroInterest: false,
      error: 'Loan duration must be at least 1 month',
    };
  }

  const isZeroInterest = annualInterestRate <= 0;
  const monthlyRate = isZeroInterest ? 0 : annualInterestRate / 100 / 12;

  // Base monthly payment without extra payment
  let baseMonthlyPayment = 0;
  if (isZeroInterest) {
    baseMonthlyPayment = loanAmount / loanDurationMonths;
  } else {
    baseMonthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanDurationMonths))) /
      (Math.pow(1 + monthlyRate, loanDurationMonths) - 1);
  }

  // Calculate baseline schedule (without extra payments) to determine savings
  let baselineTotalInterest = 0;
  if (!isZeroInterest) {
    let bal = loanAmount;
    for (let m = 1; m <= loanDurationMonths; m++) {
      const intPaid = bal * monthlyRate;
      const princPaid = Math.min(bal, baseMonthlyPayment - intPaid);
      baselineTotalInterest += intPaid;
      bal -= princPaid;
      if (bal <= 0.001) break;
    }
  }

  // Now calculate active schedule with extraMonthlyPayment
  const schedule: AmortizationRow[] = [];
  let remainingBalance = loanAmount;
  let totalInterest = 0;
  let month = 1;
  const actualMonthlyPayment = baseMonthlyPayment + Math.max(0, extraMonthlyPayment);

  while (remainingBalance > 0.005 && month <= loanDurationMonths * 2) {
    const interestPayment = isZeroInterest ? 0 : remainingBalance * monthlyRate;
    let payment = Math.min(remainingBalance + interestPayment, actualMonthlyPayment);
    let principalPayment = payment - interestPayment;

    if (principalPayment > remainingBalance) {
      principalPayment = remainingBalance;
      payment = principalPayment + interestPayment;
    }

    remainingBalance = Math.max(0, remainingBalance - principalPayment);
    totalInterest += interestPayment;

    schedule.push({
      month,
      payment: Math.round(payment * 100) / 100,
      principalPaid: Math.round(principalPayment * 100) / 100,
      interestPaid: Math.round(interestPayment * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      totalInterestToDate: Math.round(totalInterest * 100) / 100,
    });

    if (remainingBalance <= 0.005) {
      break;
    }
    month++;
  }

  const totalRepayment = loanAmount + totalInterest;
  const interestSaved = Math.max(0, baselineTotalInterest - totalInterest);
  const monthsSaved = Math.max(0, loanDurationMonths - schedule.length);

  return {
    monthlyPayment: Math.round(baseMonthlyPayment * 100) / 100,
    totalPrincipal: loanAmount,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
    totalMonthsToPayOff: schedule.length,
    amortizationSchedule: schedule,
    interestSavedWithExtra: Math.round(interestSaved * 100) / 100,
    monthsSavedWithExtra: monthsSaved,
    isZeroInterest,
  };
}
