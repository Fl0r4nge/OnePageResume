import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, List } from 'lucide-react'
import { useEffect } from 'react'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  dark?: boolean
}

export default function RichTextEditor({ value, onChange, placeholder, dark }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML() === '<p></p>' ? '' : editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: dark
          ? 'min-h-[80px] outline-none text-sm text-gray-200 prose prose-sm max-w-none prose-invert'
          : 'min-h-[80px] outline-none text-sm text-gray-700 prose prose-sm max-w-none',
      },
    },
  })

  // Sync external value changes (e.g. AI compression)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  if (!editor) return null

  const toolbarCls = dark
    ? 'flex items-center gap-1 px-2 py-1 border-b border-[#3a3d4a] bg-[#1a1d24]'
    : 'flex items-center gap-1 px-2 py-1 border-b border-gray-100 bg-gray-50'
  const wrapperCls = dark
    ? 'border border-[#3a3d4a] rounded-lg overflow-hidden bg-[#1a1d24]'
    : 'border border-gray-200 rounded-lg overflow-hidden'

  return (
    <div className={wrapperCls}>
      {/* Toolbar */}
      <div className={toolbarCls}>
        <ToolbarBtn
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="加粗"
          dark={dark}
        >
          <Bold size={13} />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="列表"
          dark={dark}
        >
          <List size={13} />
        </ToolbarBtn>
      </div>

      {/* Content area */}
      <div className="px-3 py-2">
        {!editor.getText() && !editor.isFocused && placeholder && (
          <p className={`text-sm absolute pointer-events-none ${dark ? 'text-gray-600' : 'text-gray-400'}`}>{placeholder}</p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function ToolbarBtn({ children, active, onClick, title, dark }: {
  children: React.ReactNode; active: boolean; onClick: () => void; title: string; dark?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1 rounded transition-colors ${
        active
          ? dark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
          : dark ? 'text-gray-400 hover:bg-[#2d3140]' : 'text-gray-500 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  )
}
