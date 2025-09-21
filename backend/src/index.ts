import * as readline from 'readline';
import { TaxCalculator } from './tax-calculator';
import { TaxRateService } from './tax-rate-service';
import { DatabaseConnection } from './database/connection';

class TaxCalculatorApp {
  private rl: readline.Interface;
  private calculator: TaxCalculator;
  private db: DatabaseConnection;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.db = DatabaseConnection.getInstance();
    const taxRateService = new TaxRateService();
    this.calculator = new TaxCalculator(taxRateService);
  }

  private question(query: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(query, resolve);
    });
  }

  private validateIncomeYear(year: string): boolean {
    const yearPattern = /^\d{4}-\d{4}$/;
    return yearPattern.test(year);
  }

  private validateIncome(income: string): boolean {
    const parsed = parseFloat(income);
    return !isNaN(parsed) && parsed >= 0;
  }

  private formatCurrency(amount: number): string {
    return `$${amount.toLocaleString('en-AU', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }

  private async showTaxBreakdown(incomeYear: string, taxableIncome: number): Promise<void> {
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
    } catch (error) {
      console.error('Error generating tax breakdown:', error);
    }
  }

  async run(): Promise<void> {
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
      let incomeYear: string;
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
      let incomeInput: string;
      let taxableIncome: number;
      do {
        incomeInput = await this.question('Please enter your total taxable income for the full income year: ');
        if (!this.validateIncome(incomeInput)) {
          console.log('Please enter a valid income amount (numbers only)');
        } else {
          taxableIncome = parseFloat(incomeInput);
        }
      } while (!this.validateIncome(incomeInput));

      // Calculate tax
      const tax = await this.calculator.calculateTax(incomeYear, taxableIncome!);
      console.log(`\nThe estimated tax on your taxable income is: ${this.formatCurrency(tax)}`);

      // Ask if user wants detailed breakdown
      const showBreakdown = await this.question('\nWould you like to see a detailed tax breakdown? (y/n): ');
      if (showBreakdown.toLowerCase().startsWith('y')) {
        await this.showTaxBreakdown(incomeYear, taxableIncome!);
      }

    } catch (error) {
      console.error('An error occurred:', error instanceof Error ? error.message : error);
    } finally {
      await this.db.disconnect();
      this.rl.close();
    }
  }
}

// Run the application
if (require.main === module) {
  const app = new TaxCalculatorApp();
  app.run().catch(console.error);
}

export { TaxCalculatorApp };