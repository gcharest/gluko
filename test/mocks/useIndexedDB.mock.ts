// Shared mock for useIndexedDB used by tests
import { vi } from 'vitest'

export const mockSessions = new Map()
export const mockMealHistory = new Map()

export const createMockIndexedDB = () => ({
  getAllByIndex: vi.fn().mockResolvedValue([]),
  getAllSubjects: vi.fn().mockResolvedValue([]),
  saveSubject: vi.fn().mockResolvedValue(undefined),
  removeSubject: vi.fn((id: string) => {
    // remove from any subject store maps if present (no-op in this mock)
    return Promise.resolve()
  }),
  getUserAccount: vi.fn().mockResolvedValue(undefined),
  saveUserAccount: vi.fn().mockResolvedValue(undefined),
  get: vi.fn().mockResolvedValue(null),
  put: vi.fn().mockResolvedValue(undefined),
  remove: vi.fn().mockResolvedValue(undefined),
  clear: vi.fn().mockResolvedValue(undefined),
  saveSession: vi.fn((session: { id: string }) => {
    mockSessions.set(session.id, session)
    return Promise.resolve()
  }),
  getSessionsBySubject: vi.fn((subjectId: string) => {
    const sessions = Array.from(mockSessions.values()).filter(
      (s: { subjectId: string }) => s.subjectId === subjectId
    )
    return Promise.resolve(sessions)
  }),
  deleteSession: vi.fn((id: string) => {
    mockSessions.delete(id)
    return Promise.resolve()
  }),
  // Meal history mock
  saveMealHistory: vi.fn((entry: { id: string }) => {
    mockMealHistory.set(entry.id, entry)
    return Promise.resolve()
  }),
  getMealHistoryBySubject: vi.fn((subjectId: string) => {
    const entries = Array.from(mockMealHistory.values()).filter(
      (e: { subjectId: string }) => e.subjectId === subjectId
    )
    return Promise.resolve(entries)
  }),
  removeMealHistory: vi.fn((id: string) => {
    mockMealHistory.delete(id)
    return Promise.resolve()
  }),
})

// Provide a global mock for the composable
vi.mock('@/composables/useIndexedDB', () => ({
  useIndexedDB: () => createMockIndexedDB()
}))

export default null
