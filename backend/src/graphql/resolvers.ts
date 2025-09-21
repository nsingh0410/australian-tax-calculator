import { TaxCalculator } from '../tax-calculator';
import { TaxRateService } from '../tax-rate-service';
import { DatabaseConnection } from '../database/connection';

const db = DatabaseConnection.getInstance();
const taxRateService = new TaxRateService();
const calculator = new TaxCalculator(taxRateService);

export const resolvers = {
  Query: {
    // Get all supported tax years
    supportedYears: async () => {
      try {
        return await calculator.getSupportedYears();
      } catch (error) {
        throw new Error(`Failed to fetch supported years: ${error instanceof Error ? error.message : error}`);
      }
    },

    // Get tax brackets for a specific year
    taxBrackets: async (_: any, { year }: { year: string }) => {
      try {
        const connection = await db.connect();
        const [rows] = await connection.execute(
          'SELECT * FROM tax_brackets WHERE income_year = ? ORDER BY bracket_order',
          [year]
        );
        
        return (rows as any[]).map(row => ({
          id: row.id,
          incomeYear: row.income_year,
          bracketOrder: row.bracket_order,
          minIncome: row.min_income,
          maxIncome: row.max_income === 999999999.99 ? Infinity : row.max_income,
          taxRate: row.tax_rate,
          description: row.description,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      } catch (error) {
        throw new Error(`Failed to fetch tax brackets: ${error instanceof Error ? error.message : error}`);
      }
    },

    // Calculate tax for given income and year
    calculateTax: async (_: any, { income, year }: { income: number; year: string }) => {
      try {
        if (income < 0) {
          throw new Error('Income must be a positive number');
        }

        const isSupported = await calculator.isYearSupported(year);
        if (!isSupported) {
          const supportedYears = await calculator.getSupportedYears();
          throw new Error(`Tax year ${year} is not supported. Supported years: ${supportedYears.join(', ')}`);
        }

        const tax = await calculator.calculateTax(year, income);
        const breakdown = await calculator.getTaxBreakdown(year, income);
        
        return {
          income,
          year,
          tax,
          afterTaxIncome: income - tax,
          effectiveRate: income > 0 ? (tax / income) : 0,
          breakdown: breakdown.brackets
        };
      } catch (error) {
        throw new Error(`Tax calculation failed: ${error instanceof Error ? error.message : error}`);
      }
    },

    // Get all tax brackets (admin)
    allTaxBrackets: async () => {
      try {
        const connection = await db.connect();
        const [rows] = await connection.execute(
          'SELECT * FROM tax_brackets ORDER BY income_year, bracket_order'
        );
        
        return (rows as any[]).map(row => ({
          id: row.id,
          incomeYear: row.income_year,
          bracketOrder: row.bracket_order,
          minIncome: row.min_income,
          maxIncome: row.max_income === 999999999.99 ? Infinity : row.max_income,
          taxRate: row.tax_rate,
          description: row.description,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      } catch (error) {
        throw new Error(`Failed to fetch all tax brackets: ${error instanceof Error ? error.message : error}`);
      }
    },

    // Health check
    health: async () => {
      try {
        const isConnected = await db.testConnection();
        return {
          status: 'ok',
          database: isConnected ? 'connected' : 'disconnected',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        };
      } catch (error) {
        return {
          status: 'error',
          database: 'disconnected',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        };
      }
    }
  },

  Mutation: {
    // Add a new tax year with brackets
    addTaxYear: async (_: any, { input }: { input: { year: string; brackets: any[] } }) => {
      try {
        const { year, brackets } = input;
        
        // Validate input
        if (!year || !brackets || brackets.length === 0) {
          throw new Error('Year and brackets are required');
        }

        // Transform brackets to the expected format
        const taxBrackets = brackets.map(b => ({
          min: b.minIncome,
          max: b.maxIncome,
          rate: b.taxRate,
          description: b.description
        }));

        await taxRateService.addTaxYear(year, taxBrackets);

        return {
          year,
          bracketsAdded: brackets.length,
          success: true,
          message: `Successfully added tax year ${year} with ${brackets.length} brackets`
        };
      } catch (error) {
        return {
          year: input.year,
          bracketsAdded: 0,
          success: false,
          message: `Failed to add tax year: ${error instanceof Error ? error.message : error}`
        };
      }
    },

    // Update existing tax bracket
    updateTaxBracket: async (_: any, { id, input }: { id: number; input: any }) => {
      try {
        const connection = await db.connect();
        
        await connection.execute(
          'UPDATE tax_brackets SET min_income = ?, max_income = ?, tax_rate = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [input.minIncome, input.maxIncome === Infinity ? 999999999.99 : input.maxIncome, input.taxRate, input.description, id]
        );

        // Fetch and return updated bracket
        const [rows] = await connection.execute('SELECT * FROM tax_brackets WHERE id = ?', [id]);
        const row = (rows as any[])[0];
        
        if (!row) {
          throw new Error(`Tax bracket with id ${id} not found`);
        }

        return {
          id: row.id,
          incomeYear: row.income_year,
          bracketOrder: row.bracket_order,
          minIncome: row.min_income,
          maxIncome: row.max_income === 999999999.99 ? Infinity : row.max_income,
          taxRate: row.tax_rate,
          description: row.description,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      } catch (error) {
        throw new Error(`Failed to update tax bracket: ${error instanceof Error ? error.message : error}`);
      }
    },

    // Delete tax year and all its brackets
    deleteTaxYear: async (_: any, { year }: { year: string }) => {
      try {
        const connection = await db.connect();
        const [result] = await connection.execute(
          'DELETE FROM tax_brackets WHERE income_year = ?',
          [year]
        );
        
        return (result as any).affectedRows > 0;
      } catch (error) {
        throw new Error(`Failed to delete tax year: ${error instanceof Error ? error.message : error}`);
      }
    }
  }
};