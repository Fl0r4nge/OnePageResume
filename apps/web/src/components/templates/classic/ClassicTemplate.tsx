import { ResumeData } from '@one-page-resume/shared'

interface Props {
  data: ResumeData
}

function formatDate(dateStr?: string, isCurrent?: boolean): string {
  if (!dateStr) return ''
  try {
    const [year, month] = dateStr.split('-')
    if (!year) return ''
    if (!month) return year
    const m = new Date(Number(year), Number(month) - 1).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })
    return m
  } catch {
    return dateStr
  }
}

export default function ClassicTemplate({ data }: Props) {
  const { personal, experience, education, skills, projects, certifications, meta } = data
  const color = meta.colorScheme || '#2563eb'
  const hasJobIntent = Boolean(personal.jobStatus || personal.desiredPosition || personal.targetCity || personal.salaryMin || personal.salaryMax)

  const fontSizeClass = {
    sm: 'text-[11px]',
    md: 'text-[12px]',
    lg: 'text-[13px]',
  }[meta.fontSize || 'md']

  return (
    <div
      className={`resume-page font-sans ${fontSizeClass} leading-relaxed bg-white`}
      style={{ '--resume-color': color } as React.CSSProperties}
    >
      {/* Header */}
      <header
        className="relative px-10 h-44 bg-white border-t-[16px] border-solid overflow-hidden"
        style={{ borderTopColor: color }}
      >
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-gray-900 max-w-[520px] px-6">
            <h1 className="text-2xl font-bold tracking-wide">
              {personal.name || '你的姓名'}
            </h1>
            {personal.title && (
              <p className="text-base mt-1">{personal.title}</p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3 text-[13px] text-gray-800">
              {personal.phone && <span>{personal.phone}</span>}
              {personal.email && <span>{personal.email}</span>}
              {personal.website && <span>博客: {personal.website}</span>}
              {personal.location && <span>{personal.location}</span>}
              {personal.desiredPosition && <span>{personal.desiredPosition}</span>}
              {personal.salaryMax && <span>{personal.salaryMax}</span>}
            </div>
          </div>
        </div>

        {personal.avatarUrl && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-24 h-32 rounded-sm overflow-hidden bg-white ring-1 ring-gray-300 p-1">
            <img src={personal.avatarUrl} alt="头像" className="w-full h-full object-contain" />
          </div>
        )}
      </header>

      <div className="px-8 py-5 space-y-4">
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
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                      <p className="text-gray-600">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                    </div>
                    <div className="text-gray-400 text-xs text-right whitespace-nowrap ml-4">
                      {formatDate(exp.startDate)} — {exp.isCurrent ? '至今' : formatDate(exp.endDate)}
                    </div>
                  </div>
                  {exp.description && (
                    <div
                      className="text-gray-700 mt-1.5 prose prose-sm max-w-none [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-0.5"
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
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{edu.school}</h3>
                    <p className="text-gray-600">{edu.degree} · {edu.major}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</p>
                  </div>
                  <div className="text-gray-400 text-xs text-right whitespace-nowrap ml-4">
                    {formatDate(edu.startDate)} — {edu.isCurrent ? '至今' : formatDate(edu.endDate)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <SectionTitle title="专业技能" color={color} />
            <div className="space-y-1.5">
              {skills.map((group) => (
                <div key={group.id} className="flex gap-2">
                  {group.category && (
                    <span className="font-semibold text-gray-700 whitespace-nowrap min-w-[80px]">
                      {group.category}:
                    </span>
                  )}
                  <span className="text-gray-600">{group.skills.join(' · ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <SectionTitle title="项目经历" color={color} />
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{proj.name}</h3>
                    {proj.role && <span className="text-gray-500">· {proj.role}</span>}
                  </div>
                  {proj.description && (
                    <div
                      className="text-gray-700 mt-1 prose prose-sm max-w-none [&>ul]:list-disc [&>ul]:pl-4"
                      dangerouslySetInnerHTML={{ __html: proj.description }}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section>
            <SectionTitle title="证书与奖项" color={color} />
            <div className="space-y-1">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between">
                  <span className="font-medium text-gray-900">{cert.name}</span>
                  <span className="text-gray-500">{cert.issuer}{cert.date ? ` · ${formatDate(cert.date)}` : ''}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ title, color }: { title: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-2.5">
      <h2 className="font-bold text-sm tracking-widest uppercase" style={{ color }}>
        {title}
      </h2>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}
