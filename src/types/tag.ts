export interface Tag {
  id: string
  name: string
  color?: string // Optional hex color for visual distinction (e.g., "#3b82f6")
  created: Date
  lastModified: Date
}

export interface TagUsageStats {
  tagId: string
  usageCount: number
  lastUsed?: Date
}
