import { Suspense } from 'react'
import { X } from 'lucide-react'
import { TEMPLATE_LIST } from '@/components/templates/registry'
import { useResumeStore } from '@/store/resumeStore'

interface Props {
  onClose: () => void
}

export default function TemplatePicker({ onClose }: Props) {
  const { data, updateMeta } = useResumeStore()

  const handleSelect = (templateId: string) => {
    const template = TEMPLATE_LIST.find((t) => t.id === templateId)
    updateMeta({
      templateId,
      colorScheme: template?.defaultColor || '#2563eb',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">选择模板</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 p-6">
          {TEMPLATE_LIST.map((template) => {
            const isSelected = data.meta.templateId === template.id
            return (
              <button
                key={template.id}
                onClick={() => handleSelect(template.id)}
                className={`border-2 rounded-xl p-4 text-left transition-all hover:shadow-md ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {/* Template preview thumbnail area */}
                <div
                  className="w-full aspect-[3/4] rounded-lg mb-3 flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: template.defaultColor }}
                >
                  {template.name}
                </div>
                <p className="font-semibold text-sm text-gray-900">{template.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                {isSelected && (
                  <span className="inline-block mt-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">当前使用</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
