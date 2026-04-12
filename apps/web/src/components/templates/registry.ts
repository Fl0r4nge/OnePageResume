import { lazy } from 'react'

export interface TemplateDefinition {
  id: string
  name: string
  description: string
  component: React.LazyExoticComponent<React.ComponentType<{ data: any }>>
  defaultColor: string
  supportedColors: string[]
}

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  classic: {
    id: 'classic',
    name: '经典',
    description: '传统专业风格，适合大多数行业',
    component: lazy(() => import('./classic/ClassicTemplate')),
    defaultColor: '#2563eb',
    supportedColors: ['#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#0f172a'],
  },
  modern: {
    id: 'modern',
    name: '现代',
    description: '双栏布局，简洁现代',
    component: lazy(() => import('./modern/ModernTemplate')),
    defaultColor: '#7c3aed',
    supportedColors: ['#7c3aed', '#0891b2', '#dc2626', '#16a34a'],
  },
}

export const TEMPLATE_LIST = Object.values(TEMPLATE_REGISTRY)
