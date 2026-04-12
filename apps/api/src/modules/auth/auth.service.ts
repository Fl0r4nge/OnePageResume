import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '../../config/database'
import { ConflictError, UnauthorizedError } from '../../shared/errors'

const SALT_ROUNDS = 12

export async function registerUser(email: string, password: string, name?: string) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new ConflictError('该邮箱已被注册')

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
    select: { id: true, email: true, name: true, createdAt: true },
  })

  // Create a default empty resume for new users
  await prisma.resume.create({
    data: {
      userId: user.id,
      title: '我的简历',
      content: {
        meta: { templateId: 'classic', colorScheme: '#2563eb', fontSize: 'md', sectionOrder: ['personal', 'experience', 'education', 'skills', 'projects', 'certifications'] },
        personal: { name: '', title: '', email: '', phone: '', location: '', summary: '' },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        customSections: [],
      },
    },
  })

  return user
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash) throw new UnauthorizedError('邮箱或密码错误')

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) throw new UnauthorizedError('邮箱或密码错误')

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
  }
}

export async function saveRefreshToken(userId: string, token: string, expiresAt: Date) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  await prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } })
}

export async function validateRefreshToken(token: string) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } },
  })
  if (!stored || stored.expiresAt < new Date()) {
    throw new UnauthorizedError('刷新令牌无效或已过期')
  }
  return stored.user
}

export async function revokeRefreshToken(token: string) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  await prisma.refreshToken.deleteMany({ where: { tokenHash } })
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
  })
}
