USE tax_calculator;

-- Tax brackets table
CREATE TABLE IF NOT EXISTS tax_brackets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    income_year VARCHAR(9) NOT NULL,
    bracket_order INT NOT NULL,
    min_income DECIMAL(12,2) NOT NULL,
    max_income DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,4) NOT NULL,
    description VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_income_year (income_year),
    INDEX idx_income_year_order (income_year, bracket_order),
    UNIQUE KEY unique_year_order (income_year, bracket_order)
);

-- Insert tax brackets for 2020-2021
INSERT INTO tax_brackets (income_year, bracket_order, min_income, max_income, tax_rate, description) VALUES
('2020-2021', 1, 0.00, 18200.00, 0.0000, 'Tax-free threshold'),
('2020-2021', 2, 18201.00, 45000.00, 0.1900, '19% tax rate'),
('2020-2021', 3, 45001.00, 120000.00, 0.3250, '32.5% tax rate'),
('2020-2021', 4, 120001.00, 180000.00, 0.3700, '37% tax rate'),
('2020-2021', 5, 180001.00, 999999999.99, 0.4500, '45% tax rate');

-- Insert tax brackets for 2021-2022
INSERT INTO tax_brackets (income_year, bracket_order, min_income, max_income, tax_rate, description) VALUES
('2021-2022', 1, 0.00, 18200.00, 0.0000, 'Tax-free threshold'),
('2021-2022', 2, 18201.00, 45000.00, 0.1900, '19% tax rate'),
('2021-2022', 3, 45001.00, 120000.00, 0.3250, '32.5% tax rate'),
('2021-2022', 4, 120001.00, 180000.00, 0.3700, '37% tax rate'),
('2021-2022', 5, 180001.00, 999999999.99, 0.4500, '45% tax rate');

-- Insert tax brackets for 2022-2023
INSERT INTO tax_brackets (income_year, bracket_order, min_income, max_income, tax_rate, description) VALUES
('2022-2023', 1, 0.00, 18200.00, 0.0000, 'Tax-free threshold'),
('2022-2023', 2, 18201.00, 45000.00, 0.1900, '19% tax rate'),
('2022-2023', 3, 45001.00, 120000.00, 0.3250, '32.5% tax rate'),
('2022-2023', 4, 120001.00, 180000.00, 0.3700, '37% tax rate'),
('2022-2023', 5, 180001.00, 999999999.99, 0.4500, '45% tax rate');

-- Insert tax brackets for 2023-2024 (with some changes for example)
INSERT INTO tax_brackets (income_year, bracket_order, min_income, max_income, tax_rate, description) VALUES
('2023-2024', 1, 0.00, 18200.00, 0.0000, 'Tax-free threshold'),
('2023-2024', 2, 18201.00, 45000.00, 0.1900, '19% tax rate'),
('2023-2024', 3, 45001.00, 120000.00, 0.3250, '32.5% tax rate'),
('2023-2024', 4, 120001.00, 180000.00, 0.3700, '37% tax rate'),
('2023-2024', 5, 180001.00, 999999999.99, 0.4500, '45% tax rate');

-- View to easily see all tax brackets
CREATE VIEW tax_brackets_summary AS
SELECT 
    income_year,
    bracket_order,
    CONCAT('$', FORMAT(min_income, 0)) as min_income_formatted,
    CONCAT('$', FORMAT(max_income, 0)) as max_income_formatted,
    CONCAT(tax_rate * 100, '%') as tax_rate_formatted,
    description
FROM tax_brackets
ORDER BY income_year DESC, bracket_order;