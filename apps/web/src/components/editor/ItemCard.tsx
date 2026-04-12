import { GripVertical, Pencil, Trash2 } from 'lucide-react'

interface ItemCardProps {
  primary: string
  secondary?: string
  isExpanded: boolean
  onExpand: () => void
  onDelete: () => void
  children: React.ReactNode
}

export default function ItemCard({
  primary,
  secondary,
  isExpanded,
  onExpand,
  onDelete,
  children,
}: ItemCardProps) {
  return (
    <div className="bg-[#1c1f26] rounded-lg overflow-hidden">
      {/* Summary row */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-[#2d3140] transition-colors"
        onClick={onExpand}
      >
        <GripVertical size={14} className="text-gray-600 flex-shrink-0 cursor-grab" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-100 truncate font-medium">{primary}</p>
          {secondary && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{secondary}</p>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onExpand() }}
          className="p-1 text-gray-500 hover:text-gray-200 transition-colors flex-shrink-0"
          title="编辑"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="p-1 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
          title="删除"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Inline expanded form */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-2 border-t border-[#2d3140] space-y-2.5">
          {children}
        </div>
      )}
    </div>
  )
}
