import { defineStore } from 'pinia'
import { useSessionStorage } from '@vueuse/core'
import { computed } from 'vue'

export interface Nutrient {
  id: string
  name: string
  quantity: number
  factor: number
}

//TODO: Add Meal interface and use it in the store to introduce meals history
// interface Meal {
//   nutrients: Nutrient[];
//   date: Date;
// }

export const useMealStore = defineStore('mealStore', () => {
  const getUUID = () => {
    return crypto.randomUUID()
  }
  // const meals = useSessionStorage("meals", [] as Meal[]);
  const mealNutrients = useSessionStorage('mealNutrients', [] as Nutrient[])

  const getMealNutrientByID = computed((id: string) => {
    return mealNutrients.value.find((n) => n.id === id)
  })

  const nutrientEmpty = computed(() => mealNutrients.value.length <= 0)
  const mealCarbs = computed(() =>
    mealNutrients.value.reduce(
      (totalCarbs, nutrient) => totalCarbs + nutrient.quantity * nutrient.factor,
      0
    )
  )

  function addNutrient(nutrient: Nutrient) {
    mealNutrients.value.push(nutrient)
  }

  function addEmptyNutrient() {
    const uuid = getUUID()
    mealNutrients.value.push({
      id: uuid,
      name: 'Aliment',
      quantity: 0,
      factor: 0
    })
  }

  function removeNutrient(nutrient: Nutrient) {
    const index = mealNutrients.value.findIndex((n) => n.id === nutrient.id)
    mealNutrients.value.splice(index, 1)
  }

  function removeNutrientByID(id: string) {
    const index = mealNutrients.value.findIndex((n) => n.id === id)
    mealNutrients.value.splice(index, 1)
  }

  function removeNutrientByIndex(index: number) {
    mealNutrients.value.splice(index, 1)
  }

  function updateNutrient(nutrient: Nutrient) {
    const index = mealNutrients.value.findIndex((n) => n.id === nutrient.id)
    mealNutrients.value.splice(index, 1, nutrient)
  }

  function $reset() {
    const uuid = getUUID()
    mealNutrients.value = [
      {
        id: uuid,
        name: 'Aliment 1',
        quantity: 0,
        factor: 0
      }
    ]
  }

  return {
    mealNutrients,
    getMealNutrientByID,
    nutrientEmpty,
    mealCarbs,
    addNutrient,
    addEmptyNutrient,
    removeNutrient,
    removeNutrientByID,
    removeNutrientByIndex,
    updateNutrient,
    $reset
  }
})
