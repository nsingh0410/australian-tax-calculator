import { DatabaseConnection } from '../database/connection';
import * as fs from 'fs';
import * as path from 'path';

async function setupDatabase(): Promise<void> {
  try {
    console.log('Setting up database...');
    
    const db = DatabaseConnection.getInstance();
    const connection = await db.connect();
    
    // Read and execute the init SQL script
    const sqlPath = path.join(__dirname, '../../sql/init.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by statements and execute each one
    const statements = sqlScript.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    
    console.log('Database setup completed successfully!');
    
    await db.disconnect();
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  setupDatabase();
}