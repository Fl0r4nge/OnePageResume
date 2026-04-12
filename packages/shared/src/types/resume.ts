// ============================================================
// Core Resume Data Types
// This is the single source of truth for resume data structure.
// Used by both frontend (forms/preview) and backend (API/AI).
// ============================================================

export type FontSize = 'sm' | 'md' | 'lg'

export interface ResumeMeta {
  templateId: string
  colorScheme: string
  fontSize: FontSize
  sectionOrder: string[]
  featuredEducationId?: string
}

export interface PersonalInfo {
  name: string
  title: string
  email: string
  phone: string
  location: string
  linkedin?: string
  github?: string
  website?: string
  avatarUrl?: string
  summary: string

  // 求职意向
  jobStatus?: string
  targetCity?: string
  desiredPosition?: string
  salaryMin?: string
  salaryMax?: string

  // 社交信息
  wechat?: string

  // 其他信息
  gender?: string
  height?: string
  weight?: string
  ethnicity?: string
  nativePlace?: string
  politicalStatus?: string
  maritalStatus?: string
  birthday?: string
  zodiac?: string
  mbti?: string
}

export interface ExperienceEntry {
  id: string
  company: string
  position: string
  location?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  description: string // Rich text HTML
}

export interface EducationEntry {
  id: string
  school: string
  schoolLogoUrl?: string
  degree: string
  major: string
  location?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  gpa?: string
  description?: string
}

export interface SkillGroup {
  id: string
  category: string
  skills: string[]
}

export interface ProjectEntry {
  id: string
  name: string
  role?: string
  url?: string
  startDate?: string
  endDate?: string
  description: string // Rich text HTML
}

export interface CertificationEntry {
  id: string
  name: string
  issuer: string
  date?: string
  url?: string
}

export interface CustomSection {
  id: string
  title: string
  items: CustomSectionItem[]
}

export interface CustomSectionItem {
  id: string
  title: string
  subtitle?: string
  date?: string
  description?: string
}

export interface ResumeData {
  meta: ResumeMeta
  personal: PersonalInfo
  experience: ExperienceEntry[]
  education: EducationEntry[]
  skills: SkillGroup[]
  projects: ProjectEntry[]
  certifications: CertificationEntry[]
  customSections: CustomSection[]
}

export const DEFAULT_RESUME_DATA: ResumeData = {
  meta: {
    templateId: 'classic',
    colorScheme: '#2563eb',
    fontSize: 'md',
    sectionOrder: ['personal', 'experience', 'education', 'skills', 'projects', 'certifications'],
    featuredEducationId: '',
  },
  personal: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    avatarUrl: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  customSections: [],
}
