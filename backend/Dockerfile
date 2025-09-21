FROM node:18-alpine

WORKDIR /app

# Install MySQL client for healthcheck
RUN apk add --no-cache mysql-client

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY jest.config.js ./

# Install dependencies
RUN npm ci

# Copy source code and SQL files
COPY src/ ./src/
COPY sql/ ./sql/
COPY .env ./

# Build the application
RUN npm run build

# Create a script to wait for MySQL and then start the app
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Expose port (not really needed for CLI app, but good practice)
EXPOSE 3000

# Use the entrypoint script
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]