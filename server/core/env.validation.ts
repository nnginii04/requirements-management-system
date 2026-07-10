/**
 * Fail fast at boot if required environment variables are missing or malformed,
 * with a clear message instead of an opaque runtime error deep in a request.
 */
export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const databaseUrl = config.DATABASE_URL
  if (typeof databaseUrl !== 'string' || databaseUrl.length === 0) {
    throw new Error(
      'DATABASE_URL is required. Set it in .env, e.g. mysql://root@localhost:3306/reqflow',
    )
  }
  if (!/^mysql:\/\//.test(databaseUrl)) {
    throw new Error(`DATABASE_URL must be a mysql:// connection string (got: ${databaseUrl})`)
  }

  const port = config.PORT
  if (port !== undefined && Number.isNaN(Number(port))) {
    throw new Error(`PORT must be a number (got: ${String(port)})`)
  }

  return config
}
