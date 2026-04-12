import { useEffect, useState, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FileText, ArrowLeft, Download, Zap, Layout, Check, Loader2, AlertTriangle, Pencil } from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import { resumesApi, aiApi } from '@/lib/api'
import { useAutoSave } from '@/hooks/useAutoSave'
import { usePageOverflow } from '@/hooks/usePageOverflow'
import SidebarPanel from '@/components/editor/SidebarPanel'
import TemplatePicker from '@/components/toolbar/TemplatePicker'
import { TEMPLATE_REGISTRY } from '@/components/templates/registry'

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, setResumeData, setResumeId, isSaving, isDirty, lastSavedAt, applyAICompression } = useResumeStore()
  const [loading, setLoading] = useState(true)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [resumeTitle, setResumeTitle] = useState('我的简历')
  const [titleDraft, setTitleDraft] = useState('我的简历')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isRenamingTitle, setIsRenamingTitle] = useState(false)

  const { ref: previewRef, isOverflowing, overflowAmount } = usePageOverflow()

  useAutoSave()

  // Load resume data
  useEffect(() => {
    if (!id) return
    setResumeId(id)
    resumesApi.get(id)
      .then((res) => {
        setResumeData(res.data.content)
        setResumeTitle(res.data.title)
        setTitleDraft(res.data.title)
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
  }, [id, setResumeId, setResumeData, navigate])

  const startRename = () => {
    setTitleDraft(resumeTitle)
    setIsEditingTitle(true)
  }

  const cancelRename = () => {
    setTitleDraft(resumeTitle)
    setIsEditingTitle(false)
  }

  const commitRename = async () => {
    if (!id || isRenamingTitle) return

    const nextTitle = titleDraft.trim()
    if (!nextTitle || nextTitle === resumeTitle) {
      cancelRename()
      return
    }

    setIsRenamingTitle(true)
    try {
      await resumesApi.update(id, { title: nextTitle })
      setResumeTitle(nextTitle)
      setIsEditingTitle(false)
    } catch (err: any) {
      alert(err?.response?.data?.error || '重命名失败，请稍后重试')
      setTitleDraft(resumeTitle)
    } finally {
      setIsRenamingTitle(false)
    }
  }

  // PDF export via browser print
  const handleExport = () => {
    const printArea = document.getElementById('resume-print-area')
    if (!printArea) return
    const original = document.title
    document.title = resumeTitle
    window.print()
    document.title = original
  }

  // AI compression
  const handleAICompress = async () => {
    if (!id || isCompressing) return
    setIsCompressing(true)
    try {
      const res = await aiApi.compress(id, {
        overflowingSections: ['experience', 'projects', 'personal'],
        level: 'light',
      })
      applyAICompression(res.data.compressed)
    } catch (err: any) {
      alert(err.response?.data?.error || 'AI 压缩失败，请重试')
    } finally {
      setIsCompressing(false)
    }
  }

  const templateDef = TEMPLATE_REGISTRY[data.meta.templateId] || TEMPLATE_REGISTRY.classic
  const TemplateComponent = templateDef.component

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 flex-shrink-0 z-10">
        <button onClick={() => navigate('/dashboard')} className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-2 text-blue-700 font-bold">
          <FileText size={18} />
          <span className="text-sm">一页简历</span>
        </div>

        <div className="h-4 w-px bg-gray-300" />
        {isEditingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => { void commitRename() }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void commitRename()
              }
              if (e.key === 'Escape') {
                e.preventDefault()
                cancelRename()
              }
            }}
            disabled={isRenamingTitle}
            className="text-sm font-medium text-gray-700 w-[220px] border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <button
            type="button"
            onClick={startRename}
            className="flex items-center gap-1 text-sm font-medium text-gray-700 truncate max-w-[220px] hover:text-gray-900 cursor-text group"
            title="点击重命名"
          >
            <span className="truncate">{resumeTitle}</span>
            <Pencil size={12} className="text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
          </button>
        )}

        {/* Save status */}
        <div className="text-xs text-gray-400 ml-1">
          {isSaving ? (
            <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> 保存中...</span>
          ) : isRenamingTitle ? (
            <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> 重命名中...</span>
          ) : isDirty ? (
            <span>未保存</span>
          ) : lastSavedAt ? (
            <span className="flex items-center gap-1"><Check size={12} className="text-green-500" /> 已保存</span>
          ) : null}
        </div>

        {/* Overflow warning */}
        {isOverflowing && (
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full ml-2">
            <AlertTriangle size={13} />
            超出 {Math.round(overflowAmount)}px
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Template picker */}
          <button
            onClick={() => setShowTemplatePicker(true)}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Layout size={16} />
            模板
          </button>

          {/* Color scheme */}
          <div className="flex items-center gap-1">
            {templateDef.supportedColors.map((c) => (
              <button
                key={c}
                onClick={() => useResumeStore.getState().updateMeta({ colorScheme: c })}
                className="w-5 h-5 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: c,
                  borderColor: data.meta.colorScheme === c ? 'white' : 'transparent',
                  boxShadow: data.meta.colorScheme === c ? `0 0 0 2px ${c}` : 'none',
                }}
              />
            ))}
          </div>

          {/* AI Compress */}
          <button
            onClick={handleAICompress}
            disabled={isCompressing}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
              isOverflowing
                ? 'bg-amber-500 text-white hover:bg-amber-600 animate-pulse'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            {isCompressing ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
            AI 压缩
          </button>

          {/* Export PDF */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={15} />
            导出 PDF
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Dark sidebar panel */}
        <div className="w-[380px] flex-shrink-0 flex flex-col">
          <SidebarPanel />
        </div>

        {/* Right: Preview */}
        <div className="flex-1 overflow-auto bg-gray-200 flex items-start justify-center p-8">
          <div id="resume-print-area">
            <div
              ref={previewRef}
              className={`shadow-2xl transition-all ${isOverflowing ? 'ring-2 ring-amber-400' : ''}`}
            >
              <Suspense fallback={<div className="resume-page flex items-center justify-center text-gray-400">模板加载中...</div>}>
                <TemplateComponent data={data} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Template picker modal */}
      {showTemplatePicker && (
        <TemplatePicker onClose={() => setShowTemplatePicker(false)} />
      )}
    </div>
  )
}
