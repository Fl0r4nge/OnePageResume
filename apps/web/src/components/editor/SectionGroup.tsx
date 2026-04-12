import { LucideIcon, Plus } from 'lucide-react'
import ItemCard from './ItemCard'

export interface SectionItem {
  id: string
  primary: string
  secondary?: string
}

interface SectionGroupProps {
  sectionId: string
  label: string
  icon: LucideIcon
  items: SectionItem[]
  expandedItemId: string | null
  onExpandItem: (id: string | null) => void
  onAdd: () => void
  onRemove: (id: string) => void
  renderForm: (itemId: string) => React.ReactNode
  addLabel?: string
}

export default function SectionGroup({
  label,
  icon: Icon,
  items,
  expandedItemId,
  onExpandItem,
  onAdd,
  onRemove,
  renderForm,
  addLabel = '添加一条新记录',
}: SectionGroupProps) {
  return (
    <div className="bg-[#252830] rounded-xl overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Icon size={15} className="text-gray-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-gray-200 flex-1">{label}</span>
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div className="px-2 pb-2 space-y-1.5">
          {items.map((item) => {
            const isExpanded = expandedItemId === item.id
            return (
              <ItemCard
                key={item.id}
                primary={item.primary}
                secondary={item.secondary}
                isExpanded={isExpanded}
                onExpand={() => onExpandItem(isExpanded ? null : item.id)}
                onDelete={() => onRemove(item.id)}
              >
                {renderForm(item.id)}
              </ItemCard>
            )
          })}
        </div>
      )}

      {/* Add button */}
      <div className="px-2 pb-2">
        <button
          onClick={onAdd}
          className="w-full border border-dashed border-[#3a3d4a] text-gray-500 hover:text-gray-300 hover:border-gray-500 rounded-xl py-2 text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={14} />
          {addLabel}
        </button>
      </div>
    </div>
  )
}
