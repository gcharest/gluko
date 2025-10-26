import { describe, it, expect, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadConversionFactors } from '../lib/loaders.js'
import { applyConversionFactorUpdates } from '../lib/appliers.js'
import { updateDir as exportedUpdateDir } from '../lib/csv.js'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(testDir, '..')
const fallbackUpdateDir = path.join(
  packageRoot,
  'nutrient_file_raw',
  'cnf-fcen-csv-update-miseajour'
)
const updateDir = exportedUpdateDir || fallbackUpdateDir

describe('applyConversionFactorUpdates', () => {
  const changeFile = path.join(updateDir, 'CONVERSION FACTOR CHANGE.csv')
  const addFile = path.join(updateDir, 'CONVERSION FACTOR ADD.csv')
  const deleteFile = path.join(updateDir, 'CONVERSION FACTOR DELETE.csv')

  afterEach(() => {
    ;[changeFile, addFile, deleteFile].forEach((f) => {
      try {
        if (fs.existsSync(f)) fs.unlinkSync(f)
      } catch (err) {
        void err
      }
    })
  })

  it('applies change/add/delete and returns events', async () => {
    // change existing: update food 10 measure 1
    fs.writeFileSync(
      changeFile,
      'FoodID,MeasureID,ConversionFactorValue,ConvFactorDateOfEntry\n10,1,0.75,2020-01-01\n',
      'utf8'
    )

    // add new measure 9 for food 10
    fs.writeFileSync(
      addFile,
      'FoodID,MeasureID,ConversionFactorValue,ConvFactorDateOfEntry\n10,9,0.33,2020-02-02\n',
      'utf8'
    )

    // delete measure 1 for food 20 (safe even if absent)
    fs.writeFileSync(deleteFile, 'FoodID,MeasureID\n20,1\n', 'utf8')

    const m = await loadConversionFactors()
    expect(m instanceof Map).toBe(true)
    // ensure baseline exists for 10
    expect(Array.isArray(m.get('10'))).toBe(true)

    const events = await applyConversionFactorUpdates(m)
    expect(Array.isArray(events)).toBe(true)
    // after change, measure 1 for food 10 should have updated value
    const arr10 = m.get('10')
    const m1 = arr10.find((x) => x.MeasureID === '1')
    expect(m1).toBeDefined()
    expect(m1.ConversionFactorValue).toBeCloseTo(0.75)
    // new measure 9 should exist
    expect(arr10.find((x) => x.MeasureID === '9')).toBeDefined()
  })
})
