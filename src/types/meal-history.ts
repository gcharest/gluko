export interface Subject {
  id: string
  name: string
  dateOfBirth?: Date
  notes?: string
  active: boolean
  created: Date
  lastModified: Date
  settings?: {
    defaultMealTags?: string[]
    carbRatios?: {
      [timeSlot: string]: number
    }
  }
}

export interface CalculationSession {
  id: string
  subjectId: string
  nutrients: Nutrient[]
  created: Date
  lastModified: Date
  status: 'draft' | 'completed'
}

export interface MealHistoryEntry {
  id: string
  subjectId: string
  date: Date
  name?: string
  notes?: string
  tags: string[]
  nutrients: Nutrient[]
  totalCarbs: number
  metadata: {
    lastModified: Date
    created: Date
    version: number
    createdFrom?: string
    calculatedBy: string
  }
  calculationDetails?: {
    methodUsed: string
    roundingApplied: boolean
    carbRatio?: number
    originalValues?: {
      totalCarbs: number
    }
  }
}

export interface UserAccount {
  id: string
  name: string
  email: string
  preferences: {
    defaultSubjectId?: string
    activeSubjects: string[]
    displayOrder: string[]
  }
}

export interface Nutrient {
  id: string
  name: string
  quantity: number
  factor: number
}
