export interface TaxBracket {
    min: number;
    max: number;
    rate: number;
    description: string;
}
export declare class TaxRateService {
    private db;
    constructor();
    getTaxBrackets(incomeYear: string): Promise<TaxBracket[]>;
    isYearSupported(incomeYear: string): Promise<boolean>;
    getSupportedYears(): Promise<string[]>;
    addTaxYear(incomeYear: string, brackets: TaxBracket[]): Promise<void>;
}
//# sourceMappingURL=tax-rate-service.d.ts.map