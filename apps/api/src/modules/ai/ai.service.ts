import Anthropic from '@anthropic-ai/sdk'
import { ResumeData, ResumeDataSchema } from '@one-page-resume/shared'
import { env } from '../../config/env'
import { AppError } from '../../shared/errors'

const client = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null

export type CompressionLevel = 'light' | 'medium' | 'aggressive'

const COMPRESSION_INSTRUCTIONS: Record<CompressionLevel, string> = {
  light: '轻度压缩：只缩短明显过长的句子，删除冗余的连接词，保留所有信息。',
  medium: '中度压缩：将所有描述缩短20-30%，合并相似的要点，保留核心事实和数据。',
  aggressive: '强力压缩：将描述压缩到最精简，每条工作经历最多保留3个要点，个人简介最多2句话。',
}

export async function compressResume(
  resumeData: ResumeData,
  overflowingSections: string[],
  level: CompressionLevel = 'light'
): Promise<ResumeData> {
  if (!client) throw new AppError('AI 服务未配置，请设置 ANTHROPIC_API_KEY', 503)

  const instruction = COMPRESSION_INSTRUCTIONS[level]

  const prompt = `你是专业的简历编辑专家。请压缩以下简历内容，使其能够恰好放入一张A4纸中。

压缩要求：${instruction}

重要规则：
- 保留所有公司名、职位名、学校名、日期、数字等具体信息
- 不要添加任何额外内容
- 只返回合法的JSON对象，不要有任何其他文字
- 保持JSON结构与输入完全相同
- 优先压缩以下溢出章节：${overflowingSections.join(', ')}

简历数据：
${JSON.stringify(resumeData, null, 2)}`

  const response = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new AppError('AI 返回了无效的格式')

  let compressed: unknown
  try {
    compressed = JSON.parse(jsonMatch[0])
  } catch {
    throw new AppError('AI 返回的 JSON 格式有误')
  }

  // Validate the returned data matches our schema
  const result = ResumeDataSchema.safeParse(compressed)
  if (!result.success) throw new AppError('AI 返回的简历数据格式验证失败')

  return result.data as ResumeData
}
