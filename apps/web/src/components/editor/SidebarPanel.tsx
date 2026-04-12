import { useRef, useState } from 'react'
import { Briefcase, GraduationCap, Code2, FolderOpen, Award, User, Settings2, Plus, X, ChevronDown, Upload, Image as ImageIcon } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useResumeStore } from '@/store/resumeStore'
import SectionGroup from './SectionGroup'
import PersonalInfoForm from './PersonalInfoForm'
import ModuleManager from './ModuleManager'
import RichTextEditor from './RichTextEditor'

// ── Dark input helpers ──────────────────────────────────────────────────
const INPUT = 'bg-[#1a1d24] border border-[#3a3d4a] text-gray-100 placeholder-gray-600 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2'
const LABEL = 'block text-xs font-medium text-gray-400 mb-1'

function DarkField({ label, value, onChange, placeholder, type = 'text', disabled = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean
}) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`${INPUT} disabled:opacity-40`}
      />
    </div>
  )
}

// ── Inline form renderers ───────────────────────────────────────────────

function ExperienceInlineForm({ itemId }: { itemId: string }) {
  const { data, updateExperience } = useResumeStore()
  const index = data.experience.findIndex((e) => e.id === itemId)
  if (index === -1) return null
  const exp = data.experience[index]
  const upd = (patch: Parameters<typeof updateExperience>[1]) => updateExperience(index, patch)

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <DarkField label="公司名称" value={exp.company} onChange={(v) => upd({ company: v })} placeholder="阿里巴巴" />
        <DarkField label="职位" value={exp.position} onChange={(v) => upd({ position: v })} placeholder="高级前端工程师" />
      </div>
      <DarkField label="城市" value={exp.location || ''} onChange={(v) => upd({ location: v })} placeholder="杭州" />
      <div className="grid grid-cols-2 gap-2">
        <DarkField label="开始时间" value={exp.startDate} onChange={(v) => upd({ startDate: v })} type="month" />
        <DarkField label="结束时间" value={exp.isCurrent ? '' : (exp.endDate || '')} onChange={(v) => upd({ endDate: v })} type="month" disabled={exp.isCurrent} />
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          checked={exp.isCurrent}
          onChange={(e) => upd({ isCurrent: e.target.checked })}
          className="rounded accent-blue-500"
        />
        至今在职
      </label>
      <div>
        <label className={LABEL}>工作描述</label>
        <RichTextEditor dark value={exp.description} onChange={(v) => upd({ description: v })} />
      </div>
    </div>
  )
}

function EducationInlineForm({ itemId }: { itemId: string }) {
  const { data, updateEducation, updateMeta } = useResumeStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const index = data.education.findIndex((e) => e.id === itemId)
  if (index === -1) return null
  const edu = data.education[index]
  const upd = (patch: Parameters<typeof updateEducation>[1]) => updateEducation(index, patch)
  const canUploadLogo = edu.school.trim().length > 0
  const isFeaturedLogo = data.meta.featuredEducationId === edu.id

  const handleLogoFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        upd({ schoolLogoUrl: result })
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-2">
      <DarkField label="学校名称" value={edu.school} onChange={(v) => upd({ school: v })} placeholder="北京大学" />
      <div className="grid grid-cols-2 gap-2">
        <DarkField label="学位" value={edu.degree} onChange={(v) => upd({ degree: v })} placeholder="本科" />
        <DarkField label="专业" value={edu.major} onChange={(v) => upd({ major: v })} placeholder="计算机科学" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <DarkField label="GPA" value={edu.gpa || ''} onChange={(v) => upd({ gpa: v })} placeholder="3.8/4.0" />
        <DarkField label="城市" value={edu.location || ''} onChange={(v) => upd({ location: v })} placeholder="北京" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <DarkField label="开始时间" value={edu.startDate} onChange={(v) => upd({ startDate: v })} type="month" />
        <DarkField label="结束时间" value={edu.isCurrent ? '' : (edu.endDate || '')} onChange={(v) => upd({ endDate: v })} type="month" disabled={edu.isCurrent} />
      </div>

      <div>
        <label className={LABEL}>学校校徽</label>
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => {
              if (!canUploadLogo) {
                alert('请先填写学校名称，再上传校徽')
                return
              }
              fileRef.current?.click()
            }}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
              canUploadLogo
                ? 'border-[#3a3d4a] text-gray-300 hover:bg-[#2d3140]'
                : 'border-[#2a2d38] text-gray-500 cursor-not-allowed'
            }`}
          >
            <Upload size={12} />
            上传校徽
          </button>

          <button
            type="button"
            onClick={() => updateMeta({ featuredEducationId: isFeaturedLogo ? '' : edu.id })}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
              isFeaturedLogo
                ? 'border-blue-500/60 text-blue-300 bg-blue-500/10'
                : 'border-[#3a3d4a] text-gray-400 hover:text-gray-200'
            }`}
          >
            {isFeaturedLogo ? '已设为顶部校徽' : '设为顶部校徽'}
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleLogoFile(f)
            e.target.value = ''
          }}
        />

        {edu.schoolLogoUrl ? (
          <div className="mt-2 w-16 h-16 bg-[#1a1d24] border border-[#3a3d4a] rounded-md overflow-hidden p-1">
            <img src={edu.schoolLogoUrl} alt="学校校徽" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500">
            <ImageIcon size={12} />
            未上传校徽
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          checked={edu.isCurrent}
          onChange={(e) => upd({ isCurrent: e.target.checked })}
          className="rounded accent-blue-500"
        />
        至今在读
      </label>
    </div>
  )
}

function SkillGroupInlineForm({ itemId }: { itemId: string }) {
  const { data, updateSkillGroup } = useResumeStore()
  const [inputVal, setInputVal] = useState('')
  const index = data.skills.findIndex((s) => s.id === itemId)
  if (index === -1) return null
  const group = data.skills[index]

  const addSkill = () => {
    const val = inputVal.trim()
    if (!val) return
    updateSkillGroup(index, { skills: [...group.skills, val] })
    setInputVal('')
  }

  const removeSkill = (si: number) => {
    const next = [...group.skills]
    next.splice(si, 1)
    updateSkillGroup(index, { skills: next })
  }

  return (
    <div className="space-y-2">
      <DarkField
        label="技能类别"
        value={group.category}
        onChange={(v) => updateSkillGroup(index, { category: v })}
        placeholder="前端 / 后端 / 工具链"
      />
      <div className="flex flex-wrap gap-1.5">
        {group.skills.map((skill, si) => (
          <span key={si} className="flex items-center gap-1 bg-[#1a1d24] border border-[#3a3d4a] text-gray-300 text-xs px-2.5 py-1 rounded-full">
            {skill}
            <button onClick={() => removeSkill(si)} className="hover:text-red-400 transition-colors">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill() } }}
          placeholder="输入技能按回车添加"
          className={INPUT}
        />
        <button onClick={addSkill} className="px-3 py-1.5 bg-[#1a1d24] border border-[#3a3d4a] text-gray-400 hover:text-gray-200 rounded-lg transition-colors">
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

function ProjectInlineForm({ itemId }: { itemId: string }) {
  const { data, updateProject } = useResumeStore()
  const index = data.projects.findIndex((p) => p.id === itemId)
  if (index === -1) return null
  const proj = data.projects[index]
  const upd = (patch: Parameters<typeof updateProject>[1]) => updateProject(index, patch)

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <DarkField label="项目名称" value={proj.name} onChange={(v) => upd({ name: v })} placeholder="个人博客系统" />
        <DarkField label="角色" value={proj.role || ''} onChange={(v) => upd({ role: v })} placeholder="全栈开发" />
      </div>
      <DarkField label="项目链接" value={proj.url || ''} onChange={(v) => upd({ url: v })} placeholder="https://github.com/..." />
      <div>
        <label className={LABEL}>项目描述</label>
        <RichTextEditor dark value={proj.description} onChange={(v) => upd({ description: v })} />
      </div>
    </div>
  )
}

function CertificationInlineForm({ itemId }: { itemId: string }) {
  const { data, updateCertification } = useResumeStore()
  const index = data.certifications.findIndex((c) => c.id === itemId)
  if (index === -1) return null
  const cert = data.certifications[index]
  const upd = (patch: Parameters<typeof updateCertification>[1]) => updateCertification(index, patch)

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <DarkField label="证书名称" value={cert.name} onChange={(v) => upd({ name: v })} placeholder="AWS 解决方案架构师" />
        <DarkField label="颁发机构" value={cert.issuer} onChange={(v) => upd({ issuer: v })} placeholder="Amazon Web Services" />
      </div>
      <DarkField label="获得时间" value={cert.date || ''} onChange={(v) => upd({ date: v })} type="month" />
    </div>
  )
}

// ── Section metadata ────────────────────────────────────────────────────

const SECTION_META: Record<string, { label: string; icon: React.ElementType; addLabel: string }> = {
  experience:     { label: '工作经历', icon: Briefcase,      addLabel: '添加工作经历' },
  education:      { label: '教育经历', icon: GraduationCap,  addLabel: '添加教育经历' },
  skills:         { label: '专业技能', icon: Code2,           addLabel: '添加技能组' },
  projects:       { label: '项目经历', icon: FolderOpen,      addLabel: '添加项目经历' },
  certifications: { label: '证书奖项', icon: Award,           addLabel: '添加证书/奖项' },
}

// ── Main SidebarPanel ───────────────────────────────────────────────────

export default function SidebarPanel() {
  const {
    data,
    addExperience, removeExperience,
    addEducation, removeEducation,
    addSkillGroup, removeSkillGroup,
    addProject, removeProject,
    addCertification, removeCertification,
  } = useResumeStore()

  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [isPersonalExpanded, setIsPersonalExpanded] = useState(false)
  const [showModuleManager, setShowModuleManager] = useState(false)

  const handleExpand = (id: string | null) => setExpandedItemId(id)

  // Helpers: remove by item ID (find index, then call remove action)
  const makeRemove = <T extends { id: string }>(arr: T[], removeFn: (i: number) => void) =>
    (itemId: string) => {
      const idx = arr.findIndex((x) => x.id === itemId)
      if (idx !== -1) removeFn(idx)
    }

  const sections: Record<string, {
    items: Array<{ id: string; primary: string; secondary?: string }>
    renderForm: (itemId: string) => React.ReactNode
    onAdd: () => void
    onRemove: (id: string) => void
  }> = {
    experience: {
      items: data.experience.map((e) => ({
        id: e.id,
        primary: e.position || '新工作经历',
        secondary: e.company || undefined,
      })),
      renderForm: (id) => <ExperienceInlineForm itemId={id} />,
      onAdd: addExperience,
      onRemove: makeRemove(data.experience, removeExperience),
    },
    education: {
      items: data.education.map((e) => ({
        id: e.id,
        primary: e.school || '新教育经历',
        secondary: [e.degree, e.major].filter(Boolean).join(' · ') || undefined,
      })),
      renderForm: (id) => <EducationInlineForm itemId={id} />,
      onAdd: addEducation,
      onRemove: makeRemove(data.education, removeEducation),
    },
    skills: {
      items: data.skills.map((s) => ({
        id: s.id,
        primary: s.category || '技能组',
        secondary: s.skills.slice(0, 3).join(', ') || undefined,
      })),
      renderForm: (id) => <SkillGroupInlineForm itemId={id} />,
      onAdd: addSkillGroup,
      onRemove: makeRemove(data.skills, removeSkillGroup),
    },
    projects: {
      items: data.projects.map((p) => ({
        id: p.id,
        primary: p.name || '新项目',
        secondary: p.role || undefined,
      })),
      renderForm: (id) => <ProjectInlineForm itemId={id} />,
      onAdd: addProject,
      onRemove: makeRemove(data.projects, removeProject),
    },
    certifications: {
      items: data.certifications.map((c) => ({
        id: c.id,
        primary: c.name || '新证书',
        secondary: c.issuer || undefined,
      })),
      renderForm: (id) => <CertificationInlineForm itemId={id} />,
      onAdd: addCertification,
      onRemove: makeRemove(data.certifications, removeCertification),
    },
  }

  const visibleSectionIds = data.meta.sectionOrder.filter((id) => id !== 'personal')

  return (
    <div className="relative w-full h-full bg-[#1c1f26] flex flex-col overflow-hidden">
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d3140] flex-shrink-0">
        <span className="text-sm font-semibold text-gray-100">简历编辑</span>
        <button
          onClick={() => setShowModuleManager(true)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-[#2d3140] transition-colors"
        >
          <Settings2 size={13} />
          模块管理
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {/* Personal info */}
        <div className="bg-[#252830] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setIsPersonalExpanded((prev) => !prev)}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-[#2d3140] transition-colors"
          >
            <User size={15} className="text-gray-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-200 flex-1">基本信息</span>
            <ChevronDown
              size={14}
              className={`text-gray-500 transition-transform ${isPersonalExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          {isPersonalExpanded && (
            <div className="px-3 pb-3 border-t border-[#2d3140]">
              <div className="pt-3">
                <PersonalInfoForm />
              </div>
            </div>
          )}
        </div>

        {/* Dynamic sections */}
        {visibleSectionIds.map((sectionId) => {
          const meta = SECTION_META[sectionId]
          const sec = sections[sectionId]
          if (!meta || !sec) return null
          return (
            <SectionGroup
              key={sectionId}
              sectionId={sectionId}
              label={meta.label}
              icon={meta.icon}
              items={sec.items}
              expandedItemId={expandedItemId}
              onExpandItem={handleExpand}
              onAdd={() => {
                sec.onAdd()
                // Auto-expand newly added item after store update
                setTimeout(() => {
                  const store = useResumeStore.getState()
                  const arr: Array<{ id: string }> =
                    sectionId === 'experience' ? store.data.experience :
                    sectionId === 'education' ? store.data.education :
                    sectionId === 'skills' ? store.data.skills :
                    sectionId === 'projects' ? store.data.projects :
                    store.data.certifications
                  const last = arr[arr.length - 1]
                  if (last) setExpandedItemId(last.id)
                }, 0)
              }}
              onRemove={sec.onRemove}
              renderForm={sec.renderForm}
              addLabel={meta.addLabel}
            />
          )
        })}
      </div>

      {/* Module manager overlay */}
      <AnimatePresence>
        {showModuleManager && (
          <ModuleManager onClose={() => setShowModuleManager(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
