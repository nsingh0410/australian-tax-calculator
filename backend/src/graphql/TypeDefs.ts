import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type TaxBracket {
    id: Int!
    incomeYear: String!
    bracketOrder: Int!
    minIncome: Float!
    maxIncome: Float!
    taxRate: Float!
    description: String!
    createdAt: String!
    updatedAt: String!
  }

  type TaxCalculationBracket {
    description: String!
    taxableAmount: Float!
    taxAmount: Float!
    rate: Float!
  }

  type TaxCalculationResult {
    income: Float!
    year: String!
    tax: Float!
    afterTaxIncome: Float!
    effectiveRate: Float!
    breakdown: [TaxCalculationBracket!]!
  }

  type Query {
    # Get all supported tax years
    supportedYears: [String!]!
    
    # Get tax brackets for a specific year
    taxBrackets(year: String!): [TaxBracket!]!
    
    # Calculate tax for given income and year
    calculateTax(income: Float!, year: String!): TaxCalculationResult!
    
    # Get all tax brackets (for admin purposes)
    allTaxBrackets: [TaxBracket!]!
    
    # Health check
    health: HealthStatus!
  }

  type Mutation {
    # Add a new tax year with brackets
    addTaxYear(input: TaxYearInput!): TaxYearResult!
    
    # Update existing tax bracket
    updateTaxBracket(id: Int!, input: TaxBracketInput!): TaxBracket!
    
    # Delete tax year and all its brackets
    deleteTaxYear(year: String!): Boolean!
  }

  input TaxBracketInput {
    minIncome: Float!
    maxIncome: Float!
    taxRate: Float!
    description: String!
  }

  input TaxYearInput {
    year: String!
    brackets: [TaxBracketInput!]!
  }

  type TaxYearResult {
    year: String!
    bracketsAdded: Int!
    success: Boolean!
    message: String
  }

  type HealthStatus {
    status: String!
    database: String!
    timestamp: String!
    version: String!
  }
`;