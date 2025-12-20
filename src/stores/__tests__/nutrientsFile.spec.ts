import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ref, computed } from 'vue'
import { useNutrientFileStore } from '../nutrientsFile'

// Mock data
const mockNutrients = [
  {
    FoodID: 1,
    FoodCode: 101,
    FoodGroupID: 1,
    FoodSourceID: 1,
    FoodDescription: 'Cheddar cheese',
    FoodDescriptionF: 'Fromage cheddar',
    '203': 24.9,
    '204': 33.1,
    '205': 1.3,
    '291': null,
    FoodGroupName: 'Dairy',
    FoodGroupNameF: 'Produits laitiers',
    FctGluc: 0.013
  },
  {
    FoodID: 2,
    FoodCode: 102,
    FoodGroupID: 2,
    FoodSourceID: 1,
    FoodDescription: 'Whole wheat bread',
    FoodDescriptionF: 'Pain de blé entier',
    '203': 10.7,
    '204': 3.4,
    '205': 41.3,
    '291': null,
    FoodGroupName: 'Grains',
    FoodGroupNameF: 'Céréales',
    FctGluc: 0.413
  },
  {
    FoodID: 3,
    FoodCode: 103,
    FoodGroupID: 3,
    FoodSourceID: 1,
    FoodDescription: 'Banana, raw',
    FoodDescriptionF: 'Banane, crue',
    '203': 1.1,
    '204': 0.3,
    '205': 22.8,
    '291': null,
    FoodGroupName: 'Fruits',
    FoodGroupNameF: 'Fruits',
    FctGluc: 0.228
  }
]

// Create default mock functions
const mockCheckForUpdates = vi.fn().mockResolvedValue({ needsUpdate: false })
const mockLoadDataset = vi.fn().mockResolvedValue(undefined)
const mockGetAllNutrients = vi.fn().mockResolvedValue(mockNutrients)

// Mock IndexedDB
vi.mock('@/composables/useIndexedDB', () => ({
  useIndexedDB: () => ({
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
    getCurrentManifestVersion: vi.fn().mockResolvedValue(null)
  })
}))

// Mock useShardLoader
vi.mock('@/composables/useShardLoader', () => ({
  useShardLoader: () => ({
    progress: ref({
      status: 'idle' as const,
      currentShard: 0,
      totalShards: 0,
      recordsLoaded: 0,
      totalRecords: 0,
      bytesDownloaded: 0,
      totalBytes: 0,
      currentShardName: ''
    }),
    error: ref(null),
    isLoading: computed(() => false),
    checkForUpdates: mockCheckForUpdates,
    loadDataset: mockLoadDataset,
    resetProgress: vi.fn(),
    getAllNutrients: mockGetAllNutrients
  })
}))

describe('nutrientsFile Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  beforeEach(async () => {
    const store = useNutrientFileStore()
    await store.initializeData()
  })

  describe('State Initialization', () => {
    it('initializes with default data from dataset', () => {
      const store = useNutrientFileStore()
      expect(store.nutrientsFile).toHaveLength(3)
      expect(store.favoriteNutrients).toHaveLength(0)
    })

    it('computes total nutrients correctly', () => {
      const store = useNutrientFileStore()
      expect(store.totalNutrients).toBe(3)
    })

    it('computes favorite count correctly', () => {
      const store = useNutrientFileStore()
      expect(store.favoriteCount).toBe(0)
    })

    it('indicates data is loaded', () => {
      const store = useNutrientFileStore()
      expect(store.isDataLoaded).toBe(true)
    })
  })

  describe('Search Functionality', () => {
    it('searches nutrients by English description', () => {
      const store = useNutrientFileStore()
      const results = store.searchNutrients('cheese')

      expect(results.length).toBeGreaterThan(0)
      expect(results[0].item.FoodDescription).toContain('Cheddar')
    })

    it('searches nutrients by French description', () => {
      const store = useNutrientFileStore()
      const results = store.searchNutrients('fromage')

      expect(results.length).toBeGreaterThan(0)
      expect(results[0].item.FoodDescriptionF).toContain('Fromage')
    })

    it('returns empty array for search terms less than 2 characters', () => {
      const store = useNutrientFileStore()
      const results = store.searchNutrients('a')

      expect(results).toHaveLength(0)
    })

    it('returns empty array for empty search string', () => {
      const store = useNutrientFileStore()
      const results = store.searchNutrients('')

      expect(results).toHaveLength(0)
    })

    it('caches search results for performance', () => {
      const store = useNutrientFileStore()

      // First search
      const results1 = store.searchNutrients('bread')
      // Second search (should use cache)
      const results2 = store.searchNutrients('bread')

      expect(results1).toEqual(results2)
    })

    it('clears search cache', () => {
      const store = useNutrientFileStore()

      store.searchNutrients('cheese')
      store.clearSearchCache()

      // Cache should be cleared (can't directly verify, but ensure it doesn't error)
      const results = store.searchNutrients('cheese')
      expect(results.length).toBeGreaterThan(0)
    })

    it('handles search with trimmed whitespace', () => {
      const store = useNutrientFileStore()
      const results = store.searchNutrients('  banana  ')

      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('Get Nutrient by ID', () => {
    it('retrieves nutrient by FoodID', () => {
      const store = useNutrientFileStore()
      const nutrient = store.getNutrientById(2)

      expect(nutrient).toBeDefined()
      expect(nutrient?.FoodDescription).toBe('Whole wheat bread')
    })

    it('returns undefined for non-existent ID', () => {
      const store = useNutrientFileStore()
      const nutrient = store.getNutrientById(999)

      expect(nutrient).toBeUndefined()
    })
  })

  describe('Favorites Management', () => {
    it('adds nutrient to favorites', () => {
      const store = useNutrientFileStore()
      const result = store.addToFavorites(1)

      expect(result).toBe(true)
      expect(store.favoriteNutrients).toContain(1)
      expect(store.favoriteCount).toBe(1)
    })

    it('does not add duplicate favorites', () => {
      const store = useNutrientFileStore()

      store.addToFavorites(1)
      const result = store.addToFavorites(1)

      expect(result).toBe(false)
      expect(store.favoriteNutrients).toHaveLength(1)
    })

    it('removes nutrient from favorites', () => {
      const store = useNutrientFileStore()

      store.addToFavorites(1)
      const result = store.removeFromFavorites(1)

      expect(result).toBe(true)
      expect(store.favoriteNutrients).not.toContain(1)
    })

    it('returns false when removing non-existent favorite', () => {
      const store = useNutrientFileStore()
      const result = store.removeFromFavorites(999)

      expect(result).toBe(false)
    })

    it('toggles favorite status', () => {
      const store = useNutrientFileStore()

      // Toggle on
      const result1 = store.toggleFavorite(1)
      expect(result1).toBe(true)
      expect(store.favoriteNutrients).toContain(1)

      // Toggle off
      const result2 = store.toggleFavorite(1)
      expect(result2).toBe(true)
      expect(store.favoriteNutrients).not.toContain(1)
    })

    it('checks if nutrient is favorite', () => {
      const store = useNutrientFileStore()

      expect(store.isFavorite(1)).toBe(false)

      store.addToFavorites(1)
      expect(store.isFavorite(1)).toBe(true)
    })

    it('retrieves all favorite nutrients', () => {
      const store = useNutrientFileStore()

      store.addToFavorites(1)
      store.addToFavorites(3)

      const favorites = store.getFavoriteNutrients()
      expect(favorites).toHaveLength(2)
      expect(favorites[0].FoodID).toBe(1)
      expect(favorites[1].FoodID).toBe(3)
    })

    it('filters out invalid favorite IDs', () => {
      const store = useNutrientFileStore()

      store.addToFavorites(1)
      store.favoriteNutrients.push(999) // Add invalid ID directly

      const favorites = store.getFavoriteNutrients()
      expect(favorites).toHaveLength(1)
      expect(favorites[0].FoodID).toBe(1)
    })
  })

  describe('Data Management', () => {
    it('initializes data when empty', async () => {
      const store = useNutrientFileStore()
      store.nutrientsFile = []

      const result = await store.initializeData()

      expect(result).toBe(true)
      expect(store.nutrientsFile.length).toBeGreaterThan(0)
    })

    it('does not reinitialize when data exists', async () => {
      const store = useNutrientFileStore()
      const initialLength = store.nutrientsFile.length

      const result = await store.initializeData()

      expect(result).toBe(true)
      expect(store.nutrientsFile.length).toBe(initialLength)
    })

    it('reloads data from dataset', async () => {
      const store = useNutrientFileStore()

      const result = await store.reloadData()

      expect(result).toBe(true)
      expect(store.nutrientsFile.length).toBe(3)
    })

    it('clears cache when reloading data', async () => {
      const store = useNutrientFileStore()

      store.searchNutrients('cheese') // Populate cache
      await store.reloadData()

      // Cache should be cleared
      const results = store.searchNutrients('cheese')
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('Store Reset', () => {
    it('resets store to initial state', async () => {
      const store = useNutrientFileStore()

      store.addToFavorites(1)
      store.addToFavorites(2)
      store.searchNutrients('cheese')

      const result = await store.$reset()

      expect(result).toBe(true)
      expect(store.favoriteNutrients).toHaveLength(0)
      expect(store.nutrientsFile.length).toBe(3)
    })
  })

  describe('Error Handling', () => {
    it('handles search errors gracefully', () => {
      const store = useNutrientFileStore()
      store.nutrientsFile = [] // Empty data

      const results = store.searchNutrients('test')
      expect(results).toHaveLength(0)
    })

    it('handles getNutrientById errors gracefully', () => {
      const store = useNutrientFileStore()

      const nutrient = store.getNutrientById(999)
      expect(nutrient).toBeUndefined()
    })

    it('handles favorite operations errors gracefully', () => {
      const store = useNutrientFileStore()

      // Should not throw even with invalid operations
      expect(() => store.addToFavorites(999)).not.toThrow()
      expect(() => store.removeFromFavorites(999)).not.toThrow()
      expect(() => store.isFavorite(999)).not.toThrow()
    })
  })

  describe('Dataset Updates', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('checks for dataset updates when no update available', async () => {
      mockCheckForUpdates.mockResolvedValueOnce({ needsUpdate: false })

      const store = useNutrientFileStore()
      const result = await store.checkForDatasetUpdates()

      expect(result.needsUpdate).toBe(false)
      expect(mockCheckForUpdates).toHaveBeenCalled()
    })

    it('checks for dataset updates when update is available', async () => {
      mockCheckForUpdates.mockResolvedValueOnce({
        needsUpdate: true,
        currentVersion: '0.2.0',
        manifest: { version: '0.3.0' }
      })

      const store = useNutrientFileStore()
      const result = await store.checkForDatasetUpdates()

      expect(result.needsUpdate).toBe(true)
      expect(result.currentVersion).toBe('0.2.0')
      expect(result.latestVersion).toBe('0.3.0')
      expect(mockCheckForUpdates).toHaveBeenCalled()
    })

    it('handles dataset update check errors gracefully', async () => {
      mockCheckForUpdates.mockRejectedValueOnce(new Error('Network error'))

      const store = useNutrientFileStore()
      const result = await store.checkForDatasetUpdates()

      expect(result.needsUpdate).toBe(false)
    })

    it('updates dataset successfully', async () => {
      mockLoadDataset.mockResolvedValueOnce(undefined)
      mockGetAllNutrients.mockResolvedValueOnce([
        { FoodID: 10, FoodDescription: 'New food item', FctGluc: 0.5 }
      ])

      const store = useNutrientFileStore()
      const result = await store.updateDataset()

      expect(result).toBe(true)
      expect(mockLoadDataset).toHaveBeenCalled()
      expect(mockGetAllNutrients).toHaveBeenCalled()
      expect(store.nutrientsFile).toHaveLength(1)
      expect(store.nutrientsFile[0].FoodID).toBe(10)
    })

    it('handles dataset update errors gracefully', async () => {
      mockLoadDataset.mockRejectedValueOnce(new Error('Download failed'))

      const store = useNutrientFileStore()
      const result = await store.updateDataset()

      expect(result).toBe(false)
      expect(mockLoadDataset).toHaveBeenCalled()
    })
  })
})
