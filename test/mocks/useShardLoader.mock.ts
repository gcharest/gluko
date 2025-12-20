// Mock for useShardLoader used by tests
import { vi } from 'vitest'
import { ref, computed } from 'vue'
import type { NutrientFile } from '@/stores/nutrientsFile'

// Sample nutrient data for tests
export const mockNutrientData: NutrientFile[] = [
  {
    FoodID: 1,
    FoodCode: 100,
    FoodGroupID: 1,
    FoodSourceID: 1,
    FoodDescription: 'Milk, whole, 3.25% M.F.',
    FoodDescriptionF: 'Lait entier, 3,25 % M.G.',
    '203': 3.2, // Protein
    '204': 3.25, // Fat
    '205': 4.8, // Carbs
    '291': 4.8, // Fiber
    FoodGroupName: 'Dairy and Egg Products',
    FoodGroupNameF: 'Produits laitiers et oeufs',
    FctGluc: 4.8,
  },
  {
    FoodID: 2,
    FoodCode: 200,
    FoodGroupID: 2,
    FoodSourceID: 1,
    FoodDescription: 'Chicken breast, skinless, raw',
    FoodDescriptionF: 'Poitrine de poulet, sans peau, crue',
    '203': 23.1, // Protein
    '204': 1.2, // Fat
    '205': 0, // Carbs
    '291': null, // Fiber
    FoodGroupName: 'Poultry Products',
    FoodGroupNameF: 'Produits de volaille',
    FctGluc: null,
  },
  {
    FoodID: 3,
    FoodCode: 300,
    FoodGroupID: 3,
    FoodSourceID: 1,
    FoodDescription: 'Broccoli, raw',
    FoodDescriptionF: 'Brocoli, cru',
    '203': 2.8, // Protein
    '204': 0.4, // Fat
    '205': 6.6, // Carbs
    '291': 2.6, // Fiber
    FoodGroupName: 'Vegetables and Vegetable Products',
    FoodGroupNameF: 'Légumes et produits végétaux',
    FctGluc: 1.7,
  },
]

const createMockProgress = () => ({
  currentShard: 0,
  totalShards: 0,
  currentShardName: '',
  bytesDownloaded: 0,
  totalBytes: 0,
  recordsLoaded: 0,
  totalRecords: 0,
  status: 'idle' as const,
})

// Singleton instance to ensure all calls use the same mock
let mockInstance: ReturnType<typeof createMockShardLoaderImpl> | null = null

const createMockShardLoaderImpl = () => {
  const progress = ref(createMockProgress())
  const error = ref<Error | null>(null)
  const isLoading = computed(() =>
    progress.value.status === 'checking' ||
    progress.value.status === 'downloading' ||
    progress.value.status === 'validating'
  )

  return {
    progress,
    error,
    isLoading,
    loadDataset: vi.fn().mockResolvedValue(undefined),
    getAllNutrients: vi.fn().mockResolvedValue(mockNutrientData),
    checkForUpdates: vi.fn().mockResolvedValue(false),
    updateDataset: vi.fn().mockResolvedValue(undefined),
  }
}

export const createMockShardLoader = () => {
  if (!mockInstance) {
    mockInstance = createMockShardLoaderImpl()
  }
  return mockInstance
}

// Reset function for beforeEach in tests
export const resetMockShardLoader = () => {
  mockInstance = null
}

// Provide a global mock for the composable
vi.mock('@/composables/useShardLoader', () => ({
  useShardLoader: () => createMockShardLoader()
}))

export default null
