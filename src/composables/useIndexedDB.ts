import { ref } from 'vue'
import type { NutrientFile } from '@/stores/nutrientsFile'
import type { Nutrient, Meal } from '@/stores/meal'
import type { UserSession } from '@/stores/session'

interface DBSchema {
  meals: {
    key: string
    value: Meal
  }
  mealNutrients: {
    key: string
    value: { nutrients: Nutrient[] }
  }
  favoriteNutrients: {
    key: string
    value: number[]
  }
  userSession: {
    key: string
    value: UserSession
  }
  nutrientsFile: {
    key: number
    value: NutrientFile[]
  }
}

const DB_NAME = 'GlukoApp'
const DB_VERSION = 2 // Incrementing version to force schema update

export const useIndexedDB = () => {
  const db = ref<IDBDatabase | null>(null)
  const error = ref<Error | null>(null)

  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (db.value) {
        resolve(db.value)
        return
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        const err = new Error('Failed to open database')
        error.value = err
        reject(err)
      }

      request.onsuccess = () => {
        db.value = request.result
        resolve(request.result)
      }

      request.onupgradeneeded = async (event) => {
        const database = (event.target as IDBRequest<IDBDatabase>).result
        const oldVersion = event.oldVersion

        switch (oldVersion) {
          case 0:
            database.createObjectStore('meals', { keyPath: 'id' })
            database.createObjectStore('mealNutrients')
            database.createObjectStore('favoriteNutrients')
            database.createObjectStore('userSession')
            database.createObjectStore('nutrientsFile')
            break

          // For future version migrations, add cases here
          // case 1:
          //   // Upgrade from version 1 to 2
          //   break
        }
      }

      request.onblocked = () => {
        console.warn('Database blocked. Please close other tabs and try again.')
        const err = new Error('Database upgrade blocked. Please close other tabs and try again.')
        error.value = err
        reject(err)
      }

      request.onerror = () => {
        // Handle quota exceeded error specifically
        if (request.error?.name === 'QuotaExceededError') {
          const err = new Error('Storage quota exceeded. Please free up some space and try again.')
          error.value = err
          reject(err)
          return
        }

        // Handle permission denied error
        if (request.error?.name === 'SecurityError') {
          const err = new Error('Permission denied to access IndexedDB. Please check your privacy settings.')
          error.value = err
          reject(err)
          return
        }

        // General database error
        const err = new Error(`Failed to open database: ${request.error?.message}`)
        error.value = err
        reject(err)
      }

      request.onupgradeneeded = async (event) => {
        const database = (event.target as IDBRequest<IDBDatabase>).result

        // Delete old object stores if they exist
        const storeNames = database.objectStoreNames
        for (const storeName of Array.from(storeNames)) {
          database.deleteObjectStore(storeName)
        }

        // Create new object stores
        database.createObjectStore('meals', { keyPath: 'id' })
        database.createObjectStore('mealNutrients') // No keyPath, we use explicit keys for the current meal nutrients
        database.createObjectStore('favoriteNutrients') // No keyPath, we use explicit keys
        database.createObjectStore('userSession') // No keyPath, we use explicit keys
        database.createObjectStore('nutrientsFile') // No keyPath, we use explicit keys
      }
    })
  }

  const getStore = async (storeName: keyof DBSchema, mode: 'readonly' | 'readwrite' = 'readonly') => {
    const database = await openDB()
    const transaction = database.transaction(storeName, mode)
    return transaction.objectStore(storeName)
  }

  const handleError = (err: Error | DOMException | unknown): Error => {
    if (err instanceof Error) {
      error.value = err
      return err
    }

    if (err instanceof DOMException) {
      if (err.name === 'QuotaExceededError') {
        const quotaError = new Error('Storage quota exceeded. Please free up some space and try again.')
        error.value = quotaError
        return quotaError
      }
      if (err.name === 'SecurityError') {
        const securityError = new Error('Permission denied to access IndexedDB. Please check your privacy settings.')
        error.value = securityError
        return securityError
      }
      if (err.name === 'TransactionInactiveError') {
        const transactionError = new Error('Database transaction failed. Please try again.')
        error.value = transactionError
        return transactionError
      }
      if (err.name === 'InvalidStateError') {
        const stateError = new Error('Database is not in a valid state. Please reload the application.')
        error.value = stateError
        return stateError
      }
    }

    const errMessage = err instanceof Error ? err.message :
      typeof err === 'string' ? err :
        'Unknown error'

    const genericError = new Error(`An error occurred: ${errMessage}`)
    error.value = genericError
    return genericError
  }



  const serializeDates = (obj: unknown): unknown => {
    if (obj instanceof Date) {
      return obj.toISOString()
    }

    if (Array.isArray(obj)) {
      return obj.map(serializeDates)
    }

    if (typeof obj === 'object' && obj !== null) {
      const result: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj)) {
        result[key] = serializeDates(value)
      }
      return result
    }

    return obj
  }

  const deserializeDates = (obj: unknown): unknown => {
    if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(obj)) {
      return new Date(obj)
    }

    if (Array.isArray(obj)) {
      return obj.map(deserializeDates)
    }

    if (typeof obj === 'object' && obj !== null) {
      const result: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj)) {
        result[key] = deserializeDates(value)
      }
      return result
    }

    return obj
  }

  const get = async <K extends keyof DBSchema>(
    storeName: K,
    key: DBSchema[K]['key']
  ): Promise<DBSchema[K]['value'] | undefined> => {
    try {
      const store = await getStore(storeName)
      return new Promise((resolve, reject) => {
        const request = store.get(key)
        request.onsuccess = () => {
          const result = request.result
          if (result === undefined) {
            resolve(undefined)
            return
          }

          // Deserialize any stored dates
          if (typeof result === 'object' && result !== null) {
            resolve(deserializeDates(result as Record<string, unknown>) as DBSchema[K]['value'])
          } else {
            resolve(result)
          }
        }
        request.onerror = () => reject(handleError(request.error))
      })
    } catch (err) {
      throw handleError(err)
    }
  }

  const getAll = async <K extends keyof DBSchema>(
    storeName: K
  ): Promise<DBSchema[K]['value'][]> => {
    try {
      const store = await getStore(storeName)
      return new Promise((resolve, reject) => {
        const request = store.getAll()
        request.onsuccess = () => {
          const results = request.result

          // Deserialize dates in all records
          if (Array.isArray(results)) {
            resolve(results.map(result =>
              typeof result === 'object' && result !== null
                ? deserializeDates(result as Record<string, unknown>) as DBSchema[K]['value']
                : result
            ))
          } else {
            resolve([])
          }
        }
        request.onerror = () => reject(handleError(request.error))
      })
    } catch (err) {
      throw handleError(err)
    }
  }

  const put = async <K extends keyof DBSchema>(
    storeName: K,
    value: DBSchema[K]['value'],
    key?: DBSchema[K]['key']
  ): Promise<DBSchema[K]['key']> => {
    try {
      const store = await getStore(storeName, 'readwrite')
      const tx = store.transaction

      const txPromise = new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve()
        tx.onabort = () => reject(handleError(tx.error))
        tx.onerror = () => reject(handleError(tx.error))
      })

      const putPromise = new Promise<DBSchema[K]['key']>((resolve, reject) => {
        const serializedValue = serializeDates(value)
        const request = key !== undefined
          ? store.put(serializedValue, key)
          : store.put(serializedValue)

        request.onsuccess = () => resolve(key ?? request.result as DBSchema[K]['key'])
        request.onerror = () => {
          tx.abort()
          reject(handleError(request.error))
        }
      })

      // Wait for both transaction and put to complete
      const [storedKey] = await Promise.all([putPromise, txPromise])
      return storedKey

    } catch (err) {
      throw handleError(err)
    }
  }

  const remove = async <K extends keyof DBSchema>(
    storeName: K,
    key: DBSchema[K]['key']
  ): Promise<void> => {
    try {
      const store = await getStore(storeName, 'readwrite')
      const tx = store.transaction

      await Promise.all([
        new Promise<void>((resolve, reject) => {
          const request = store.delete(key)
          request.onsuccess = () => resolve()
          request.onerror = () => {
            tx.abort()
            reject(handleError(request.error))
          }
        }),
        new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => resolve()
          tx.onabort = () => reject(handleError(tx.error))
          tx.onerror = () => reject(handleError(tx.error))
        })
      ])

    } catch (err) {
      throw handleError(err)
    }
  }

  const clear = async <K extends keyof DBSchema>(storeName: K): Promise<void> => {
    try {
      const store = await getStore(storeName, 'readwrite')
      const tx = store.transaction

      await Promise.all([
        new Promise<void>((resolve, reject) => {
          const request = store.clear()
          request.onsuccess = () => resolve()
          request.onerror = () => {
            tx.abort()
            reject(handleError(request.error))
          }
        }),
        new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => resolve()
          tx.onabort = () => reject(handleError(tx.error))
          tx.onerror = () => reject(handleError(tx.error))
        })
      ])

    } catch (err) {
      throw handleError(err)
    }
  }





  return {
    get,
    getAll,
    put,
    remove,
    clear,
    error
  }
}