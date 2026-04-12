import { useResumeStore } from '@/store/resumeStore'
import { Plus, Trash2, X } from 'lucide-react'
import { useState, KeyboardEvent } from 'react'

export default function SkillsForm() {
  const { data, addSkillGroup, updateSkillGroup, removeSkillGroup } = useResumeStore()
  const [inputValues, setInputValues] = useState<Record<string, string>>({})

  const addSkill = (groupIndex: number, groupId: string) => {
    const val = (inputValues[groupId] || '').trim()
    if (!val) return
    const group = data.skills[groupIndex]
    updateSkillGroup(groupIndex, { skills: [...group.skills, val] })
    setInputValues((prev) => ({ ...prev, [groupId]: '' }))
  }

  const removeSkill = (groupIndex: number, skillIndex: number) => {
    const group = data.skills[groupIndex]
    const newSkills = [...group.skills]
    newSkills.splice(skillIndex, 1)
    updateSkillGroup(groupIndex, { skills: newSkills })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, groupIndex: number, groupId: string) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill(groupIndex, groupId)
    }
  }

  return (
    <div className="space-y-3">
      {data.skills.map((group, index) => (
        <div key={group.id} className="border border-gray-200 rounded-lg p-3 bg-white space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={group.category}
              onChange={(e) => updateSkillGroup(index, { category: e.target.value })}
              placeholder="技能类别（如：前端、后端）"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button onClick={() => removeSkillGroup(index)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
              <Trash2 size={15} />
            </button>
          </div>

          {/* Skill tags */}
          <div className="flex flex-wrap gap-1.5">
            {group.skills.map((skill, si) => (
              <span key={si} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                {skill}
                <button onClick={() => removeSkill(index, si)} className="hover:text-blue-900">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>

          {/* Add skill input */}
          <div className="flex gap-2">
            <input
              value={inputValues[group.id] || ''}
              onChange={(e) => setInputValues((prev) => ({ ...prev, [group.id]: e.target.value }))}
              onKeyDown={(e) => handleKeyDown(e, index, group.id)}
              placeholder="输入技能按回车添加"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button onClick={() => addSkill(index, group.id)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100">
              <Plus size={14} />
            </button>
          </div>
        </div>
      ))}

      <button onClick={addSkillGroup} className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 text-sm transition-colors">
        <Plus size={16} />
        添加技能组
      </button>
    </div>
  )
}
