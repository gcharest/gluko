/**
 * Download data as a JSON file
 */
export function downloadJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  // Clean up
  URL.revokeObjectURL(url)
}

/**
 * Read and parse a JSON file
 */
export function readJSONFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        resolve(json)
      } catch {
        reject(new Error('Invalid JSON file'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

/**
 * Generate a filename for export with timestamp
 */
export function generateExportFilename(prefix: string, suffix?: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const parts = [prefix, suffix, timestamp].filter(Boolean)
  return `${parts.join('_')}.json`
}

/**
 * Trigger file picker and return selected file
 */
export function pickFile(accept = '.json'): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept

    input.onchange = () => {
      const file = input.files?.[0]
      resolve(file || null)
    }

    input.oncancel = () => {
      resolve(null)
    }

    input.click()
  })
}
