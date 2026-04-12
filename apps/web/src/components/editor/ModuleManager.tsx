import { motion } from 'framer-motion'
import { X, GripVertical, Plus, Trash2 } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useResumeStore } from '@/store/resumeStore'

const SECTION_LABELS: Record<string, string> = {
  experience:     '工作经历',
  education:      '教育经历',
  skills:         '专业技能',
  projects:       '项目经历',
  certifications: '证书奖项',
  clubs:          '社团和组织经历',
  honors:         '荣誉奖项',
  portfolio:      '作品集',
  other:          '其他',
  custom:         '自定义模块',
}

const ALL_ADDABLE = ['experience', 'education', 'skills', 'projects', 'certifications', 'clubs', 'honors', 'other', 'portfolio', 'custom']

function SortableRow({ id, onDelete }: { id: string; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-[#1c1f26] rounded-lg px-3 py-2.5"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
      >
        <GripVertical size={14} />
      </button>
      <span className="text-sm text-gray-200 flex-1">{SECTION_LABELS[id] ?? id}</span>
      <button
        onClick={onDelete}
        className="p-1 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
        title="移除模块"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

interface ModuleManagerProps {
  onClose: () => void
}

export default function ModuleManager({ onClose }: ModuleManagerProps) {
  const { data, reorderSections } = useResumeStore()
  const sectionOrder = data.meta.sectionOrder.filter((id) => id !== 'personal')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sectionOrder.indexOf(active.id as string)
    const newIndex = sectionOrder.indexOf(over.id as string)
    const newOrder = arrayMove(sectionOrder, oldIndex, newIndex)
    reorderSections(['personal', ...newOrder])
  }

  const handleRemove = (id: string) => {
    reorderSections(['personal', ...sectionOrder.filter((s) => s !== id)])
  }

  const handleAdd = (id: string) => {
    reorderSections(['personal', ...sectionOrder, id])
  }

  const addableModules = ALL_ADDABLE.filter((id) => !sectionOrder.includes(id))

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'tween', duration: 0.22 }}
      className="absolute inset-0 z-10 bg-[#1c1f26] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d3140] flex-shrink-0">
        <span className="text-sm font-semibold text-gray-100">模块管理</span>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-[#2d3140] transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Current modules — drag to reorder */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1 mb-2">已有模块</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5">
                {sectionOrder.map((id) => (
                  <SortableRow key={id} id={id} onDelete={() => handleRemove(id)} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {sectionOrder.length === 0 && (
            <p className="text-xs text-gray-600 text-center py-4">暂无模块，从下方添加</p>
          )}
        </div>

        {/* Add modules */}
        {addableModules.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1 mb-2">添加模块</p>
            <div className="space-y-1.5">
              {addableModules.map((id) => (
                <button
                  key={id}
                  onClick={() => handleAdd(id)}
                  className="w-full flex items-center gap-2 bg-[#1c1f26] hover:bg-[#2d3140] rounded-lg px-3 py-2.5 transition-colors group"
                >
                  <Plus size={14} className="text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                  <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors flex-1 text-left">
                    {SECTION_LABELS[id] ?? id}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
