import { randomBytes } from 'crypto'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().default(''),
  JWT_REFRESH_SECRET: z.string().default(''),
  ANTHROPIC_API_KEY: z.string().optional(),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.format())
    process.exit(1)
  }
  const data = result.data

  if (!data.JWT_SECRET) {
    data.JWT_SECRET = randomBytes(32).toString('hex')
    console.warn('[auto] JWT_SECRET not set, generated a random one. Set it in .env to persist across restarts.')
  }
  if (!data.JWT_REFRESH_SECRET) {
    data.JWT_REFRESH_SECRET = randomBytes(32).toString('hex')
    console.warn('[auto] JWT_REFRESH_SECRET not set, generated a random one. Set it in .env to persist across restarts.')
  }

  return data
}

export const env = validateEnv()
