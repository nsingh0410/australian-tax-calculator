"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxRateService = void 0;
const connection_1 = require("./database/connection");
class TaxRateService {
    constructor() {
        this.db = connection_1.DatabaseConnection.getInstance();
    }
    async getTaxBrackets(incomeYear) {
        try {
            const connection = await this.db.connect();
            const [rows] = await connection.execute('SELECT min_income, max_income, tax_rate, description FROM tax_brackets WHERE income_year = ? ORDER BY bracket_order', [incomeYear]);
            if (rows.length === 0) {
                throw new Error(`Tax rates not available for income year: ${incomeYear}`);
            }
            return rows.map(row => ({
                min: row.min_income,
                max: row.max_income === 999999999.99 ? Infinity : row.max_income,
                rate: row.tax_rate,
                description: row.description
            }));
        }
        catch (error) {
            console.error('Error fetching tax brackets:', error);
            throw error;
        }
    }
    async isYearSupported(incomeYear) {
        try {
            const connection = await this.db.connect();
            const [rows] = await connection.execute('SELECT COUNT(*) as count FROM tax_brackets WHERE income_year = ?', [incomeYear]);
            return rows[0].count > 0;
        }
        catch (error) {
            console.error('Error checking year support:', error);
            return false;
        }
    }
    async getSupportedYears() {
        try {
            const connection = await this.db.connect();
            const [rows] = await connection.execute('SELECT DISTINCT income_year FROM tax_brackets ORDER BY income_year');
            return rows.map(row => row.income_year);
        }
        catch (error) {
            console.error('Error fetching supported years:', error);
            return [];
        }
    }
    async addTaxYear(incomeYear, brackets) {
        try {
            const connection = await this.db.connect();
            // Start transaction
            await connection.beginTransaction();
            // Delete existing brackets for this year if they exist
            await connection.execute('DELETE FROM tax_brackets WHERE income_year = ?', [incomeYear]);
            // Insert new brackets
            for (let i = 0; i < brackets.length; i++) {
                const bracket = brackets[i];
                const maxIncome = bracket.max === Infinity ? 999999999.99 : bracket.max;
                await connection.execute('INSERT INTO tax_brackets (income_year, bracket_order, min_income, max_income, tax_rate, description) VALUES (?, ?, ?, ?, ?, ?)', [incomeYear, i + 1, bracket.min, maxIncome, bracket.rate, bracket.description]);
            }
            await connection.commit();
            console.log(`Successfully added tax year: ${incomeYear}`);
        }
        catch (error) {
            const connection = await this.db.connect();
            await connection.rollback();
            console.error('Error adding tax year:', error);
            throw error;
        }
    }
}
exports.TaxRateService = TaxRateService;
//# sourceMappingURL=tax-rate-service.js.map