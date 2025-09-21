"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tax_rate_service_1 = require("../tax-rate-service");
async function seedDatabase() {
    try {
        console.log('Seeding database with tax data...');
        const taxRateService = new tax_rate_service_1.TaxRateService();
        // Example: Add a new tax year with different rates
        const newTaxBrackets = [
            { min: 0, max: 18200, rate: 0, description: 'Tax-free threshold' },
            { min: 18201, max: 45000, rate: 0.19, description: '19% tax rate' },
            { min: 45001, max: 120000, rate: 0.325, description: '32.5% tax rate' },
            { min: 120001, max: 180000, rate: 0.37, description: '37% tax rate' },
            { min: 180001, max: Infinity, rate: 0.45, description: '45% tax rate' }
        ];
        await taxRateService.addTaxYear('2024-2025', newTaxBrackets);
        console.log('Database seeding completed successfully!');
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    seedDatabase();
}
//# sourceMappingURL=seed-databasse.js.map