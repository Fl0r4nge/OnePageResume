import { useResumeStore } from '@/store/resumeStore'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { ExperienceEntry } from '@one-page-resume/shared'
import RichTextEditor from './RichTextEditor'

export default function ExperienceForm() {
  const { data, addExperience, updateExperience, removeExperience } = useResumeStore()
  const [expanded, setExpanded] = useState<string | null>(data.experience[0]?.id ?? null)

  return (
    <div className="space-y-2">
      {data.experience.map((exp, index) => (
        <div key={exp.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {/* Header */}
          <div
            className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-gray-50"
            onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {exp.position || '新工作经历'}
              </p>
              {exp.company && <p className="text-xs text-gray-500 truncate">{exp.company}</p>}
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={(e) => { e.stopPropagation(); removeExperience(index) }}
                className="p-1 text-gray-400 hover:text-red-500 rounded"
              >
                <Trash2 size={14} />
              </button>
              {expanded === exp.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>
          </div>

          {/* Form fields */}
          {expanded === exp.id && (
            <div className="px-3 pb-3 space-y-2.5 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-2 pt-2.5">
                <Field label="公司名称" value={exp.company} onChange={(v) => updateExperience(index, { company: v })} placeholder="阿里巴巴" />
                <Field label="职位" value={exp.position} onChange={(v) => updateExperience(index, { position: v })} placeholder="高级前端工程师" />
              </div>
              <Field label="城市" value={exp.location || ''} onChange={(v) => updateExperience(index, { location: v })} placeholder="杭州" />
              <div className="grid grid-cols-2 gap-2">
                <Field label="开始时间" value={exp.startDate} onChange={(v) => updateExperience(index, { startDate: v })} type="month" />
                <Field
                  label="结束时间"
                  value={exp.isCurrent ? '' : (exp.endDate || '')}
                  onChange={(v) => updateExperience(index, { endDate: v })}
                  type="month"
                  disabled={exp.isCurrent}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exp.isCurrent}
                  onChange={(e) => updateExperience(index, { isCurrent: e.target.checked })}
                  className="rounded"
                />
                至今在职
              </label>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">工作描述</label>
                <RichTextEditor
                  value={exp.description}
                  onChange={(v) => updateExperience(index, { description: v })}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addExperience}
        className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors text-sm"
      >
        <Plus size={16} />
        添加工作经历
      </button>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', disabled = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
      />
    </div>
  )
}
