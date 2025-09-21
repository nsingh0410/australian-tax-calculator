"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxCalculatorApp = void 0;
const readline = __importStar(require("readline"));
const tax_calculator_1 = require("./tax-calculator");
const tax_rate_service_1 = require("./tax-rate-service");
const connection_1 = require("./database/connection");
class TaxCalculatorApp {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.db = connection_1.DatabaseConnection.getInstance();
        const taxRateService = new tax_rate_service_1.TaxRateService();
        this.calculator = new tax_calculator_1.TaxCalculator(taxRateService);
    }
    question(query) {
        return new Promise((resolve) => {
            this.rl.question(query, resolve);
        });
    }
    validateIncomeYear(year) {
        const yearPattern = /^\d{4}-\d{4}$/;
        return yearPattern.test(year);
    }
    validateIncome(income) {
        const parsed = parseFloat(income);
        return !isNaN(parsed) && parsed >= 0;
    }
    formatCurrency(amount) {
        return `$${amount.toLocaleString('en-AU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }
    async showTaxBreakdown(incomeYear, taxableIncome) {
        try {
            const breakdown = await this.calculator.getTaxBreakdown(incomeYear, taxableIncome);
            console.log('\n--- Tax Breakdown ---');
            console.log(`Income: ${this.formatCurrency(taxableIncome)}`);
            console.log('');
            breakdown.brackets.forEach(bracket => {
                const rate = (bracket.rate * 100).toFixed(bracket.rate === 0 ? 0 : 1);
                console.log(`${bracket.description}: ${this.formatCurrency(bracket.taxableAmount)} × ${rate}% = ${this.formatCurrency(bracket.taxAmount)}`);
            });
            console.log('');
            console.log(`Total Tax: ${this.formatCurrency(breakdown.totalTax)}`);
            console.log(`After Tax Income: ${this.formatCurrency(taxableIncome - breakdown.totalTax)}`);
            console.log('--- End Breakdown ---\n');
        }
        catch (error) {
            console.error('Error generating tax breakdown:', error);
        }
    }
    async run() {
        try {
            console.log('Australian Tax Calculator (MySQL Edition)\n');
            // Test database connection
            console.log('Connecting to database...');
            const isConnected = await this.db.testConnection();
            if (!isConnected) {
                console.error('Failed to connect to database. Please ensure MySQL is running.');
                this.rl.close();
                return;
            }
            console.log('Database connected successfully!\n');
            // Get income year
            let incomeYear;
            do {
                incomeYear = await this.question('Please enter the income year (eg: 2020-2021): ');
                if (!this.validateIncomeYear(incomeYear)) {
                    console.log('Please enter a valid income year in format YYYY-YYYY');
                }
            } while (!this.validateIncomeYear(incomeYear));
            // Check if tax rates are available
            if (!(await this.calculator.isYearSupported(incomeYear))) {
                console.log(`Sorry, tax rates for ${incomeYear} are not available.`);
                const supportedYears = await this.calculator.getSupportedYears();
                console.log('Supported years:', supportedYears.join(', '));
                this.rl.close();
                return;
            }
            // Get taxable income
            let incomeInput;
            let taxableIncome;
            do {
                incomeInput = await this.question('Please enter your total taxable income for the full income year: ');
                if (!this.validateIncome(incomeInput)) {
                    console.log('Please enter a valid income amount (numbers only)');
                }
                else {
                    taxableIncome = parseFloat(incomeInput);
                }
            } while (!this.validateIncome(incomeInput));
            // Calculate tax
            const tax = await this.calculator.calculateTax(incomeYear, taxableIncome);
            console.log(`\nThe estimated tax on your taxable income is: ${this.formatCurrency(tax)}`);
            // Ask if user wants detailed breakdown
            const showBreakdown = await this.question('\nWould you like to see a detailed tax breakdown? (y/n): ');
            if (showBreakdown.toLowerCase().startsWith('y')) {
                await this.showTaxBreakdown(incomeYear, taxableIncome);
            }
        }
        catch (error) {
            console.error('An error occurred:', error instanceof Error ? error.message : error);
        }
        finally {
            await this.db.disconnect();
            this.rl.close();
        }
    }
}
exports.TaxCalculatorApp = TaxCalculatorApp;
// Run the application
if (require.main === module) {
    const app = new TaxCalculatorApp();
    app.run().catch(console.error);
}
//# sourceMappingURL=index.js.map