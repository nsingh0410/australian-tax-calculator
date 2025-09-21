export declare const resolvers: {
    Query: {
        supportedYears: () => Promise<string[]>;
        taxBrackets: (_: any, { year }: {
            year: string;
        }) => Promise<{
            id: any;
            incomeYear: any;
            bracketOrder: any;
            minIncome: any;
            maxIncome: any;
            taxRate: any;
            description: any;
            createdAt: any;
            updatedAt: any;
        }[]>;
        calculateTax: (_: any, { income, year }: {
            income: number;
            year: string;
        }) => Promise<{
            income: number;
            year: string;
            tax: number;
            afterTaxIncome: number;
            effectiveRate: number;
            breakdown: {
                description: string;
                taxableAmount: number;
                taxAmount: number;
                rate: number;
            }[];
        }>;
        allTaxBrackets: () => Promise<{
            id: any;
            incomeYear: any;
            bracketOrder: any;
            minIncome: any;
            maxIncome: any;
            taxRate: any;
            description: any;
            createdAt: any;
            updatedAt: any;
        }[]>;
        health: () => Promise<{
            status: string;
            database: string;
            timestamp: string;
            version: string;
        }>;
    };
    Mutation: {
        addTaxYear: (_: any, { input }: {
            input: {
                year: string;
                brackets: any[];
            };
        }) => Promise<{
            year: string;
            bracketsAdded: number;
            success: boolean;
            message: string;
        }>;
        updateTaxBracket: (_: any, { id, input }: {
            id: number;
            input: any;
        }) => Promise<{
            id: any;
            incomeYear: any;
            bracketOrder: any;
            minIncome: any;
            maxIncome: any;
            taxRate: any;
            description: any;
            createdAt: any;
            updatedAt: any;
        }>;
        deleteTaxYear: (_: any, { year }: {
            year: string;
        }) => Promise<boolean>;
    };
};
//# sourceMappingURL=resolvers.d.ts.map