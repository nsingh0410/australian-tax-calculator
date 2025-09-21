import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connection: mysql.Connection | null = null;

  private config: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'tax_calculator',
    user: process.env.DB_USER || 'taxapp',
    password: process.env.DB_PASSWORD || 'taxpassword123'
  };

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<mysql.Connection> {
    if (!this.connection) {
      try {
        this.connection = await mysql.createConnection(this.config);
        console.log('Connected to MySQL database');
      } catch (error) {
        console.error('Failed to connect to database:', error);
        throw error;
      }
    }
    return this.connection;
  }

  public async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      console.log('Disconnected from MySQL database');
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      const conn = await this.connect();
      await conn.ping();
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}