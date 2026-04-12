import { prisma } from '../../config/database'
import { ResumeDataSchema } from '@one-page-resume/shared'
import { NotFoundError, ForbiddenError } from '../../shared/errors'
import { nanoid } from 'nanoid'

export async function getUserResumes(userId: string) {
  return prisma.resume.findMany({
    where: { userId },
    select: { id: true, title: true, templateId: true, updatedAt: true, createdAt: true },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getResume(id: string, userId: string) {
  const resume = await prisma.resume.findUnique({ where: { id } })
  if (!resume) throw new NotFoundError('简历')
  if (resume.userId !== userId) throw new ForbiddenError()
  return resume
}

export async function getResumeByShareSlug(slug: string) {
  const resume = await prisma.resume.findUnique({
    where: { shareSlug: slug },
    select: { id: true, title: true, content: true, templateId: true, isPublic: true },
  })
  if (!resume || !resume.isPublic) throw new NotFoundError('简历')
  return resume
}

export async function createResume(userId: string, title: string = '新简历') {
  return prisma.resume.create({
    data: {
      userId,
      title,
      content: {
        meta: { templateId: 'classic', colorScheme: '#2563eb', fontSize: 'md', sectionOrder: ['personal', 'experience', 'education', 'skills', 'projects', 'certifications'] },
        personal: { name: '', title: '', email: '', phone: '', location: '', summary: '', avatarUrl: '' },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        customSections: [],
      },
    },
  })
}

export async function updateResume(id: string, userId: string, data: { title?: string; content?: unknown }) {
  const resume = await prisma.resume.findUnique({ where: { id } })
  if (!resume) throw new NotFoundError('简历')
  if (resume.userId !== userId) throw new ForbiddenError()

  // Validate content if provided
  if (data.content) {
    ResumeDataSchema.parse(data.content)
  }

  return prisma.resume.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content as any }),
    },
  })
}

export async function deleteResume(id: string, userId: string) {
  const resume = await prisma.resume.findUnique({ where: { id } })
  if (!resume) throw new NotFoundError('简历')
  if (resume.userId !== userId) throw new ForbiddenError()
  await prisma.resume.delete({ where: { id } })
}

export async function duplicateResume(id: string, userId: string) {
  const resume = await getResume(id, userId)
  return prisma.resume.create({
    data: {
      userId,
      title: `${resume.title} (副本)`,
      content: resume.content as any,
      templateId: resume.templateId,
    },
  })
}

export async function toggleShareResume(id: string, userId: string) {
  const resume = await getResume(id, userId)
  const isPublic = !resume.isPublic
  const shareSlug = isPublic ? nanoid(10) : null
  return prisma.resume.update({
    where: { id },
    data: { isPublic, shareSlug },
    select: { id: true, isPublic: true, shareSlug: true },
  })
}

export async function createSnapshot(resumeId: string, userId: string, label?: string) {
  const resume = await getResume(resumeId, userId)
  return prisma.resumeSnapshot.create({
    data: { resumeId, content: resume.content as any, label },
  })
}

export async function getSnapshots(resumeId: string, userId: string) {
  await getResume(resumeId, userId) // auth check
  return prisma.resumeSnapshot.findMany({
    where: { resumeId },
    select: { id: true, label: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
}
