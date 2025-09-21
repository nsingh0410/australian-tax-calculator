import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import { typeDefs } from './graphql/TypeDefs';
import { resolvers } from './graphql/resolvers';
import { DatabaseConnection } from './database/connection';
import * as dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const port = process.env.PORT || 4000;

  // Enable CORS
  app.use(cors());
  app.use(express.json());

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      // Add any context data here (e.g., user authentication)
      headers: req.headers
    }),
    // Enable GraphQL Playground
    introspection: true,
    plugins: [
    ],
   
  });

  await server.start();

  // Apply the Apollo GraphQL middleware
  server.applyMiddleware({ app, path: '/graphql' });

  // Health check endpoint
  app.get('/health', async (req, res) => {
    try {
      const db = DatabaseConnection.getInstance();
      const isConnected = await db.testConnection();
      res.json({
        status: 'ok',
        database: isConnected ? 'connected' : 'disconnected',
        graphql: 'active',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : error
      });
    }
  });

  // Start the HTTP server
  app.listen(port, () => {
    console.log(`🚀 GraphQL server ready at http://localhost:${port}${server.graphqlPath}`);
    console.log(`📊 GraphQL Playground: http://localhost:${port}${server.graphqlPath}`);
    console.log(`💚 Health check: http://localhost:${port}/health`);
  });
}

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});