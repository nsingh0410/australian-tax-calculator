import { DatabaseConnection } from './database/connection';
import { RowDataPacket } from 'mysql2';

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  description: string;
}

interface TaxBracketRow extends RowDataPacket {
  min_income: number;
  max_income: number;
  tax_rate: number;
  description: string;
}

export class TaxRateService {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async getTaxBrackets(incomeYear: string): Promise<TaxBracket[]> {
    try {
      const connection = await this.db.connect();
      
      const [rows] = await connection.execute<TaxBracketRow[]>(
        'SELECT min_income, max_income, tax_rate, description FROM tax_brackets WHERE income_year = ? ORDER BY bracket_order',
        [incomeYear]
      );

      if (rows.length === 0) {
        throw new Error(`Tax rates not available for income year: ${incomeYear}`);
      }

      return rows.map(row => ({
        min: row.min_income,
        max: row.max_income === 999999999.99 ? Infinity : row.max_income,
        rate: row.tax_rate,
        description: row.description
      }));
    } catch (error) {
      console.error('Error fetching tax brackets:', error);
      throw error;
    }
  }

  async isYearSupported(incomeYear: string): Promise<boolean> {
    try {
      const connection = await this.db.connect();
      
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM tax_brackets WHERE income_year = ?',
        [incomeYear]
      );

      return (rows[0] as any).count > 0;
    } catch (error) {
      console.error('Error checking year support:', error);
      return false;
    }
  }

  async getSupportedYears(): Promise<string[]> {
    try {
      const connection = await this.db.connect();
      
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT DISTINCT income_year FROM tax_brackets ORDER BY income_year'
      );

      return rows.map(row => (row as any).income_year);
    } catch (error) {
      console.error('Error fetching supported years:', error);
      return [];
    }
  }

  async addTaxYear(incomeYear: string, brackets: TaxBracket[]): Promise<void> {
    try {
      const connection = await this.db.connect();
      
      // Start transaction
      await connection.beginTransaction();

      // Delete existing brackets for this year if they exist
      await connection.execute(
        'DELETE FROM tax_brackets WHERE income_year = ?',
        [incomeYear]
      );

      // Insert new brackets
      for (let i = 0; i < brackets.length; i++) {
        const bracket = brackets[i];
        const maxIncome = bracket.max === Infinity ? 999999999.99 : bracket.max;
        
        await connection.execute(
          'INSERT INTO tax_brackets (income_year, bracket_order, min_income, max_income, tax_rate, description) VALUES (?, ?, ?, ?, ?, ?)',
          [incomeYear, i + 1, bracket.min, maxIncome, bracket.rate, bracket.description]
        );
      }

      await connection.commit();
      console.log(`Successfully added tax year: ${incomeYear}`);
    } catch (error) {
      const connection = await this.db.connect();
      await connection.rollback();
      console.error('Error adding tax year:', error);
      throw error;
    }
  }
}