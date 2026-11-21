
// SQL Server connection using Windows Authentication
import sql from 'mssql/msnodesqlv8';

const config: sql.config = {
  server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
  database: process.env.DB_NAME || 'StudentPortalDB',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
    encrypt: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

declare global {
  // eslint-disable-next-line no-var
  var _sqlPool: sql.ConnectionPool | undefined;
}

async function getPool(): Promise<sql.ConnectionPool> {
  if (!global._sqlPool) {
    global._sqlPool = await new sql.ConnectionPool(config).connect();
  }
  return global._sqlPool;
}

export { sql, getPool };

export async function query<T = sql.IRecordSet<Record<string, unknown>>>(
  queryString: string,
  params?: Record<string, unknown>
): Promise<T> {
  const pool = await getPool();
  const request = pool.request();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
  }

  const result = await request.query(queryString);
  return result.recordset as T;
}
