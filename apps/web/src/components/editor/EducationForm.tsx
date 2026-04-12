import { useResumeStore } from '@/store/resumeStore'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export default function EducationForm() {
  const { data, addEducation, updateEducation, removeEducation } = useResumeStore()
  const [expanded, setExpanded] = useState<string | null>(data.education[0]?.id ?? null)

  return (
    <div className="space-y-2">
      {data.education.map((edu, index) => (
        <div key={edu.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div
            className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-gray-50"
            onClick={() => setExpanded(expanded === edu.id ? null : edu.id)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{edu.school || '新教育经历'}</p>
              {edu.degree && <p className="text-xs text-gray-500 truncate">{edu.degree} · {edu.major}</p>}
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button onClick={(e) => { e.stopPropagation(); removeEducation(index) }} className="p-1 text-gray-400 hover:text-red-500 rounded">
                <Trash2 size={14} />
              </button>
              {expanded === edu.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>
          </div>

          {expanded === edu.id && (
            <div className="px-3 pb-3 space-y-2.5 border-t border-gray-100 pt-2.5">
              <Field label="学校名称" value={edu.school} onChange={(v) => updateEducation(index, { school: v })} placeholder="北京大学" />
              <div className="grid grid-cols-2 gap-2">
                <Field label="学位" value={edu.degree} onChange={(v) => updateEducation(index, { degree: v })} placeholder="本科" />
                <Field label="专业" value={edu.major} onChange={(v) => updateEducation(index, { major: v })} placeholder="计算机科学" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="GPA" value={edu.gpa || ''} onChange={(v) => updateEducation(index, { gpa: v })} placeholder="3.8/4.0" />
                <Field label="城市" value={edu.location || ''} onChange={(v) => updateEducation(index, { location: v })} placeholder="北京" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="开始时间" value={edu.startDate} onChange={(v) => updateEducation(index, { startDate: v })} type="month" />
                <Field label="结束时间" value={edu.isCurrent ? '' : (edu.endDate || '')} onChange={(v) => updateEducation(index, { endDate: v })} type="month" disabled={edu.isCurrent} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={edu.isCurrent} onChange={(e) => updateEducation(index, { isCurrent: e.target.checked })} className="rounded" />
                至今在读
              </label>
            </div>
          )}
        </div>
      ))}

      <button onClick={addEducation} className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors text-sm">
        <Plus size={16} />
        添加教育经历
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
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50" />
    </div>
  )
}
