import { existsSync } from 'fs'
import puppeteer, { type Browser, type LaunchOptions } from 'puppeteer'
import { ResumeDataSchema, type ResumeData } from '@one-page-resume/shared'
import * as resumesService from '../resumes/resumes.service'
import { AppError } from '../../shared/errors'

function getExecutablePathCandidates() {
  return [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  ].filter((item): item is string => Boolean(item) && existsSync(item))
}

async function launchPdfBrowser() {
  const base: LaunchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }

  try {
    return await puppeteer.launch(base)
  } catch {
    const candidates = getExecutablePathCandidates()
    for (const executablePath of candidates) {
      try {
        return await puppeteer.launch({ ...base, executablePath })
      } catch {
        continue
      }
    }
    throw new AppError('PDF 生成服务暂不可用，请安装 Chrome/Chromium 或配置 PUPPETEER_EXECUTABLE_PATH', 503)
  }
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return 'unknown error'
}

function ensurePdfFileName(name?: string, fallback?: string) {
  const normalized = (name?.trim() || fallback?.trim() || 'resume')
    .replace(/[\\/:*?"<>|]/g, '_')
  return normalized.toLowerCase().endsWith('.pdf') ? normalized : `${normalized}.pdf`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function sanitizeRichText(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
}

function joinWithDivider(parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(' | ')
}

function renderSection(title: string, bodyHtml: string) {
  if (!bodyHtml.trim()) return ''
  return `
    <section class="section">
      <h2>${escapeHtml(title)}</h2>
      ${bodyHtml}
    </section>
  `
}

function renderPersonal(personal: ResumeData['personal']) {
  const metaLine = joinWithDivider([personal.phone, personal.email, personal.location])
  const webLine = joinWithDivider([personal.website, personal.github, personal.linkedin, personal.wechat])
  const salary = personal.salaryMin || personal.salaryMax
    ? `${personal.salaryMin || ''}${personal.salaryMin && personal.salaryMax ? '-' : ''}${personal.salaryMax || ''}`
    : ''
  const intentLine = joinWithDivider([
    personal.desiredPosition,
    personal.targetCity,
    personal.jobStatus,
    salary ? `期望薪资: ${salary}` : '',
  ])

  const avatar = personal.avatarUrl
    ? `<img class="avatar" src="${escapeHtml(personal.avatarUrl)}" alt="avatar" />`
    : ''

  return `
    <header class="header">
      <div class="header-main">
        <h1>${escapeHtml(personal.name || '未命名')}</h1>
        ${personal.title ? `<p class="headline">${escapeHtml(personal.title)}</p>` : ''}
        ${metaLine ? `<p class="meta">${escapeHtml(metaLine)}</p>` : ''}
        ${webLine ? `<p class="meta">${escapeHtml(webLine)}</p>` : ''}
        ${intentLine ? `<p class="meta">${escapeHtml(intentLine)}</p>` : ''}
      </div>
      ${avatar ? `<div class="header-avatar">${avatar}</div>` : ''}
    </header>
    ${personal.summary ? `<section class="summary">${sanitizeRichText(personal.summary)}</section>` : ''}
  `
}

function renderExperience(experience: ResumeData['experience']) {
  return experience.map((item) => `
    <article class="item">
      <div class="item-title-row">
        <h3>${escapeHtml(item.company)}${item.position ? ` - ${escapeHtml(item.position)}` : ''}</h3>
        <span>${escapeHtml(item.startDate)} - ${escapeHtml(item.isCurrent ? '至今' : item.endDate || '')}</span>
      </div>
      ${item.location ? `<p class="item-sub">${escapeHtml(item.location)}</p>` : ''}
      ${item.description ? `<div class="rich">${sanitizeRichText(item.description)}</div>` : ''}
    </article>
  `).join('')
}

function renderEducation(data: ResumeData) {
  return data.education.map((item) => `
    <article class="item">
      <div class="item-title-row">
        <h3>${escapeHtml(item.school)}</h3>
        <span>${escapeHtml(item.startDate)} - ${escapeHtml(item.isCurrent ? '至今' : item.endDate || '')}</span>
      </div>
      <p class="item-sub">${escapeHtml([item.degree, item.major].filter(Boolean).join(' / '))}</p>
      ${item.location ? `<p class="item-sub">${escapeHtml(item.location)}</p>` : ''}
      ${item.gpa ? `<p class="item-sub">GPA: ${escapeHtml(item.gpa)}</p>` : ''}
      ${item.description ? `<div class="rich">${sanitizeRichText(item.description)}</div>` : ''}
    </article>
  `).join('')
}

function renderSkills(skills: ResumeData['skills']) {
  return skills.map((group) => `
    <article class="item">
      <h3>${escapeHtml(group.category)}</h3>
      <p>${escapeHtml(group.skills.join('、'))}</p>
    </article>
  `).join('')
}

function renderProjects(projects: ResumeData['projects']) {
  return projects.map((item) => `
    <article class="item">
      <div class="item-title-row">
        <h3>${escapeHtml(item.name)}${item.role ? ` - ${escapeHtml(item.role)}` : ''}</h3>
        <span>${escapeHtml(item.startDate || '')}${item.startDate || item.endDate ? ' - ' : ''}${escapeHtml(item.endDate || '')}</span>
      </div>
      ${item.url ? `<p class="item-sub">${escapeHtml(item.url)}</p>` : ''}
      ${item.description ? `<div class="rich">${sanitizeRichText(item.description)}</div>` : ''}
    </article>
  `).join('')
}

function renderCertifications(items: ResumeData['certifications']) {
  return items.map((item) => `
    <article class="item">
      <div class="item-title-row">
        <h3>${escapeHtml(item.name)}</h3>
        <span>${escapeHtml(item.date || '')}</span>
      </div>
      <p class="item-sub">${escapeHtml(item.issuer)}</p>
      ${item.url ? `<p class="item-sub">${escapeHtml(item.url)}</p>` : ''}
    </article>
  `).join('')
}

function renderCustomSections(items: ResumeData['customSections']) {
  return items.map((section) => renderSection(section.title, section.items.map((item) => `
    <article class="item">
      <div class="item-title-row">
        <h3>${escapeHtml(item.title)}</h3>
        <span>${escapeHtml(item.date || '')}</span>
      </div>
      ${item.subtitle ? `<p class="item-sub">${escapeHtml(item.subtitle)}</p>` : ''}
      ${item.description ? `<div class="rich">${sanitizeRichText(item.description)}</div>` : ''}
    </article>
  `).join(''))).join('')
}

function renderResumeHtml(title: string, data: ResumeData) {
  const sectionMap: Record<string, () => string> = {
    personal: () => '',
    experience: () => renderSection('工作经历', renderExperience(data.experience)),
    education: () => renderSection('教育经历', renderEducation(data)),
    skills: () => renderSection('技能', renderSkills(data.skills)),
    projects: () => renderSection('项目经历', renderProjects(data.projects)),
    certifications: () => renderSection('证书', renderCertifications(data.certifications)),
  }

  const orderedSections = data.meta.sectionOrder
    .map((key) => sectionMap[key]?.())
    .filter(Boolean)
    .join('')

  const fallbackSections = Object.entries(sectionMap)
    .filter(([key]) => key !== 'personal' && !data.meta.sectionOrder.includes(key))
    .map(([, render]) => render())
    .filter(Boolean)
    .join('')

  return `
    <!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
            color: #111827;
            background: #f3f4f6;
          }
          .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: #fff;
            padding: 12mm;
          }
          .header {
            border-bottom: 2px solid ${escapeHtml(data.meta.colorScheme)};
            padding-bottom: 12px;
            margin-bottom: 12px;
            display: flex;
            gap: 12px;
          }
          .header-main { flex: 1; }
          h1 {
            margin: 0;
            font-size: 28px;
            color: ${escapeHtml(data.meta.colorScheme)};
            line-height: 1.2;
          }
          .headline {
            margin: 4px 0 0;
            font-size: 16px;
            color: #111827;
          }
          .meta {
            margin: 4px 0 0;
            font-size: 12px;
            color: #374151;
            line-height: 1.5;
            word-break: break-word;
          }
          .header-avatar {
            width: 110px;
            height: 136px;
            flex-shrink: 0;
          }
          .avatar {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
          }
          .summary {
            font-size: 13px;
            color: #1f2937;
            line-height: 1.65;
            margin-bottom: 10px;
          }
          .summary p { margin: 0; }
          .section { margin-top: 14px; }
          .section h2 {
            margin: 0 0 8px;
            font-size: 15px;
            color: ${escapeHtml(data.meta.colorScheme)};
            border-left: 3px solid ${escapeHtml(data.meta.colorScheme)};
            padding-left: 8px;
            line-height: 1.2;
          }
          .item { margin-bottom: 8px; page-break-inside: avoid; }
          .item h3 {
            margin: 0;
            font-size: 13px;
            color: #111827;
            line-height: 1.4;
          }
          .item-title-row {
            display: flex;
            gap: 10px;
            justify-content: space-between;
            align-items: baseline;
          }
          .item-title-row span {
            flex-shrink: 0;
            color: #4b5563;
            font-size: 11px;
          }
          .item-sub {
            margin: 2px 0 0;
            color: #374151;
            font-size: 12px;
          }
          .rich {
            margin-top: 4px;
            color: #1f2937;
            font-size: 12px;
            line-height: 1.6;
          }
          .rich p { margin: 0 0 4px; }
          .rich ul, .rich ol { margin: 0; padding-left: 18px; }
          .rich li { margin: 2px 0; }
          @page { size: A4; margin: 0; }
          @media print {
            body { background: #fff; }
            .page { margin: 0; }
          }
        </style>
      </head>
      <body>
        <main class="page">
          ${renderPersonal(data.personal)}
          ${orderedSections}
          ${fallbackSections}
          ${renderCustomSections(data.customSections)}
        </main>
      </body>
    </html>
  `
}

export async function generateResumePdfFromHtml(
  resumeId: string,
  userId: string,
  html: string,
  fileName?: string
) {
  const resume = await resumesService.getResume(resumeId, userId)
  const browser: Browser = await launchPdfBrowser()

  try {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(20_000)
    page.setDefaultTimeout(20_000)

    try {
      await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 20_000 })
    } catch (error) {
      throw new AppError(`导出 HTML 渲染失败，请重试 (${toErrorMessage(error)})`, 500)
    }

    await page.emulateMediaType('print')

    let pdf: Uint8Array
    try {
      pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm',
        },
        preferCSSPageSize: true,
      })
    } catch (error) {
      throw new AppError(`PDF 生成失败，请重试 (${toErrorMessage(error)})`, 500)
    }

    return {
      fileName: ensurePdfFileName(fileName, resume.title),
      pdf,
    }
  } finally {
    await browser.close().catch(() => undefined)
  }
}

export async function generateResumePdf(resumeId: string, userId: string) {
  const resume = await resumesService.getResume(resumeId, userId)
  let parsed: ResumeData
  try {
    parsed = ResumeDataSchema.parse(resume.content)
  } catch {
    throw new AppError('简历数据格式异常，请先保存后重试', 400)
  }
  const html = renderResumeHtml(resume.title, parsed)

  const browser: Browser = await launchPdfBrowser()

  try {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(20_000)
    page.setDefaultTimeout(20_000)

    try {
      await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 20_000 })
    } catch (error) {
      throw new AppError(`简历渲染失败，请重试 (${toErrorMessage(error)})`, 500)
    }

    let pdf: Uint8Array
    try {
      pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm',
        },
        preferCSSPageSize: true,
      })
    } catch (error) {
      throw new AppError(`PDF 生成失败，请重试 (${toErrorMessage(error)})`, 500)
    }

    return {
      fileName: `${resume.title || 'resume'}.pdf`,
      pdf,
    }
  } finally {
    await browser.close().catch(() => undefined)
  }
}
