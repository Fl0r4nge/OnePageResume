import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  ResumeData,
  DEFAULT_RESUME_DATA,
  ExperienceEntry,
  EducationEntry,
  SkillGroup,
  ProjectEntry,
  CertificationEntry,
} from '@one-page-resume/shared'

interface ResumeStore {
  data: ResumeData
  resumeId: string | null
  isDirty: boolean
  lastSavedAt: Date | null
  isSaving: boolean

  // Actions
  setResumeId: (id: string) => void
  setResumeData: (data: ResumeData) => void
  updatePersonal: (updates: Partial<ResumeData['personal']>) => void
  updateMeta: (updates: Partial<ResumeData['meta']>) => void

  // Experience
  addExperience: () => void
  updateExperience: (index: number, updates: Partial<ExperienceEntry>) => void
  removeExperience: (index: number) => void
  reorderExperience: (from: number, to: number) => void

  // Education
  addEducation: () => void
  updateEducation: (index: number, updates: Partial<EducationEntry>) => void
  removeEducation: (index: number) => void

  // Skills
  addSkillGroup: () => void
  updateSkillGroup: (index: number, updates: Partial<SkillGroup>) => void
  removeSkillGroup: (index: number) => void

  // Projects
  addProject: () => void
  updateProject: (index: number, updates: Partial<ProjectEntry>) => void
  removeProject: (index: number) => void

  // Certifications
  addCertification: () => void
  updateCertification: (index: number, updates: Partial<CertificationEntry>) => void
  removeCertification: (index: number) => void

  // Section order
  reorderSections: (newOrder: string[]) => void

  // Save state
  markDirty: () => void
  markSaved: () => void
  setSaving: (saving: boolean) => void

  // AI
  applyAICompression: (compressed: ResumeData) => void
}

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

export const useResumeStore = create<ResumeStore>()(
  immer((set) => ({
    data: DEFAULT_RESUME_DATA,
    resumeId: null,
    isDirty: false,
    lastSavedAt: null,
    isSaving: false,

    setResumeId: (id) => set((s) => { s.resumeId = id }),

    setResumeData: (data) =>
      set((s) => {
        s.data = data
        s.isDirty = false
        s.lastSavedAt = new Date()
      }),

    updatePersonal: (updates) =>
      set((s) => {
        Object.assign(s.data.personal, updates)
        s.isDirty = true
      }),

    updateMeta: (updates) =>
      set((s) => {
        Object.assign(s.data.meta, updates)
        s.isDirty = true
      }),

    // Experience
    addExperience: () =>
      set((s) => {
        s.data.experience.push({
          id: genId(),
          company: '',
          position: '',
          startDate: '',
          isCurrent: false,
          description: '',
        })
        s.isDirty = true
      }),

    updateExperience: (index, updates) =>
      set((s) => {
        Object.assign(s.data.experience[index], updates)
        s.isDirty = true
      }),

    removeExperience: (index) =>
      set((s) => {
        s.data.experience.splice(index, 1)
        s.isDirty = true
      }),

    reorderExperience: (from, to) =>
      set((s) => {
        const [item] = s.data.experience.splice(from, 1)
        s.data.experience.splice(to, 0, item)
        s.isDirty = true
      }),

    // Education
    addEducation: () =>
      set((s) => {
        s.data.education.push({
          id: genId(),
          school: '',
          degree: '',
          major: '',
          startDate: '',
          isCurrent: false,
        })
        s.isDirty = true
      }),

    updateEducation: (index, updates) =>
      set((s) => {
        Object.assign(s.data.education[index], updates)
        s.isDirty = true
      }),

    removeEducation: (index) =>
      set((s) => {
        s.data.education.splice(index, 1)
        s.isDirty = true
      }),

    // Skills
    addSkillGroup: () =>
      set((s) => {
        s.data.skills.push({ id: genId(), category: '', skills: [] })
        s.isDirty = true
      }),

    updateSkillGroup: (index, updates) =>
      set((s) => {
        Object.assign(s.data.skills[index], updates)
        s.isDirty = true
      }),

    removeSkillGroup: (index) =>
      set((s) => {
        s.data.skills.splice(index, 1)
        s.isDirty = true
      }),

    // Projects
    addProject: () =>
      set((s) => {
        s.data.projects.push({ id: genId(), name: '', description: '' })
        s.isDirty = true
      }),

    updateProject: (index, updates) =>
      set((s) => {
        Object.assign(s.data.projects[index], updates)
        s.isDirty = true
      }),

    removeProject: (index) =>
      set((s) => {
        s.data.projects.splice(index, 1)
        s.isDirty = true
      }),

    // Certifications
    addCertification: () =>
      set((s) => {
        s.data.certifications.push({ id: genId(), name: '', issuer: '' })
        s.isDirty = true
      }),

    updateCertification: (index, updates) =>
      set((s) => {
        Object.assign(s.data.certifications[index], updates)
        s.isDirty = true
      }),

    removeCertification: (index) =>
      set((s) => {
        s.data.certifications.splice(index, 1)
        s.isDirty = true
      }),

    reorderSections: (newOrder) =>
      set((s) => {
        s.data.meta.sectionOrder = newOrder
        s.isDirty = true
      }),

    markDirty: () => set((s) => { s.isDirty = true }),
    markSaved: () => set((s) => { s.isDirty = false; s.lastSavedAt = new Date(); s.isSaving = false }),
    setSaving: (saving) => set((s) => { s.isSaving = saving }),

    applyAICompression: (compressed) =>
      set((s) => {
        s.data = compressed
        s.isDirty = true
      }),
  }))
)
