import { defineStore } from 'pinia'
import { useSessionStorage } from '@vueuse/core'
import { computed } from 'vue'
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
  // State - Auto-initialize with dataset if empty
  const nutrientsFile = useSessionStorage('nutrientsFile', dataset as NutrientFile[])
  const favoriteNutrients = useSessionStorage('favoriteNutrients', [] as number[])
  const searchCache = new Map<string, SearchResult[]>()

  // Auto-initialize if data is missing (e.g., after sessionStorage cleared)
  if (nutrientsFile.value.length === 0) {
    nutrientsFile.value = dataset as NutrientFile[]
  }

  // Getters (computed)
  const totalNutrients = computed(() => nutrientsFile.value.length)
  const favoriteCount = computed(() => favoriteNutrients.value.length)
  const isDataLoaded = computed(() => nutrientsFile.value.length > 0)

  // Search configuration
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

  function reloadData(): boolean {
    try {
      nutrientsFile.value = dataset as NutrientFile[]
      clearSearchCache()
      return true
    } catch (error) {
      console.error('Failed to reload data:', error)
      return false
    }
  }

  function initializeData(): boolean {
    try {
      if (nutrientsFile.value.length === 0) {
        nutrientsFile.value = dataset as NutrientFile[]
      }
      return true
    } catch (error) {
      console.error('Failed to initialize nutrient data:', error)
      return false
    }
  }

  function $reset(): boolean {
    try {
      nutrientsFile.value = dataset as NutrientFile[]
      favoriteNutrients.value = []
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
