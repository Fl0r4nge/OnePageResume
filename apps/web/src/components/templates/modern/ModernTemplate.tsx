import { ResumeData } from '@one-page-resume/shared'

interface Props {
  data: ResumeData
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    const [year, month] = dateStr.split('-')
    if (!month) return year || ''
    return new Date(Number(year), Number(month) - 1).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })
  } catch {
    return dateStr
  }
}

export default function ModernTemplate({ data }: Props) {
  const { personal, experience, education, skills, projects, certifications, meta } = data
  const color = meta.colorScheme || '#7c3aed'
  const hasJobIntent = Boolean(personal.jobStatus || personal.desiredPosition || personal.targetCity || personal.salaryMin || personal.salaryMax)

  const fontSizeClass = {
    sm: 'text-[10.5px]',
    md: 'text-[11.5px]',
    lg: 'text-[12.5px]',
  }[meta.fontSize || 'md']

  return (
    <div className={`resume-page flex ${fontSizeClass} font-sans`} style={{ '--resume-color': color } as React.CSSProperties}>
      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 text-white py-7 px-5 space-y-5" style={{ backgroundColor: color }}>
        {/* Name */}
        <div>
          <h1 className="text-lg font-bold leading-tight">{personal.name || '你的姓名'}</h1>
          {personal.title && <p className="text-xs opacity-80 mt-1">{personal.title}</p>}
        </div>

        {/* Contact */}
        <div className="space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider opacity-70 border-b border-white/30 pb-1 mb-2">联系方式</h2>
          {personal.email && <p className="text-xs opacity-90 break-all">{personal.email}</p>}
          {personal.phone && <p className="text-xs opacity-90">{personal.phone}</p>}
          {personal.location && <p className="text-xs opacity-90">{personal.location}</p>}
          {personal.website && <p className="text-xs opacity-90 break-all">{personal.website}</p>}
          {personal.linkedin && <p className="text-xs opacity-90 break-all">{personal.linkedin}</p>}
          {personal.github && <p className="text-xs opacity-90 break-all">{personal.github}</p>}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider opacity-70 border-b border-white/30 pb-1 mb-2">专业技能</h2>
            {skills.map((group) => (
              <div key={group.id} className="mb-2">
                {group.category && <p className="text-xs font-semibold opacity-90 mb-1">{group.category}</p>}
                <p className="text-xs opacity-75 leading-relaxed">{group.skills.join(', ')}</p>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider opacity-70 border-b border-white/30 pb-1 mb-2">证书</h2>
            {certifications.map((cert) => (
              <div key={cert.id} className="mb-1.5">
                <p className="text-xs font-medium opacity-90">{cert.name}</p>
                <p className="text-xs opacity-70">{cert.issuer}</p>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 py-7 px-6 space-y-5 overflow-hidden">
        {/* Summary */}
        {personal.summary && (
          <section>
            <SectionTitle title="个人简介" color={color} />
            <p className="text-gray-700 leading-relaxed">{personal.summary}</p>
          </section>
        )}

        {/* Job intent */}
        {hasJobIntent && (
          <section>
            <SectionTitle title="求职意向" color={color} />
            <div className="text-gray-700 grid grid-cols-2 gap-x-4 gap-y-1">
              {personal.jobStatus && <p><span className="text-gray-500">当前状态：</span>{personal.jobStatus}</p>}
              {personal.desiredPosition && <p><span className="text-gray-500">期望职位：</span>{personal.desiredPosition}</p>}
              {personal.targetCity && <p><span className="text-gray-500">意向城市：</span>{personal.targetCity}</p>}
              {(personal.salaryMin || personal.salaryMax) && (
                <p>
                  <span className="text-gray-500">期望薪资：</span>
                  {[personal.salaryMin, personal.salaryMax].filter(Boolean).join(' - ')}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <SectionTitle title="工作经历" color={color} />
            <div className="space-y-3.5">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                      <p className="text-gray-500 text-xs">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                    </div>
                    <span className="text-gray-400 text-xs whitespace-nowrap ml-3">
                      {formatDate(exp.startDate)} — {exp.isCurrent ? '至今' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.description && (
                    <div
                      className="text-gray-700 mt-1 prose prose-sm max-w-none [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-0.5"
                      dangerouslySetInnerHTML={{ __html: exp.description }}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <SectionTitle title="教育经历" color={color} />
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{edu.school}</h3>
                    <p className="text-gray-500 text-xs">{edu.degree} · {edu.major}</p>
                  </div>
                  <span className="text-gray-400 text-xs ml-3">
                    {formatDate(edu.startDate)} — {edu.isCurrent ? '至今' : formatDate(edu.endDate)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <SectionTitle title="项目经历" color={color} />
            <div className="space-y-2.5">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <h3 className="font-semibold text-gray-900">{proj.name}{proj.role ? <span className="font-normal text-gray-500"> · {proj.role}</span> : ''}</h3>
                  {proj.description && (
                    <div
                      className="text-gray-700 mt-0.5 prose prose-sm max-w-none [&>ul]:list-disc [&>ul]:pl-4"
                      dangerouslySetInnerHTML={{ __html: proj.description }}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function SectionTitle({ title, color }: { title: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-1 h-4 rounded-full" style={{ backgroundColor: color }} />
      <h2 className="font-bold text-xs tracking-widest uppercase text-gray-800">{title}</h2>
    </div>
  )
}
