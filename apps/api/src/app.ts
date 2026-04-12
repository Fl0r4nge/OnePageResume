import 'dotenv/config'
import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import sensible from '@fastify/sensible'
import { env } from './config/env'
import { authRoutes } from './modules/auth/auth.routes'
import { resumesRoutes } from './modules/resumes/resumes.routes'
import { aiRoutes } from './modules/ai/ai.routes'
import { AppError } from './shared/errors'

async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
    },
  })

  // Plugins
  await app.register(sensible)
  await app.register(cookie)
  await app.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
  })
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'access_token',
      signed: false,
    },
  })
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })

  // Global error handler
  app.setErrorHandler((error: unknown, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: error.message })
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({ error: '请求数据格式有误', details: (error as any).errors })
    }
    app.log.error(error)
    return reply.status(500).send({ error: '服务器内部错误' })
  })

  // Routes
  await app.register(authRoutes, { prefix: '/api/auth' })
  await app.register(resumesRoutes, { prefix: '/api/resumes' })
  await app.register(aiRoutes, { prefix: '/api/ai' })

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  return app
}

async function main() {
  const app = await buildApp()
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    console.log(`API running at http://localhost:${env.PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

main()
