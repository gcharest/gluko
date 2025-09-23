import { defineStore } from 'pinia'
import { useSessionStorage } from '@vueuse/core'
import { computed } from 'vue'

export interface Nutrient {
  id: string
  name: string
  quantity: number
  factor: number
}

export interface Meal {
  id: string
  nutrients: Nutrient[]
  date: Date
  totalCarbs: number
}

export const useMealStore = defineStore('mealStore', () => {
  // Helper function
  const getUUID = () => crypto.randomUUID()

  // State
  const mealNutrients = useSessionStorage('mealNutrients', [] as Nutrient[])
  const meals = useSessionStorage("meals", [] as Meal[])

  // Getters (computed)
  const nutrientEmpty = computed(() => mealNutrients.value.length <= 0)

  const mealCarbs = computed(() =>
    mealNutrients.value.reduce(
      (totalCarbs, nutrient) => totalCarbs + nutrient.quantity * nutrient.factor,
      0
    )
  )

  const nutrientCount = computed(() => mealNutrients.value.length)

  // Meal history getters
  const totalMeals = computed(() => meals.value.length)

  const recentMeals = computed(() =>
    meals.value
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  )

  const averageCarbsPerMeal = computed(() => {
    if (meals.value.length === 0) return 0
    const total = meals.value.reduce((sum, meal) => sum + meal.totalCarbs, 0)
    return Math.round((total / meals.value.length) * 100) / 100
  })

  const dailyMealStats = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayMeals = meals.value.filter(meal => {
      const mealDate = new Date(meal.date)
      mealDate.setHours(0, 0, 0, 0)
      return mealDate.getTime() === today.getTime()
    })

    return {
      count: todayMeals.length,
      totalCarbs: todayMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0),
      averageCarbs: todayMeals.length > 0
        ? Math.round((todayMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0) / todayMeals.length) * 100) / 100
        : 0
    }
  })

  // Actions
  function getMealNutrientByID(id: string): Nutrient | undefined {
    try {
      return mealNutrients.value.find((n) => n.id === id)
    } catch (error) {
      console.error('Failed to get nutrient by ID:', error)
      return undefined
    }
  }

  function addNutrient(nutrient: Nutrient): boolean {
    try {
      mealNutrients.value.push(nutrient)
      return true
    } catch (error) {
      console.error('Failed to add nutrient:', error)
      return false
    }
  }

  function addEmptyNutrient(): boolean {
    try {
      const uuid = getUUID()
      mealNutrients.value.push({
        id: uuid,
        name: 'Aliment',
        quantity: 0,
        factor: 0
      })
      return true
    } catch (error) {
      console.error('Failed to add empty nutrient:', error)
      return false
    }
  }


  function removeNutrient(identifier: string | number | Nutrient): boolean {
    try {
      let index = -1

      if (typeof identifier === 'string') {
        // Remove by ID
        index = mealNutrients.value.findIndex((n) => n.id === identifier)
      } else if (typeof identifier === 'number') {
        // Remove by index
        index = identifier
      } else {
        // Remove by nutrient object
        index = mealNutrients.value.findIndex((n) => n.id === identifier.id)
      }

      if (index !== -1 && index < mealNutrients.value.length) {
        mealNutrients.value.splice(index, 1)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to remove nutrient:', error)
      return false
    }
  }

  function updateNutrient(nutrient: Nutrient): boolean {
    try {
      const index = mealNutrients.value.findIndex((n) => n.id === nutrient.id)
      if (index !== -1) {
        mealNutrients.value.splice(index, 1, nutrient)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to update nutrient:', error)
      return false
    }
  }

  function clearMeal(): boolean {
    try {
      mealNutrients.value = []
      return true
    } catch (error) {
      console.error('Failed to clear meal:', error)
      return false
    }
  }

  function $reset(): boolean {
    try {
      const uuid = getUUID()
      mealNutrients.value = [
        {
          id: uuid,
          name: 'Aliment 1',
          quantity: 0,
          factor: 0
        }
      ]
      return true
    } catch (error) {
      console.error('Failed to reset meal store:', error)
      return false
    }
  }

  // Batch operations for better performance
  function addMultipleNutrients(nutrients: Nutrient[]): boolean {
    try {
      mealNutrients.value.push(...nutrients)
      return true
    } catch (error) {
      console.error('Failed to add multiple nutrients:', error)
      return false
    }
  }

  function updateMultipleNutrients(nutrients: Nutrient[]): boolean {
    try {
      nutrients.forEach(nutrient => {
        const index = mealNutrients.value.findIndex((n) => n.id === nutrient.id)
        if (index !== -1) {
          mealNutrients.value.splice(index, 1, nutrient)
        }
      })
      return true
    } catch (error) {
      console.error('Failed to update multiple nutrients:', error)
      return false
    }
  }

  // Meal history management
  function saveMeal(): string | null {
    try {
      if (mealNutrients.value.length === 0) {
        console.warn('Cannot save empty meal')
        return null
      }

      const mealId = getUUID()
      const meal: Meal = {
        id: mealId,
        nutrients: [...mealNutrients.value], // Create a copy
        date: new Date(),
        totalCarbs: mealCarbs.value
      }

      meals.value.push(meal)
      return mealId
    } catch (error) {
      console.error('Failed to save meal:', error)
      return null
    }
  }

  function saveMealAndClear(): string | null {
    try {
      const mealId = saveMeal()
      if (mealId) {
        clearMeal()
      }
      return mealId
    } catch (error) {
      console.error('Failed to save meal and clear:', error)
      return null
    }
  }

  function getMealById(id: string): Meal | undefined {
    try {
      return meals.value.find(meal => meal.id === id)
    } catch (error) {
      console.error('Failed to get meal by ID:', error)
      return undefined
    }
  }

  function deleteMeal(id: string): boolean {
    try {
      const index = meals.value.findIndex(meal => meal.id === id)
      if (index !== -1) {
        meals.value.splice(index, 1)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete meal:', error)
      return false
    }
  }

  function loadMealAsTemplate(id: string): boolean {
    try {
      const meal = getMealById(id)
      if (!meal) {
        console.warn('Meal not found:', id)
        return false
      }

      // Copy nutrients from saved meal to current meal
      mealNutrients.value = meal.nutrients.map(nutrient => ({
        ...nutrient,
        id: getUUID() // Generate new IDs for the template
      }))

      return true
    } catch (error) {
      console.error('Failed to load meal as template:', error)
      return false
    }
  }

  function getMealsByDateRange(startDate: Date, endDate: Date): Meal[] {
    try {
      return meals.value.filter(meal => {
        const mealDate = new Date(meal.date)
        return mealDate >= startDate && mealDate <= endDate
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } catch (error) {
      console.error('Failed to get meals by date range:', error)
      return []
    }
  }

  function getMealsForToday(): Meal[] {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      return getMealsByDateRange(today, tomorrow)
    } catch (error) {
      console.error('Failed to get today\'s meals:', error)
      return []
    }
  }

  function getMealsForWeek(): Meal[] {
    try {
      const today = new Date()
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)

      return getMealsByDateRange(weekAgo, today)
    } catch (error) {
      console.error('Failed to get week\'s meals:', error)
      return []
    }
  }

  function clearMealHistory(): boolean {
    try {
      meals.value = []
      return true
    } catch (error) {
      console.error('Failed to clear meal history:', error)
      return false
    }
  }

  function exportMealHistory(): string | null {
    try {
      return JSON.stringify(meals.value, null, 2)
    } catch (error) {
      console.error('Failed to export meal history:', error)
      return null
    }
  }

  function importMealHistory(jsonData: string): boolean {
    try {
      const importedMeals = JSON.parse(jsonData) as Meal[]

      // Validate the imported data
      if (!Array.isArray(importedMeals)) {
        throw new Error('Invalid meal history format')
      }

      // Merge with existing meals, avoiding duplicates
      const existingIds = new Set(meals.value.map(meal => meal.id))
      const newMeals = importedMeals.filter(meal => !existingIds.has(meal.id))

      meals.value.push(...newMeals)
      return true
    } catch (error) {
      console.error('Failed to import meal history:', error)
      return false
    }
  }

  return {
    // State
    mealNutrients,
    meals,
    // Getters
    nutrientEmpty,
    mealCarbs,
    nutrientCount,
    totalMeals,
    recentMeals,
    averageCarbsPerMeal,
    dailyMealStats,
    // Actions
    getMealNutrientByID,
    addNutrient,
    addEmptyNutrient,
    removeNutrient, // Consolidated method
    updateNutrient,
    clearMeal,
    addMultipleNutrients,
    updateMultipleNutrients,
    // Meal history actions
    saveMeal,
    saveMealAndClear,
    getMealById,
    deleteMeal,
    loadMealAsTemplate,
    getMealsByDateRange,
    getMealsForToday,
    getMealsForWeek,
    clearMealHistory,
    exportMealHistory,
    importMealHistory,
    $reset
  }
})
