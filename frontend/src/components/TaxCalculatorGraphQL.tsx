import React, { useState, useEffect } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { Calculator, DollarSign, Calendar, AlertCircle, Activity } from 'lucide-react';
import { GET_SUPPORTED_YEARS, CALCULATE_TAX, GET_HEALTH_STATUS } from '../graphql/queries';

interface TaxBracket {
  description: string;
  taxableAmount: number;
  taxAmount: number;
  rate: number;
}

interface TaxCalculationResult {
  income: number;
  year: string;
  tax: number;
  breakdown: TaxBracket[];
  afterTaxIncome: number;
  effectiveRate: number;
}

const TaxCalculatorGraphQL: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2020-2021');
  const [taxableIncome, setTaxableIncome] = useState('');
  const [calculationResult, setCalculationResult] = useState<TaxCalculationResult | null>(null);

  // GraphQL queries
  const { data: yearsData, loading: yearsLoading, error: yearsError } = useQuery(GET_SUPPORTED_YEARS);
  const { data: healthData, loading: healthLoading } = useQuery(GET_HEALTH_STATUS, {
    pollInterval: 30000 // Poll every 30 seconds
  });

  const [calculateTax, { loading: calculationLoading, error: calculationError }] = useLazyQuery(
    CALCULATE_TAX,
    {
      onCompleted: (data) => {
        if (data?.calculateTax) {
          setCalculationResult(data.calculateTax);
        }
      },
      onError: (error) => {
        console.error('GraphQL calculation error:', error);
        setCalculationResult(null);
      }
    }
  );

  // Set default year when years are loaded
  useEffect(() => {
    if (yearsData?.supportedYears && yearsData.supportedYears.length > 0) {
      if (!yearsData.supportedYears.includes(selectedYear)) {
        setSelectedYear(yearsData.supportedYears[0]);
      }
    }
  }, [yearsData, selectedYear]);

  // Auto-calculate tax when income or year changes
  useEffect(() => {
    const income = parseFloat(taxableIncome);
    
    if (taxableIncome === '' || taxableIncome === '0') {
      setCalculationResult(null);
      return;
    }
    
    if (isNaN(income) || income < 0) {
      setCalculationResult(null);
      return;
    }
    
    if (!selectedYear) {
      return;
    }

    // Debounce the GraphQL query
    const timeoutId = setTimeout(() => {
      calculateTax({
        variables: {
          income: income,
          year: selectedYear
        }
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [taxableIncome, selectedYear, calculateTax]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (rate: number): string => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  // Error handling
  const getErrorMessage = () => {
    if (yearsError) return `Failed to load supported years: ${yearsError.message}`;
    if (calculationError) return `Tax calculation error: ${calculationError.message}`;
    if (parseFloat(taxableIncome) < 0) return 'Please enter a valid income amount';
    return '';
  };

  const supportedYears = yearsData?.supportedYears || ['2020-2021', '2021-2022', '2022-2023'];
  const errorMessage = getErrorMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Calculator className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Australian Tax Calculator
            </h1>
            <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">GraphQL</div>
          </div>
          <p className="text-gray-600 text-lg">
            Calculate your estimated income tax using GraphQL API
          </p>
        </div>

        {/* Main Calculator Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4" />
                  Income Year
                  {yearsLoading && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>}
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={yearsLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-50"
                >
                  {supportedYears.map((year: string) => (
                    <option key={year} value={year}>{year}</option>
                   ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4" />
                  Total Taxable Income
                </label>
                <input
                  type="number"
                  value={taxableIncome}
                  onChange={(e) => setTaxableIncome(e.target.value)}
                  placeholder="Enter your taxable income"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tax calculation updates automatically via GraphQL
                </p>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {calculationLoading && (
                <div className="flex items-center justify-center gap-2 text-blue-600 py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span>Calculating via GraphQL...</span>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              {calculationResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Estimated Tax
                    </h3>
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(calculationResult.tax)}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      for income year {calculationResult.year}
                    </p>
                  </div>
                </div>
              )}

              {calculationResult && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gross Income:</span>
                      <span className="font-medium">{formatCurrency(calculationResult.income)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Tax:</span>
                      <span className="font-medium text-red-600">{formatCurrency(calculationResult.tax)}</span>
                    </div>
                    <div className="border-t pt-1 flex justify-between font-semibold">
                      <span>After Tax Income:</span>
                      <span className="text-green-600">
                        {formatCurrency(calculationResult.afterTaxIncome)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Effective tax rate: {formatPercentage(calculationResult.effectiveRate)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tax Breakdown */}
        {calculationResult?.breakdown && calculationResult.breakdown.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tax Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-semibold text-gray-700">Tax Bracket</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Taxable Amount</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Rate</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Tax Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {calculationResult.breakdown.map((bracket, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-gray-900">{bracket.description}</td>
                      <td className="p-3 text-right font-mono">
                        {formatCurrency(bracket.taxableAmount)}
                      </td>
                      <td className="p-3 text-center font-semibold text-blue-600">
                        {formatPercentage(bracket.rate)}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold">
                        {formatCurrency(bracket.taxAmount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td colSpan={3} className="p-3 font-bold text-gray-900">Total Tax:</td>
                    <td className="p-3 text-right font-bold text-lg">
                      {formatCurrency(calculationResult.tax)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GraphQL System Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">GraphQL API Status</h3>
            {healthLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
          </div>
          
          {healthData?.health && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  healthData.health.status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600">
                  API Status: <span className="font-medium">{healthData.health.status}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  healthData.health.database === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600">
                  Database: <span className="font-medium">{healthData.health.database}</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                GraphQL endpoint: http://localhost:4000/graphql
              </p>
              <p className="text-xs text-gray-400">
                Version: {healthData.health.version} | Last update: {new Date(healthData.health.timestamp).toLocaleString()}
              </p>
            </div>
          )}
          
          {!healthData && !healthLoading && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Connecting to GraphQL API...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Australian Tax Calculator - GraphQL Edition</p>
          <p>Tax rates based on Australian Taxation Office guidelines</p>
          <p className="mt-2 text-xs">
            Powered by GraphQL API with real-time MySQL data
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculatorGraphQL;