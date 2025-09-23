import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useIndexedDB } from '@/composables/useIndexedDB'

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
  const db = useIndexedDB()
  const getUUID = () => crypto.randomUUID()

  const mealNutrients = ref<Nutrient[]>([])
  const meals = ref<Meal[]>([])
  const loadInitialData = async () => {
    try {
      const storedNutrients = await db.get('mealNutrients', 'current')
      if (storedNutrients) {
        mealNutrients.value = storedNutrients.nutrients
      }

      const storedMeals = await db.getAll('meals')
      if (storedMeals) {
        meals.value = storedMeals.map(meal => ({
          ...meal,
          date: new Date(meal.date)
        }))
      }
    } catch (error) {
      console.error('Failed to load initial data:', error)
    }
  }

  // Load data when store is initialized
  loadInitialData()

  // Save current meal nutrients
  const saveMealNutrients = async () => {
    try {
      await db.put('mealNutrients', { nutrients: mealNutrients.value }, 'current')
    } catch (error) {
      console.error('Failed to save meal nutrients:', error)
    }
  }

  // Getters (computed)
  const nutrientEmpty = computed(() => mealNutrients.value.length <= 0)

  const mealCarbs = computed(() =>
    mealNutrients.value.reduce(
      (totalCarbs: number, nutrient: Nutrient) => totalCarbs + nutrient.quantity * nutrient.factor,
      0
    )
  )

  const nutrientCount = computed(() => mealNutrients.value.length)

  // Meal history getters
  const totalMeals = computed(() => meals.value.length)

  const recentMeals = computed(() =>
    meals.value
      .slice()
      .sort((a: Meal, b: Meal) => b.date.getTime() - a.date.getTime())
      .slice(0, 10)
  )

  const averageCarbsPerMeal = computed(() => {
    if (meals.value.length === 0) return 0
    const total = meals.value.reduce((sum: number, meal: Meal) => sum + meal.totalCarbs, 0)
    return Math.round((total / meals.value.length) * 100) / 100
  })

  const dailyMealStats = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayMeals = meals.value.filter((meal: Meal) => {
      const mealDate = new Date(meal.date)
      mealDate.setHours(0, 0, 0, 0)
      return mealDate.getTime() === today.getTime()
    })

    return {
      count: todayMeals.length,
      totalCarbs: todayMeals.reduce((sum: number, meal: Meal) => sum + meal.totalCarbs, 0),
      averageCarbs: todayMeals.length > 0
        ? Math.round((todayMeals.reduce((sum: number, meal: Meal) => sum + meal.totalCarbs, 0) / todayMeals.length) * 100) / 100
        : 0
    }
  })

  // Actions
  async function getMealNutrientByID(id: string): Promise<Nutrient | undefined> {
    try {
      return mealNutrients.value.find((n: Nutrient) => n.id === id)
    } catch (error) {
      console.error('Failed to get nutrient by ID:', error)
      return undefined
    }
  }

  async function addNutrient(nutrient: Nutrient): Promise<boolean> {
    try {
      mealNutrients.value.push(nutrient)
      await saveMealNutrients()
      return true
    } catch (error) {
      console.error('Failed to add nutrient:', error)
      return false
    }
  }

  async function addEmptyNutrient(): Promise<boolean> {
    try {
      const uuid = getUUID()
      mealNutrients.value.push({
        id: uuid,
        name: 'Aliment',
        quantity: 0,
        factor: 0
      })
      await saveMealNutrients()
      return true
    } catch (error) {
      console.error('Failed to add empty nutrient:', error)
      return false
    }
  }

  async function removeNutrient(identifier: string | number | Nutrient): Promise<boolean> {
    try {
      let index = -1

      if (typeof identifier === 'string') {
        // Remove by ID
        index = mealNutrients.value.findIndex((n: Nutrient) => n.id === identifier)
      } else if (typeof identifier === 'number') {
        // Remove by index
        index = identifier
      } else {
        // Remove by nutrient object
        index = mealNutrients.value.findIndex((n: Nutrient) => n.id === identifier.id)
      }

      if (index !== -1 && index < mealNutrients.value.length) {
        mealNutrients.value.splice(index, 1)
        await saveMealNutrients()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to remove nutrient:', error)
      return false
    }
  }

  async function updateNutrient(nutrient: Nutrient): Promise<boolean> {
    try {
      const index = mealNutrients.value.findIndex((n: Nutrient) => n.id === nutrient.id)
      if (index !== -1) {
        mealNutrients.value.splice(index, 1, nutrient)
        await saveMealNutrients()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to update nutrient:', error)
      return false
    }
  }

  async function clearMeal(): Promise<boolean> {
    try {
      mealNutrients.value = []
      await saveMealNutrients()
      return true
    } catch (error) {
      console.error('Failed to clear meal:', error)
      return false
    }
  }

  async function $reset(): Promise<boolean> {
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
      await saveMealNutrients()
      return true
    } catch (error) {
      console.error('Failed to reset meal store:', error)
      return false
    }
  }

  // Batch operations for better performance
  async function addMultipleNutrients(nutrients: Nutrient[]): Promise<boolean> {
    try {
      mealNutrients.value.push(...nutrients)
      await saveMealNutrients()
      return true
    } catch (error) {
      console.error('Failed to add multiple nutrients:', error)
      return false
    }
  }

  async function updateMultipleNutrients(nutrients: Nutrient[]): Promise<boolean> {
    try {
      nutrients.forEach(nutrient => {
        const index = mealNutrients.value.findIndex((n: Nutrient) => n.id === nutrient.id)
        if (index !== -1) {
          mealNutrients.value.splice(index, 1, nutrient)
        }
      })
      await saveMealNutrients()
      return true
    } catch (error) {
      console.error('Failed to update multiple nutrients:', error)
      return false
    }
  }

  // Meal history management
  async function saveMeal(): Promise<string | null> {
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
      await db.put('meals', meal, mealId)
      return mealId
    } catch (error) {
      console.error('Failed to save meal:', error)
      return null
    }
  }

  async function saveMealAndClear(): Promise<string | null> {
    try {
      const mealId = await saveMeal()
      if (mealId) {
        await clearMeal()
      }
      return mealId
    } catch (error) {
      console.error('Failed to save meal and clear:', error)
      return null
    }
  }

  async function getMealById(id: string): Promise<Meal | undefined> {
    try {
      const meal = await db.get('meals', id)
      if (meal) {
        return {
          ...meal,
          date: new Date(meal.date)
        }
      }
      return undefined
    } catch (error) {
      console.error('Failed to get meal by ID:', error)
      return undefined
    }
  }

  async function deleteMeal(id: string): Promise<boolean> {
    try {
      const index = meals.value.findIndex((meal: Meal) => meal.id === id)
      if (index !== -1) {
        meals.value.splice(index, 1)
        await db.remove('meals', id)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete meal:', error)
      return false
    }
  }

  async function loadMealAsTemplate(id: string): Promise<boolean> {
    try {
      const meal = await getMealById(id)
      if (!meal) {
        console.warn('Meal not found:', id)
        return false
      }

      // Copy nutrients from saved meal to current meal
      mealNutrients.value = meal.nutrients.map(nutrient => ({
        ...nutrient,
        id: getUUID() // Generate new IDs for the template
      }))
      await saveMealNutrients()

      return true
    } catch (error) {
      console.error('Failed to load meal as template:', error)
      return false
    }
  }

  function getMealsByDateRange(startDate: Date, endDate: Date): Meal[] {
    try {
      return meals.value.filter((meal: Meal) => {
        const mealDate = meal.date
        return mealDate >= startDate && mealDate <= endDate
      }).sort((a: Meal, b: Meal) => b.date.getTime() - a.date.getTime())
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

  async function clearMealHistory(): Promise<boolean> {
    try {
      meals.value = []
      await db.clear('meals')
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

  async function importMealHistory(jsonData: string): Promise<boolean> {
    try {
      const importedMeals = JSON.parse(jsonData) as Meal[]

      // Validate the imported data
      if (!Array.isArray(importedMeals)) {
        throw new Error('Invalid meal history format')
      }

      // Merge with existing meals, avoiding duplicates
      const existingIds = new Set(meals.value.map(meal => meal.id))
      const newMeals = importedMeals.filter(meal => !existingIds.has(meal.id))

      // Add new meals to IndexedDB and memory
      for (const meal of newMeals) {
        await db.put('meals', {
          ...meal,
          date: new Date(meal.date)
        }, meal.id)
      }

      meals.value.push(...newMeals.map(meal => ({
        ...meal,
        date: new Date(meal.date)
      })))

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
