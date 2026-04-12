import { useRef, useState } from 'react'
import { Camera, Trash2, Check, Plus, X } from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import { resumesApi } from '@/lib/api'

// ── Styles ──────────────────────────────────────────────────────────────
const INPUT = 'bg-[#1a1d24] border border-[#3a3d4a] text-gray-100 placeholder-gray-600 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2'
const LABEL = 'block text-xs font-medium text-gray-400 mb-1'
const SECTION_TITLE = 'text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2'

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={INPUT} />
    </div>
  )
}

// ── Avatar Section ──────────────────────────────────────────────────────
function AvatarSection({ avatarUrl, onUpdate }: { avatarUrl?: string; onUpdate: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        onUpdate(result)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex items-center gap-4">
      {/* Avatar preview */}
      <div
        className="w-20 h-24 rounded-md bg-[#1a1d24] border border-[#3a3d4a] flex-shrink-0 overflow-hidden cursor-pointer hover:border-gray-500 transition-colors p-1"
        onClick={() => fileRef.current?.click()}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="头像" className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera size={20} className="text-gray-600" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5">
        {avatarUrl && (
          <button
            onClick={() => onUpdate('')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={12} />
            删除
          </button>
        )}
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          <Camera size={12} />
          {avatarUrl ? '更换头像' : '上传头像'}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
      />
    </div>
  )
}

// ── Salary options ──────────────────────────────────────────────────────
const SALARY_OPTIONS = ['面议', '3K以下', '3-5K', '5-8K', '8-12K', '12-20K', '20-30K', '30K以上']

function SalarySelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${INPUT} cursor-pointer`}>
        <option value="">请选择</option>
        {SALARY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

// ── Social Section ──────────────────────────────────────────────────────
const SOCIAL_PLATFORMS = [
  { key: 'wechat',   label: '微信' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'github',   label: 'GitHub' },
] as const

type SocialKey = typeof SOCIAL_PLATFORMS[number]['key']

function SocialSection({ values, onUpdate }: {
  values: Partial<Record<SocialKey, string>>
  onUpdate: (key: SocialKey, val: string) => void
}) {
  const [editing, setEditing] = useState<SocialKey | null>(null)
  const [draft, setDraft] = useState('')

  const startEdit = (key: SocialKey) => {
    setDraft(values[key] || '')
    setEditing(key)
  }

  const confirm = () => {
    if (editing) {
      onUpdate(editing, draft.trim())
      setEditing(null)
    }
  }

  return (
    <div>
      <p className={SECTION_TITLE}>社交信息</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {SOCIAL_PLATFORMS.map(({ key, label }) => {
          const val = values[key]
          return (
            <button
              key={key}
              onClick={() => startEdit(key)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                val
                  ? 'border-blue-500/50 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
                  : 'border-[#3a3d4a] text-gray-500 hover:text-gray-300 hover:border-gray-500'
              }`}
            >
              {val ? <Check size={11} /> : <Plus size={11} />}
              {label}
              {val ? <span className="text-gray-500 max-w-[80px] truncate">: {val}</span> : null}
            </button>
          )
        })}
      </div>

      {editing && (
        <div className="flex gap-2 mt-1">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') setEditing(null) }}
            placeholder={`输入${SOCIAL_PLATFORMS.find(p => p.key === editing)?.label ?? ''}账号或链接`}
            className={`${INPUT} flex-1`}
          />
          <button onClick={confirm} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Check size={14} />
          </button>
          {values[editing] && (
            <button onClick={() => { onUpdate(editing, ''); setEditing(null) }} className="px-3 py-2 bg-[#1a1d24] border border-[#3a3d4a] text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Extra Info Section ──────────────────────────────────────────────────
const EXTRA_FIELDS = [
  { key: 'gender',         label: '性别',      type: 'select', options: ['男', '女', '其他'] },
  { key: 'height',         label: '身高',      type: 'text',   placeholder: '如：175cm' },
  { key: 'weight',         label: '体重',      type: 'text',   placeholder: '如：65kg' },
  { key: 'ethnicity',      label: '民族',      type: 'text',   placeholder: '如：汉族' },
  { key: 'nativePlace',    label: '籍贯',      type: 'text',   placeholder: '如：北京市' },
  { key: 'politicalStatus',label: '政治面貌',  type: 'text',   placeholder: '如：中共党员' },
  { key: 'maritalStatus',  label: '婚姻状况',  type: 'text',   placeholder: '如：未婚' },
  { key: 'birthday',       label: '年龄或生日',type: 'text',   placeholder: '如：1995-08' },
  { key: 'zodiac',         label: '星座',      type: 'select', options: ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'] },
  { key: 'mbti',           label: 'MBTI',     type: 'select', options: ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'] },
] as const

type ExtraKey = typeof EXTRA_FIELDS[number]['key']

function ExtraInfoSection({ values, onUpdate }: {
  values: Partial<Record<ExtraKey, string>>
  onUpdate: (key: ExtraKey, val: string) => void
}) {
  const [editing, setEditing] = useState<ExtraKey | null>(null)
  const [draft, setDraft] = useState('')

  const startEdit = (key: ExtraKey) => {
    setDraft(values[key] || '')
    setEditing(key)
  }

  const confirm = () => {
    if (editing) {
      onUpdate(editing, draft.trim())
      setEditing(null)
    }
  }

  const fieldDef = EXTRA_FIELDS.find(f => f.key === editing)

  return (
    <div>
      <p className={SECTION_TITLE}>其他信息</p>
      <div className="flex flex-wrap gap-2">
        {EXTRA_FIELDS.map(({ key, label }) => {
          const val = values[key]
          return (
            <button
              key={key}
              onClick={() => startEdit(key)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                val
                  ? 'border-blue-500/50 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
                  : 'border-[#3a3d4a] text-gray-500 hover:text-gray-300 hover:border-gray-500'
              }`}
            >
              {val ? null : <Plus size={10} />}
              {label}
              {val ? <span className="text-gray-500 ml-1 max-w-[60px] truncate">: {val}</span> : null}
            </button>
          )
        })}
      </div>

      {editing && fieldDef && (
        <div className="flex gap-2 mt-3">
          {fieldDef.type === 'select' ? (
            <select
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className={`${INPUT} flex-1 cursor-pointer`}
            >
              <option value="">请选择{fieldDef.label}</option>
              {(fieldDef as any).options?.map((o: string) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') setEditing(null) }}
              placeholder={(fieldDef as any).placeholder}
              className={`${INPUT} flex-1`}
            />
          )}
          <button onClick={confirm} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex-shrink-0">
            <Check size={14} />
          </button>
          {values[editing] && (
            <button onClick={() => { onUpdate(editing, ''); setEditing(null) }} className="px-3 py-2 bg-[#1a1d24] border border-[#3a3d4a] text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition-colors flex-shrink-0">
              <X size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Form ───────────────────────────────────────────────────────────
export default function PersonalInfoForm() {
  const { data, updatePersonal, resumeId, markSaved, setSaving } = useResumeStore()
  const p = data.personal
  const upd = (patch: Partial<typeof p>) => updatePersonal(patch)

  const handleSave = async () => {
    if (!resumeId) return
    try {
      setSaving(true)
      await resumesApi.update(resumeId, { content: useResumeStore.getState().data })
      markSaved()
    } catch (err: any) {
      setSaving(false)
      alert(err?.response?.data?.error || '保存失败，请稍后重试')
    }
  }

  return (
    <div className="space-y-5 pt-1">
      {/* Avatar */}
      <AvatarSection avatarUrl={p.avatarUrl} onUpdate={(url) => upd({ avatarUrl: url })} />

      {/* Basic fields */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="姓名" value={p.name} onChange={(v) => upd({ name: v })} placeholder="张三" />
          <Field label="职位/标题" value={p.title} onChange={(v) => upd({ title: v })} placeholder="前端工程师" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="电话" value={p.phone} onChange={(v) => upd({ phone: v })} placeholder="138-0000-0000" type="tel" />
          <Field label="邮箱" value={p.email} onChange={(v) => upd({ email: v })} placeholder="zhang@example.com" type="email" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="现居城市" value={p.location} onChange={(v) => upd({ location: v })} placeholder="如：北京" />
          <Field label="个人网站" value={p.website || ''} onChange={(v) => upd({ website: v })} placeholder="https://..." />
        </div>
        <div>
          <label className={LABEL}>个人简介</label>
          <textarea
            value={p.summary || ''}
            onChange={(e) => upd({ summary: e.target.value })}
            placeholder="简短介绍自己的背景、核心技能和职业目标..."
            rows={3}
            className={`${INPUT} resize-none`}
          />
        </div>
      </div>

      <div className="border-t border-[#2d3140]" />

      {/* Job intent */}
      <div className="space-y-3">
        <p className={SECTION_TITLE}>求职意向</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="当前状态" value={p.jobStatus || ''} onChange={(v) => upd({ jobStatus: v })} placeholder="如：在职，看机会" />
          <Field label="意向城市" value={p.targetCity || ''} onChange={(v) => upd({ targetCity: v })} placeholder="请填写意向城市" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="期望职位" value={p.desiredPosition || ''} onChange={(v) => upd({ desiredPosition: v })} placeholder="请填写期望职位" />
          <div>
            <label className={LABEL}>期望薪资</label>
            <div className="flex items-center gap-1.5">
              <select value={p.salaryMin || ''} onChange={(e) => upd({ salaryMin: e.target.value })} className={`${INPUT} cursor-pointer`}>
                <option value="">最低薪资</option>
                {SALARY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <span className="text-gray-500 text-xs flex-shrink-0">至</span>
              <select value={p.salaryMax || ''} onChange={(e) => upd({ salaryMax: e.target.value })} className={`${INPUT} cursor-pointer`}>
                <option value="">最高薪资</option>
                {SALARY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2d3140]" />

      {/* Social */}
      <SocialSection
        values={{ wechat: p.wechat, linkedin: p.linkedin, github: p.github }}
        onUpdate={(key, val) => upd({ [key]: val })}
      />

      <div className="border-t border-[#2d3140]" />

      {/* Extra info */}
      <ExtraInfoSection
        values={{
          gender: p.gender, height: p.height, weight: p.weight,
          ethnicity: p.ethnicity, nativePlace: p.nativePlace,
          politicalStatus: p.politicalStatus, maritalStatus: p.maritalStatus,
          birthday: p.birthday, zodiac: p.zodiac, mbti: p.mbti,
        }}
        onUpdate={(key, val) => upd({ [key]: val })}
      />

      {/* Save button */}
      <div className="flex justify-end pt-1">
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          保存
        </button>
      </div>
    </div>
  )
}
