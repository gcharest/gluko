export const serializeDates = (obj: unknown): unknown => {
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

export const deserializeDates = (obj: unknown): unknown => {
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(obj)) {
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
