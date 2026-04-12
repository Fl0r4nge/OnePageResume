import { useEffect, useRef } from 'react'
import { useResumeStore } from '@/store/resumeStore'
import { resumesApi } from '@/lib/api'

export function useAutoSave() {
  const { data, resumeId, isDirty, markSaved, setSaving } = useResumeStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isDirty || !resumeId) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      try {
        setSaving(true)
        await resumesApi.update(resumeId, { content: data })
        markSaved()
      } catch (err) {
        setSaving(false)
        console.error('Auto-save failed:', err)
      }
    }, 1500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [data, isDirty, resumeId, markSaved, setSaving])
}
