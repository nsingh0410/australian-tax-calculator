import { TaxRateService } from './tax-rate-service';
export declare class TaxCalculator {
    private taxRateService;
    constructor(taxRateService: TaxRateService);
    calculateTax(incomeYear: string, taxableIncome: number): Promise<number>;
    isYearSupported(incomeYear: string): Promise<boolean>;
    getSupportedYears(): Promise<string[]>;
    getTaxBreakdown(incomeYear: string, taxableIncome: number): Promise<{
        totalTax: number;
        brackets: Array<{
            description: string;
            taxableAmount: number;
            taxAmount: number;
            rate: number;
        }>;
    }>;
}
//# sourceMappingURL=tax-calculator.d.ts.map