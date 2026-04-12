import { useResumeStore } from '@/store/resumeStore'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import RichTextEditor from './RichTextEditor'

export default function ProjectsForm() {
  const { data, addProject, updateProject, removeProject } = useResumeStore()
  const [expanded, setExpanded] = useState<string | null>(data.projects[0]?.id ?? null)

  return (
    <div className="space-y-2">
      {data.projects.map((proj, index) => (
        <div key={proj.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-gray-50"
            onClick={() => setExpanded(expanded === proj.id ? null : proj.id)}>
            <p className="text-sm font-medium text-gray-900 flex-1 truncate">{proj.name || '新项目'}</p>
            <div className="flex items-center gap-1 ml-2">
              <button onClick={(e) => { e.stopPropagation(); removeProject(index) }} className="p-1 text-gray-400 hover:text-red-500 rounded">
                <Trash2 size={14} />
              </button>
              {expanded === proj.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>
          </div>

          {expanded === proj.id && (
            <div className="px-3 pb-3 space-y-2.5 border-t border-gray-100 pt-2.5">
              <div className="grid grid-cols-2 gap-2">
                <Field label="项目名称" value={proj.name} onChange={(v) => updateProject(index, { name: v })} placeholder="个人博客系统" />
                <Field label="角色" value={proj.role || ''} onChange={(v) => updateProject(index, { role: v })} placeholder="全栈开发" />
              </div>
              <Field label="项目链接" value={proj.url || ''} onChange={(v) => updateProject(index, { url: v })} placeholder="https://github.com/..." />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">项目描述</label>
                <RichTextEditor value={proj.description} onChange={(v) => updateProject(index, { description: v })} />
              </div>
            </div>
          )}
        </div>
      ))}

      <button onClick={addProject} className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 text-sm transition-colors">
        <Plus size={16} />
        添加项目经历
      </button>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
    </div>
  )
}
