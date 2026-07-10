import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../../generated/prisma/client.ts'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('[db] DATABASE_URL is not set — check your .env file')
}

/** Parse a mysql:// connection string into a mariadb pool config. */
function poolConfigFromUrl(url: string) {
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
    database: parsed.pathname.replace(/^\//, ''),
    connectionLimit: 5,
  }
}

const adapter = new PrismaMariaDb(poolConfigFromUrl(DATABASE_URL))

export const prisma = new PrismaClient({ adapter })
