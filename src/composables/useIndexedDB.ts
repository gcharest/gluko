import { ref } from 'vue'
import type { NutrientFile } from '@/stores/nutrientsFile'
import type { UserSession } from '@/stores/session'
import type {
  Subject,
  CalculationSession,
  MealHistoryEntry,
  UserAccount
} from '@/types/meal-history'

interface DBSchema {
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
  subjects: {
    key: string
    value: Subject
  }
  activeSessions: {
    key: string
    value: CalculationSession
  }
  mealHistory: {
    key: string
    value: MealHistoryEntry
  }
  userAccount: {
    key: string
    value: UserAccount
  }
}

const DB_NAME = 'GlukoApp'
const DB_VERSION = 3 // Incrementing version for multi-subject support

export const useIndexedDB = () => {
  const db = ref<IDBDatabase | null>(null)
  const error = ref<Error | null>(null)
  const isInitialized = ref(false)
  const initializationPromise = ref<Promise<void> | null>(null)

  const handleError = (err: Error | DOMException | unknown): Error => {
    if (err instanceof Error) {
      error.value = err
      return err
    }

    if (err instanceof DOMException) {
      if (err.name === 'QuotaExceededError') {
        const quotaError = new Error(
          'Storage quota exceeded. Please free up some space and try again.'
        )
        error.value = quotaError
        return quotaError
      }
      if (err.name === 'SecurityError') {
        const securityError = new Error(
          'Permission denied to access IndexedDB. Please check your privacy settings.'
        )
        error.value = securityError
        return securityError
      }
      if (err.name === 'TransactionInactiveError') {
        const transactionError = new Error('Database transaction failed. Please try again.')
        error.value = transactionError
        return transactionError
      }
      if (err.name === 'InvalidStateError') {
        const stateError = new Error(
          'Database is not in a valid state. Please reload the application.'
        )
        error.value = stateError
        return stateError
      }
    }

    const errMessage =
      err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error'

    const genericError = new Error(`An error occurred: ${errMessage}`)
    error.value = genericError
    return genericError
  }

  const initializeDB = (): Promise<void> => {
    if (isInitialized.value) return Promise.resolve()
    if (initializationPromise.value) return initializationPromise.value

    const promise = new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        if (request.error?.name === 'QuotaExceededError') {
          const err = new Error('Storage quota exceeded. Please free up some space and try again.')
          error.value = err
          reject(err)
          return
        }

        if (request.error?.name === 'SecurityError') {
          const err = new Error(
            'Permission denied to access IndexedDB. Please check your privacy settings.'
          )
          error.value = err
          reject(err)
          return
        }

        const err = new Error(
          `Failed to open database: ${request.error?.message || 'Unknown error'}`
        )
        error.value = err
        reject(err)
      }

      request.onsuccess = () => {
        db.value = request.result
        isInitialized.value = true
        resolve()
      }

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const database = (event.target as IDBOpenDBRequest).result
        const oldVersion = event.oldVersion

        // On fresh install or version < 3, create all stores
        if (oldVersion < 3) {
          // Delete legacy stores if they exist (for upgrades)
          const storeNames = Array.from(database.objectStoreNames)
          storeNames.forEach((storeName) => {
            if (['meals', 'mealNutrients'].includes(storeName)) {
              database.deleteObjectStore(storeName)
            }
          })

          // Create all stores fresh
          database.createObjectStore('favoriteNutrients')
          database.createObjectStore('userSession')
          database.createObjectStore('nutrientsFile')

          // Multi-subject support stores
          const subjectsStore = database.createObjectStore('subjects', { keyPath: 'id' })
          subjectsStore.createIndex('by-name', 'name', { unique: false })
          subjectsStore.createIndex('by-active', 'active', { unique: false })

          const sessionsStore = database.createObjectStore('activeSessions', { keyPath: 'id' })
          sessionsStore.createIndex('by-subject', 'subjectId', { unique: false })
          sessionsStore.createIndex('by-status', 'status', { unique: false })

          const historyStore = database.createObjectStore('mealHistory', { keyPath: 'id' })
          historyStore.createIndex('by-subject', 'subjectId', { unique: false })
          historyStore.createIndex('by-date', 'date', { unique: false })
          historyStore.createIndex('by-tags', 'tags', { unique: false, multiEntry: true })

          database.createObjectStore('userAccount', { keyPath: 'id' })
        }
      }

      request.onblocked = () => {
        const err = new Error('Database upgrade blocked. Please close other tabs and try again.')
        error.value = err
        reject(err)
      }
    })

    initializationPromise.value = promise
    return promise
  }

  const openDB = async (): Promise<IDBDatabase> => {
    await initializeDB()
    if (!db.value) {
      throw new Error('Database not initialized')
    }
    return db.value
  }

  const getStore = async (
    storeName: keyof DBSchema,
    mode: 'readonly' | 'readwrite' = 'readonly'
  ) => {
    const database = await openDB()
    const transaction = database.transaction(storeName, mode)
    return transaction.objectStore(storeName)
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
            resolve(
              results.map((result) =>
                typeof result === 'object' && result !== null
                  ? (deserializeDates(result as Record<string, unknown>) as DBSchema[K]['value'])
                  : result
              )
            )
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
        const request =
          key !== undefined ? store.put(serializedValue, key) : store.put(serializedValue)

        request.onsuccess = () => resolve(key ?? (request.result as DBSchema[K]['key']))
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

  // Enhanced get method with index support
  const getByIndex = async <K extends keyof DBSchema>(
    storeName: K,
    indexName: string,
    key: string | number | Date | ArrayBuffer | string[] | number[] | Date[] | ArrayBuffer[]
  ): Promise<DBSchema[K]['value'] | undefined> => {
    try {
      const store = await getStore(storeName)
      const index = store.index(indexName)

      return new Promise((resolve, reject) => {
        const request = index.get(key)
        request.onsuccess = () => {
          const result = request.result
          if (result === undefined) {
            resolve(undefined)
            return
          }
          resolve(deserializeDates(result as Record<string, unknown>) as DBSchema[K]['value'])
        }
        request.onerror = () => reject(handleError(request.error))
      })
    } catch (err) {
      throw handleError(err)
    }
  }

  // Get all by index
  const getAllByIndex = async <K extends keyof DBSchema>(
    storeName: K,
    indexName: string,
    key: string | number | Date | ArrayBuffer | string[] | number[] | Date[] | ArrayBuffer[]
  ): Promise<DBSchema[K]['value'][]> => {
    try {
      const store = await getStore(storeName)
      const index = store.index(indexName)

      return new Promise((resolve, reject) => {
        const request = index.getAll(key)
        request.onsuccess = () => {
          const results = request.result
          if (Array.isArray(results)) {
            resolve(
              results.map(
                (result) =>
                  deserializeDates(result as Record<string, unknown>) as DBSchema[K]['value']
              )
            )
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

  // Subject management methods
  const getSubject = (id: string) => get('subjects', id)
  const getAllSubjects = () => getAll('subjects')
  const getActiveSubjects = () => getAllByIndex('subjects', 'by-active', 1) // Using 1 for true in IndexedDB
  const saveSubject = (subject: Subject) => put('subjects', subject)
  const removeSubject = (id: string) => remove('subjects', id)

  // Calculation session methods
  const getSession = (id: string) => get('activeSessions', id)
  const getSessionsBySubject = (subjectId: string) =>
    getAllByIndex('activeSessions', 'by-subject', subjectId)
  const getSessionsByStatus = (status: 'draft' | 'completed') =>
    getAllByIndex('activeSessions', 'by-status', status)
  const saveSession = (session: CalculationSession) => put('activeSessions', session)
  const removeSession = (id: string) => remove('activeSessions', id)

  // Meal history methods
  const getMealHistory = (id: string) => get('mealHistory', id)
  const getMealHistoryBySubject = (subjectId: string) =>
    getAllByIndex('mealHistory', 'by-subject', subjectId)
  const getMealHistoryByDate = (date: Date) => getAllByIndex('mealHistory', 'by-date', date)
  const getMealHistoryByTag = (tag: string) => getAllByIndex('mealHistory', 'by-tags', tag)
  const saveMealHistory = (entry: MealHistoryEntry) => put('mealHistory', entry)
  const removeMealHistory = (id: string) => remove('mealHistory', id)

  // User account methods
  const getUserAccount = (id: string) => get('userAccount', id)
  const saveUserAccount = (account: UserAccount) => put('userAccount', account)

  return {
    // Base operations
    get,
    getAll,
    put,
    remove,
    clear,
    error,

    // Enhanced operations
    getByIndex,
    getAllByIndex,

    // Subject operations
    getSubject,
    getAllSubjects,
    getActiveSubjects,
    saveSubject,
    removeSubject,

    // Session operations
    getSession,
    getSessionsBySubject,
    getSessionsByStatus,
    saveSession,
    removeSession,

    // Meal history operations
    getMealHistory,
    getMealHistoryBySubject,
    getMealHistoryByDate,
    getMealHistoryByTag,
    saveMealHistory,
    removeMealHistory,

    // User account operations
    getUserAccount,
    saveUserAccount
  }
}
