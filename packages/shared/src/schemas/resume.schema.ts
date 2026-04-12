import { z } from 'zod'

// ============================================================
// Zod Schemas — used for validation on both frontend and backend
// ============================================================

export const ResumMetaSchema = z.object({
  templateId: z.string().min(1),
  colorScheme: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  fontSize: z.enum(['sm', 'md', 'lg']),
  sectionOrder: z.array(z.string()),
  featuredEducationId: z.string().optional(),
})

export const PersonalInfoSchema = z.object({
  name: z.string().max(100),
  title: z.string().max(150),
  email: z.string().max(254),
  phone: z.string().max(30),
  location: z.string().max(100),
  linkedin: z.string().max(500).optional(),
  github: z.string().max(500).optional(),
  website: z.string().max(500).optional(),
  avatarUrl: z.string().optional(), // allows https:// URLs and data: URLs
  summary: z.string().max(2000),

  // 求职意向
  jobStatus: z.string().max(50).optional(),
  targetCity: z.string().max(100).optional(),
  desiredPosition: z.string().max(150).optional(),
  salaryMin: z.string().max(20).optional(),
  salaryMax: z.string().max(20).optional(),

  // 社交信息
  wechat: z.string().max(100).optional(),

  // 其他信息
  gender: z.string().max(20).optional(),
  height: z.string().max(20).optional(),
  weight: z.string().max(20).optional(),
  ethnicity: z.string().max(50).optional(),
  nativePlace: z.string().max(100).optional(),
  politicalStatus: z.string().max(50).optional(),
  maritalStatus: z.string().max(20).optional(),
  birthday: z.string().max(30).optional(),
  zodiac: z.string().max(20).optional(),
  mbti: z.string().max(10).optional(),
})

export const ExperienceEntrySchema = z.object({
  id: z.string(),
  company: z.string().max(150),
  position: z.string().max(150),
  location: z.string().max(100).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
  description: z.string().max(5000),
})

export const EducationEntrySchema = z.object({
  id: z.string(),
  school: z.string().max(200),
  schoolLogoUrl: z.string().optional(),
  degree: z.string().max(100),
  major: z.string().max(150),
  location: z.string().max(100).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
  gpa: z.string().max(10).optional(),
  description: z.string().max(2000).optional(),
})

export const SkillGroupSchema = z.object({
  id: z.string(),
  category: z.string().max(100),
  skills: z.array(z.string().max(100)),
})

export const ProjectEntrySchema = z.object({
  id: z.string(),
  name: z.string().max(200),
  role: z.string().max(100).optional(),
  url: z.string().url().or(z.literal('')).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().max(3000),
})

export const CertificationEntrySchema = z.object({
  id: z.string(),
  name: z.string().max(200),
  issuer: z.string().max(200),
  date: z.string().optional(),
  url: z.string().url().or(z.literal('')).optional(),
})

export const CustomSectionItemSchema = z.object({
  id: z.string(),
  title: z.string().max(200),
  subtitle: z.string().max(200).optional(),
  date: z.string().optional(),
  description: z.string().max(2000).optional(),
})

export const CustomSectionSchema = z.object({
  id: z.string(),
  title: z.string().max(100),
  items: z.array(CustomSectionItemSchema),
})

export const ResumeDataSchema = z.object({
  meta: ResumMetaSchema,
  personal: PersonalInfoSchema,
  experience: z.array(ExperienceEntrySchema),
  education: z.array(EducationEntrySchema),
  skills: z.array(SkillGroupSchema),
  projects: z.array(ProjectEntrySchema),
  certifications: z.array(CertificationEntrySchema),
  customSections: z.array(CustomSectionSchema),
})

export type ResumeDataInput = z.infer<typeof ResumeDataSchema>
