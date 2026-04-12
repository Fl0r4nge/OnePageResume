import { useResumeStore } from '@/store/resumeStore'

const INPUT = 'bg-[#1a1d24] border border-[#3a3d4a] text-gray-100 placeholder-gray-600 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2'
const LABEL = 'block text-xs font-medium text-gray-400 mb-1'

export default function PersonalInfoForm() {
  const { data, updatePersonal } = useResumeStore()
  const p = data.personal

  const field = (label: string, key: keyof typeof p, placeholder?: string, type = 'text') => (
    <div>
      <label className={LABEL}>{label}</label>
      <input
        type={type}
        value={(p[key] as string) || ''}
        onChange={(e) => updatePersonal({ [key]: e.target.value })}
        placeholder={placeholder}
        className={INPUT}
      />
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {field('姓名', 'name', '张三')}
        {field('职位/标题', 'title', '前端工程师')}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {field('邮箱', 'email', 'zhang@example.com', 'email')}
        {field('电话', 'phone', '138-0000-0000', 'tel')}
      </div>
      {field('所在城市', 'location', '北京市')}
      <div className="grid grid-cols-2 gap-3">
        {field('LinkedIn', 'linkedin', 'linkedin.com/in/...')}
        {field('GitHub', 'github', 'github.com/...')}
      </div>
      {field('个人网站', 'website', 'https://...')}
      <div>
        <label className={LABEL}>个人简介</label>
        <textarea
          value={p.summary || ''}
          onChange={(e) => updatePersonal({ summary: e.target.value })}
          placeholder="简短介绍自己的背景、核心技能和职业目标..."
          rows={4}
          className={`${INPUT} resize-none`}
        />
      </div>
    </div>
  )
}
