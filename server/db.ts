import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Types for connection configuration
interface DatabaseConfig {
  connectionString: string;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  acquireTimeoutMillis: number;
  allowExitOnIdle: boolean;
}

/**
 * Validates and returns the DATABASE_URL from environment variables
 * Provides clear error messages if not available
 */
function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("\n❌ DATABASE_URL environment variable is not set!");
    console.error("📝 To fix this issue:");
    console.error("   1. Ensure PostgreSQL database is provisioned");
    console.error("   2. Check environment variable configuration");
    console.error("   3. For Replit: Database should be auto-provisioned");
    console.error("   4. Expected format: postgresql://user:password@host:port/database\n");
    
    throw new Error(
      "DATABASE_URL is required. Please provision a database or check your environment configuration."
    );
  }

  // Validate URL format
  try {
    new URL(databaseUrl);
  } catch (error) {
    console.error("\n❌ Invalid DATABASE_URL format!");
    console.error("📝 Expected format: postgresql://user:password@host:port/database\n");
    throw new Error("DATABASE_URL format is invalid. Please check the connection string.");
  }

  return databaseUrl;
}

/**
 * Creates optimized database configuration
 */
function createDatabaseConfig(): DatabaseConfig {
  const databaseUrl = getDatabaseUrl();
  
  return {
    connectionString: databaseUrl,
    max: 20,                      // Maximum connections in pool
    idleTimeoutMillis: 30000,     // Close idle connections after 30s
    connectionTimeoutMillis: 10000, // Increased to 10s for better reliability
    acquireTimeoutMillis: 60000,  // Wait up to 60s to acquire connection
    allowExitOnIdle: true         // Allow process to exit when idle
  };
}

// Lazy initialization of database connection
let poolInstance: pg.Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function initializeDatabase() {
  if (!poolInstance) {
    const config = createDatabaseConfig();
    poolInstance = new pg.Pool(config);
    
    // Log initial configuration (without sensitive data)
    console.log('🔧 Database configuration loaded:', {
      maxConnections: config.max,
      idleTimeout: config.idleTimeoutMillis,
      connectionTimeout: config.connectionTimeoutMillis,
      acquireTimeout: config.acquireTimeoutMillis
    });

    // Enhanced error handling for the pool
    poolInstance.on('error', (err, client) => {
      console.error('🔥 Unexpected error on idle database client:', err);
      console.error('📊 Pool stats:', {
        totalCount: poolInstance!.totalCount,
        idleCount: poolInstance!.idleCount,
        waitingCount: poolInstance!.waitingCount
      });
    });

    poolInstance.on('connect', (client) => {
      console.log('🔗 New database client connected');
    });

    poolInstance.on('acquire', (client) => {
      console.log('📥 Database client acquired from pool');
    });

    poolInstance.on('remove', (client) => {
      console.log('📤 Database client removed from pool');
    });

    // Create Drizzle instance with schema
    dbInstance = drizzle(poolInstance, { 
      schema,
      logger: process.env.NODE_ENV === 'development' ? true : false
    });
  }
  
  return { pool: poolInstance!, db: dbInstance! };
}

// Export getters that initialize on first access
export const getPool = () => initializeDatabase().pool;
export const getDb = () => initializeDatabase().db;

// For backward compatibility
export const pool = new Proxy({} as pg.Pool, {
  get(target, prop) {
    return getPool()[prop as keyof pg.Pool];
  }
});

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  }
});

/**
 * Test database connection
 * @returns Promise<boolean> - true if connection successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    const poolInstance = getPool();
    const client = await poolInstance.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

/**
 * Gracefully close database connections
 */
export async function closeDatabase(): Promise<void> {
  try {
    if (poolInstance) {
      await poolInstance.end();
      console.log('🔒 Database connections closed gracefully');
    }
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
}

/**
 * Get pool statistics for monitoring
 */
export function getPoolStats() {
  if (!poolInstance) {
    return { totalCount: 0, idleCount: 0, waitingCount: 0 };
  }
  return {
    totalCount: poolInstance.totalCount,
    idleCount: poolInstance.idleCount,
    waitingCount: poolInstance.waitingCount
  };
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, closing database connections...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, closing database connections...');
  await closeDatabase();
  process.exit(0);
});

// Configuration will be logged when database is first initialized
