import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useIndexedDB } from '@/composables/useIndexedDB'
import dataset from '@/assets/canadian_nutrient_file.json'
import Fuse from 'fuse.js'

export interface NutrientFile {
  FoodID: number
  FoodCode: number
  FoodGroupID: number
  FoodSourceID: number
  FoodDescription: string
  FoodDescriptionF: string
  '203': number
  '204': number
  '205': number
  '291': number | null
  FoodGroupName: string
  FoodGroupNameF: string
  FctGluc: number | null
}

export interface SearchResult {
  item: NutrientFile
  refIndex: number
  score?: number
  matches?: Array<{
    indices: Array<[number, number]>
    value: string
    key: string
  }>
}

export const useNutrientFileStore = defineStore('nutrientsFile', () => {
  const db = useIndexedDB()
  const nutrientsFile = ref<NutrientFile[]>([])
  const favoriteNutrients = ref<number[]>([])
  const searchCache = new Map<string, SearchResult[]>()

  const loadInitialData = async () => {
    try {
      const storedNutrientsFile = await db.get('nutrientsFile', 0)
      if (storedNutrientsFile) {
        nutrientsFile.value = storedNutrientsFile
      } else {
        nutrientsFile.value = dataset as NutrientFile[]
        await db.put('nutrientsFile', nutrientsFile.value, 0)
      }

      const storedFavorites = await db.get('favoriteNutrients', 'current')
      if (storedFavorites) {
        favoriteNutrients.value = storedFavorites
      }
    } catch (error) {
      console.error('Failed to load initial data:', error)
      nutrientsFile.value = dataset as NutrientFile[]
    }
  }

  loadInitialData()

  const saveFavorites = async () => {
    try {
      await db.put('favoriteNutrients', favoriteNutrients.value, 'current')
    } catch (error) {
      console.error('Failed to save favorites:', error)
    }
  }

  const totalNutrients = computed(() => nutrientsFile.value.length)
  const favoriteCount = computed(() => favoriteNutrients.value.length)
  const isDataLoaded = computed(() => nutrientsFile.value.length > 0)
  const searchOptions = {
    keys: ['FoodDescriptionF', 'FoodDescription'],
    location: 0,
    distance: 200,
    threshold: 0.2,
    isCaseSensitive: false,
    includeMatches: true,
    includeScore: true,
    minMatchCharLength: 2
  }

  // Actions
  function searchNutrients(search: string): SearchResult[] {
    try {
      if (!search || search.trim().length < 2) {
        return []
      }

      const searchKey = search.toLowerCase().trim()

      // Check cache first
      if (searchCache.has(searchKey)) {
        return searchCache.get(searchKey)!
      }

      if (nutrientsFile.value.length === 0) {
        console.warn('Nutrients file is empty')
        return []
      }

      const fuse = new Fuse(nutrientsFile.value, searchOptions)
      const results = fuse.search(searchKey) as SearchResult[]

      // Cache results for performance
      if (results.length > 0) {
        searchCache.set(searchKey, results)
      }

      return results
    } catch (error) {
      console.error('Failed to search nutrients:', error)
      return []
    }
  }

  function getNutrientById(id: number): NutrientFile | undefined {
    try {
      return nutrientsFile.value.find(nutrient => nutrient.FoodID === id)
    } catch (error) {
      console.error('Failed to get nutrient by ID:', error)
      return undefined
    }
  }

  function addToFavorites(foodId: number): boolean {
    try {
      if (!favoriteNutrients.value.includes(foodId)) {
        favoriteNutrients.value.push(foodId)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to add to favorites:', error)
      return false
    }
  }

  function removeFromFavorites(foodId: number): boolean {
    try {
      const index = favoriteNutrients.value.indexOf(foodId)
      if (index !== -1) {
        favoriteNutrients.value.splice(index, 1)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to remove from favorites:', error)
      return false
    }
  }

  function toggleFavorite(foodId: number): boolean {
    try {
      if (favoriteNutrients.value.includes(foodId)) {
        return removeFromFavorites(foodId)
      } else {
        return addToFavorites(foodId)
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      return false
    }
  }

  function isFavorite(foodId: number): boolean {
    try {
      return favoriteNutrients.value.includes(foodId)
    } catch (error) {
      console.error('Failed to check favorite status:', error)
      return false
    }
  }

  function getFavoriteNutrients(): NutrientFile[] {
    try {
      return favoriteNutrients.value
        .map(id => getNutrientById(id))
        .filter((nutrient): nutrient is NutrientFile => nutrient !== undefined)
    } catch (error) {
      console.error('Failed to get favorite nutrients:', error)
      return []
    }
  }

  function clearSearchCache(): void {
    try {
      searchCache.clear()
    } catch (error) {
      console.error('Failed to clear search cache:', error)
    }
  }

  async function reloadData(): Promise<boolean> {
    try {
      nutrientsFile.value = dataset as NutrientFile[]
      await db.put('nutrientsFile', nutrientsFile.value, 0)
      clearSearchCache()
      return true
    } catch (error) {
      console.error('Failed to reload data:', error)
      return false
    }
  }

  async function initializeData(): Promise<boolean> {
    try {
      if (nutrientsFile.value.length === 0) {
        nutrientsFile.value = dataset as NutrientFile[]
        await db.put('nutrientsFile', nutrientsFile.value, 0)
      }
      return true
    } catch (error) {
      console.error('Failed to initialize nutrient data:', error)
      return false
    }
  }

  async function $reset(): Promise<boolean> {
    try {
      nutrientsFile.value = dataset as NutrientFile[]
      favoriteNutrients.value = []
      await db.put('nutrientsFile', nutrientsFile.value, 0)
      await saveFavorites()
      clearSearchCache()
      return true
    } catch (error) {
      console.error('Failed to reset nutrient file store:', error)
      return false
    }
  }

  return {
    // State
    nutrientsFile,
    favoriteNutrients,
    // Getters
    totalNutrients,
    favoriteCount,
    isDataLoaded,
    // Actions
    searchNutrients,
    getNutrientById,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavoriteNutrients,
    clearSearchCache,
    initializeData,
    reloadData,
    $reset
  }
})
