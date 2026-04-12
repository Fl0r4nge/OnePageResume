import { useResumeStore } from '@/store/resumeStore'
import { Plus, Trash2 } from 'lucide-react'

export default function CertificationsForm() {
  const { data, addCertification, updateCertification, removeCertification } = useResumeStore()

  return (
    <div className="space-y-2">
      {data.certifications.map((cert, index) => (
        <div key={cert.id} className="border border-gray-200 rounded-lg p-3 bg-white space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">证书名称</label>
                  <input value={cert.name} onChange={(e) => updateCertification(index, { name: e.target.value })} placeholder="AWS 解决方案架构师"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">颁发机构</label>
                  <input value={cert.issuer} onChange={(e) => updateCertification(index, { issuer: e.target.value })} placeholder="Amazon Web Services"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">获得时间</label>
                <input type="month" value={cert.date || ''} onChange={(e) => updateCertification(index, { date: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
            <button onClick={() => removeCertification(index)} className="p-1.5 text-gray-400 hover:text-red-500 rounded mt-5">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}

      <button onClick={addCertification} className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 text-sm transition-colors">
        <Plus size={16} />
        添加证书/奖项
      </button>
    </div>
  )
}
