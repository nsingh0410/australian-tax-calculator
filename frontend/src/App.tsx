import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from './graphql/client';
import TaxCalculatorGraphQL from './components/TaxCalculatorGraphQL';

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <TaxCalculatorGraphQL />
      </div>
    </ApolloProvider>
  );
}

export default App;