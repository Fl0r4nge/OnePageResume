import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, Copy, Trash2, LogOut, Edit3 } from 'lucide-react'
import { resumesApi, authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface ResumeItem {
  id: string
  title: string
  templateId: string
  updatedAt: string
  createdAt: string
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [resumes, setResumes] = useState<ResumeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    resumesApi.list()
      .then((res) => setResumes(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    try {
      const res = await resumesApi.create({ title: '新简历' })
      navigate(`/editor/${res.data.id}`)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const res = await resumesApi.duplicate(id)
      setResumes((prev) => [res.data, ...prev])
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这份简历吗？')) return
    try {
      await resumesApi.delete(id)
      setResumes((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {}
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-blue-700">
            <FileText size={20} />
            <span>一页简历</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name || user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <LogOut size={16} />
              退出
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">我的简历</h1>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            新建简历
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 mb-4">还没有简历，立即创建第一份</p>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              新建简历
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate max-w-[180px]">{resume.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      更新于 {new Date(resume.updatedAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/editor/${resume.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors font-medium"
                  >
                    <Edit3 size={14} />
                    编辑
                  </button>
                  <button
                    onClick={() => handleDuplicate(resume.id)}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="复制"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
