import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ResumeDataSchema } from '@one-page-resume/shared'
import * as aiService from './ai.service'
import { authenticate } from '../../shared/middleware/authenticate'
import * as resumesService from '../resumes/resumes.service'

export async function aiRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate)

  // POST /api/ai/compress
  fastify.post<{ Params: { id: string } }>('/compress/:id', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }

    const body = z.object({
      overflowingSections: z.array(z.string()).default([]),
      level: z.enum(['light', 'medium', 'aggressive']).default('light'),
    }).parse(request.body)

    // Load resume and verify ownership
    const resume = await resumesService.getResume(request.params.id, userId)

    // Save snapshot before compression
    await resumesService.createSnapshot(request.params.id, userId, `AI压缩前 (${body.level})`)

    const compressed = await aiService.compressResume(
      resume.content as any,
      body.overflowingSections,
      body.level
    )

    return reply.send({ compressed })
  })
}
