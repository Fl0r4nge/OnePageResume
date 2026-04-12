import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import * as authService from './auth.service'
import { env } from '../../config/env'
import { authenticate } from '../../shared/middleware/authenticate'

const ACCESS_TOKEN_TTL = 15 * 60 // 15 minutes
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 // 7 days

const RegisterBody = z.object({
  email: z.string().email(),
  password: z.string().min(8, '密码至少8位'),
  name: z.string().max(100).optional(),
})

const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

function setTokenCookies(reply: any, accessToken: string, refreshToken: string) {
  const isProduction = env.NODE_ENV === 'production'
  reply.setCookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: ACCESS_TOKEN_TTL,
    path: '/',
  })
  reply.setCookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_TTL,
    path: '/api/auth',
  })
}

export async function authRoutes(fastify: FastifyInstance) {
  // POST /api/auth/register
  fastify.post('/register', async (request, reply) => {
    const body = RegisterBody.parse(request.body)
    const user = await authService.registerUser(body.email, body.password, body.name)

    const accessToken = fastify.jwt.sign({ sub: user.id, email: user.email }, { expiresIn: ACCESS_TOKEN_TTL })
    const refreshToken = fastify.jwt.sign({ sub: user.id, type: 'refresh' }, { expiresIn: REFRESH_TOKEN_TTL })

    await authService.saveRefreshToken(user.id, refreshToken, new Date(Date.now() + REFRESH_TOKEN_TTL * 1000))
    setTokenCookies(reply, accessToken, refreshToken)

    return reply.status(201).send({ user })
  })

  // POST /api/auth/login
  fastify.post('/login', async (request, reply) => {
    const body = LoginBody.parse(request.body)
    const user = await authService.loginUser(body.email, body.password)

    const accessToken = fastify.jwt.sign({ sub: user.id, email: user.email }, { expiresIn: ACCESS_TOKEN_TTL })
    const refreshToken = fastify.jwt.sign({ sub: user.id, type: 'refresh' }, { expiresIn: REFRESH_TOKEN_TTL })

    await authService.saveRefreshToken(user.id, refreshToken, new Date(Date.now() + REFRESH_TOKEN_TTL * 1000))
    setTokenCookies(reply, accessToken, refreshToken)

    return reply.send({ user })
  })

  // POST /api/auth/refresh
  fastify.post('/refresh', async (request, reply) => {
    const refreshToken = (request.cookies as any)?.refresh_token
    if (!refreshToken) return reply.status(401).send({ error: '未找到刷新令牌' })

    const user = await authService.validateRefreshToken(refreshToken)
    await authService.revokeRefreshToken(refreshToken)

    const newAccessToken = fastify.jwt.sign({ sub: user.id, email: user.email }, { expiresIn: ACCESS_TOKEN_TTL })
    const newRefreshToken = fastify.jwt.sign({ sub: user.id, type: 'refresh' }, { expiresIn: REFRESH_TOKEN_TTL })

    await authService.saveRefreshToken(user.id, newRefreshToken, new Date(Date.now() + REFRESH_TOKEN_TTL * 1000))
    setTokenCookies(reply, newAccessToken, newRefreshToken)

    return reply.send({ user })
  })

  // POST /api/auth/logout
  fastify.post('/logout', { preHandler: authenticate }, async (request, reply) => {
    const refreshToken = (request.cookies as any)?.refresh_token
    if (refreshToken) await authService.revokeRefreshToken(refreshToken)

    reply.clearCookie('access_token', { path: '/' })
    reply.clearCookie('refresh_token', { path: '/api/auth' })

    return reply.send({ message: '已退出登录' })
  })

  // GET /api/auth/me
  fastify.get('/me', { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string }
    const user = await authService.getUserById(payload.sub)
    if (!user) return reply.status(404).send({ error: '用户不存在' })
    return reply.send({ user })
  })
}
