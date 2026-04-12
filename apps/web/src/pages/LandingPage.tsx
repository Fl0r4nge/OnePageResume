import { Link } from 'react-router-dom'
import { FileText, Zap, Layout, Download } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-700">
          <FileText size={24} />
          <span>一页简历</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-gray-600 hover:text-blue-700 px-4 py-2 rounded-lg transition-colors">
            登录
          </Link>
          <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            免费注册
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          智能简历制作，<br />
          <span className="text-blue-600">一页搞定</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          在线编辑、多套精美模板、AI 自动压缩至一页、一键导出 PDF。
          用更少的时间，制作更专业的简历。
        </p>
        <Link
          to="/register"
          className="inline-block bg-blue-600 text-white text-lg px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
        >
          免费开始制作
        </Link>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24">
          {[
            { icon: Layout, title: '多套模板', desc: '经典、现代、极简风格自由切换' },
            { icon: Zap, title: 'AI 自动压缩', desc: '超出一页时 AI 智能缩短内容' },
            { icon: FileText, title: '实时预览', desc: '所见即所得，左编辑右预览' },
            { icon: Download, title: '导出 PDF', desc: '高保真 PDF，直接投递' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm text-left">
              <f.icon className="text-blue-600 mb-3" size={28} />
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
