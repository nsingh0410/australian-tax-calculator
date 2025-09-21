import { TaxRateService } from './tax-rate-service';

export class TaxCalculator {
  constructor(private taxRateService: TaxRateService) {}

  async calculateTax(incomeYear: string, taxableIncome: number): Promise<number> {
    const brackets = await this.taxRateService.getTaxBrackets(incomeYear);
    let tax = 0;

    for (const bracket of brackets) {
      // Skip if income doesn't reach this bracket
      if (taxableIncome <= bracket.min) {
        continue;
      }

      // Calculate how much income falls into this bracket
      const lowerBound = bracket.min;
      const upperBound = Math.min(bracket.max, taxableIncome);
      const taxableInThisBracket = upperBound - lowerBound;

      if (taxableInThisBracket > 0) {
        const bracketTax = taxableInThisBracket * bracket.rate;
        tax += bracketTax;
      }
    }

    // rounds UP to nearest dollar (like ATO)
    return Math.ceil(tax);
  }

  async isYearSupported(incomeYear: string): Promise<boolean> {
    return await this.taxRateService.isYearSupported(incomeYear);
  }

  async getSupportedYears(): Promise<string[]> {
    return await this.taxRateService.getSupportedYears();
  }

  async getTaxBreakdown(incomeYear: string, taxableIncome: number): Promise<{
    totalTax: number;
    brackets: Array<{
      description: string;
      taxableAmount: number;
      taxAmount: number;
      rate: number;
    }>;
  }> {
    const brackets = await this.taxRateService.getTaxBrackets(incomeYear);
    let totalTax = 0;
    const breakdown: Array<{
      description: string;
      taxableAmount: number;
      taxAmount: number;
      rate: number;
    }> = [];

    for (const bracket of brackets) {
      // Skip if income doesn't reach this bracket
      if (taxableIncome <= bracket.min) {
        continue;
      }

      // Calculate how much income falls into this bracket (SAME LOGIC AS calculateTax)
      const lowerBound = bracket.min;
      const upperBound = Math.min(bracket.max, taxableIncome);
      const taxableInThisBracket = upperBound - lowerBound;

      if (taxableInThisBracket > 0) {
        const taxInThisBracket = taxableInThisBracket * bracket.rate;
        totalTax += taxInThisBracket;
        
        breakdown.push({
          description: bracket.description,
          taxableAmount: taxableInThisBracket,
          taxAmount: taxInThisBracket,
          rate: bracket.rate
        });
      }
    }

    return {
        totalTax: Math.ceil(totalTax), // Round UP to nearest dollar
        brackets: breakdown
    };
  }
}