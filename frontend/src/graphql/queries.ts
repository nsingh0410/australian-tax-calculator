import { gql } from '@apollo/client';

export const GET_SUPPORTED_YEARS = gql`
  query GetSupportedYears {
    supportedYears
  }
`;

export const CALCULATE_TAX = gql`
  query CalculateTax($income: Float!, $year: String!) {
    calculateTax(income: $income, year: $year) {
      income
      year
      tax
      afterTaxIncome
      effectiveRate
      breakdown {
        description
        taxableAmount
        taxAmount
        rate
      }
    }
  }
`;

export const GET_HEALTH_STATUS = gql`
  query GetHealthStatus {
    health {
      status
      database
      timestamp
      version
    }
  }
`;

export const GET_ALL_TAX_BRACKETS = gql`
  query GetAllTaxBrackets {
    allTaxBrackets {
      id
      incomeYear
      bracketOrder
      minIncome
      maxIncome
      taxRate
      description
      createdAt
      updatedAt
    }
  }
`;