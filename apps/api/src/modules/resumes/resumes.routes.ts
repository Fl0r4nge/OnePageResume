import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import * as resumesService from './resumes.service'
import { authenticate } from '../../shared/middleware/authenticate'
import { generateResumePdf } from '../export/export.service'

export async function resumesRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('preHandler', authenticate)

  // GET /api/resumes — list all resumes for current user
  fastify.get('/', async (request) => {
    const { sub: userId } = request.user as { sub: string }
    return resumesService.getUserResumes(userId)
  })

  // POST /api/resumes — create new resume
  fastify.post('/', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const body = z.object({ title: z.string().optional() }).parse(request.body)
    const resume = await resumesService.createResume(userId, body.title)
    return reply.status(201).send(resume)
  })

  // GET /api/resumes/:id — get single resume
  fastify.get<{ Params: { id: string } }>('/:id', async (request) => {
    const { sub: userId } = request.user as { sub: string }
    return resumesService.getResume(request.params.id, userId)
  })

  // PATCH /api/resumes/:id — update resume (content or title)
  fastify.patch<{ Params: { id: string } }>('/:id', async (request) => {
    const { sub: userId } = request.user as { sub: string }
    const body = z.object({
      title: z.string().optional(),
      content: z.unknown().optional(),
    }).parse(request.body)
    return resumesService.updateResume(request.params.id, userId, body)
  })

  // DELETE /api/resumes/:id — delete resume
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    await resumesService.deleteResume(request.params.id, userId)
    return reply.status(204).send()
  })

  // POST /api/resumes/:id/duplicate — duplicate resume
  fastify.post<{ Params: { id: string } }>('/:id/duplicate', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const resume = await resumesService.duplicateResume(request.params.id, userId)
    return reply.status(201).send(resume)
  })

  // POST /api/resumes/:id/share — toggle share link
  fastify.post<{ Params: { id: string } }>('/:id/share', async (request) => {
    const { sub: userId } = request.user as { sub: string }
    return resumesService.toggleShareResume(request.params.id, userId)
  })

  // GET /api/resumes/:id/export/pdf — export resume as PDF file download
  fastify.get<{ Params: { id: string } }>('/:id/export/pdf', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const { fileName, pdf } = await generateResumePdf(request.params.id, userId)
    const encoded = encodeURIComponent(fileName)
    reply.header('Content-Type', 'application/pdf')
    reply.header('Content-Disposition', `attachment; filename*=UTF-8''${encoded}`)
    reply.header('Cache-Control', 'no-store')
    return reply.send(pdf)
  })

  // POST /api/resumes/:id/snapshots — save version snapshot
  fastify.post<{ Params: { id: string } }>('/:id/snapshots', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const body = z.object({ label: z.string().optional() }).parse(request.body)
    const snapshot = await resumesService.createSnapshot(request.params.id, userId, body.label)
    return reply.status(201).send(snapshot)
  })

  // GET /api/resumes/:id/snapshots — list snapshots
  fastify.get<{ Params: { id: string } }>('/:id/snapshots', async (request) => {
    const { sub: userId } = request.user as { sub: string }
    return resumesService.getSnapshots(request.params.id, userId)
  })
}
