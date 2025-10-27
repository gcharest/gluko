import { describe, it, expect, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadNutrientName } from '../lib/loaders.js'
import { applyNutrientNameUpdates } from '../lib/appliers.js'
import { updateDir as exportedUpdateDir } from '../lib/csv.js'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(testDir, '..')
const fallbackUpdateDir = path.join(
  packageRoot,
  'nutrient_file_raw',
  'cnf-fcen-csv-update-miseajour'
)
const updateDir = exportedUpdateDir || fallbackUpdateDir

describe('applyNutrientNameUpdates', () => {
  const changeFile = path.join(updateDir, 'NUTRIENT NAME CHANGE.csv')
  const addFile = path.join(updateDir, 'NUTRIENT NAME ADD.csv')
  const deleteFile = path.join(updateDir, 'NUTRIENT NAME DELETE.csv')

  afterEach(() => {
    ;[changeFile, addFile, deleteFile].forEach((f) => {
      try {
        if (fs.existsSync(f)) fs.unlinkSync(f)
      } catch (err) {
        void err
      }
    })
  })

  it('applies change, add, delete update files', async () => {
    // create a change: modify NutrientID 1 name
    fs.writeFileSync(
      changeFile,
      'NutrientID,NutrientCode,NutrientSymbol,NutrientUnit,NutrientName,Tagname,NutrientDecimals\n1,GLC,g,mg,Glucose Modified,CHOCDF,2\n',
      'utf8'
    )

    // add a new nutrient 99
    fs.writeFileSync(
      addFile,
      'NutrientID,NutrientCode,NutrientSymbol,NutrientUnit,NutrientName,Tagname,NutrientDecimals\n99,NEW,g,mg,NewNutrient,NEWTAG,1\n',
      'utf8'
    )

    // delete nutrient 2
    fs.writeFileSync(deleteFile, 'NutrientID\n2\n', 'utf8')

    const map = await loadNutrientName()
    expect(map.has('1')).toBe(true)
    expect(map.has('2')).toBe(true)

    await applyNutrientNameUpdates(map)

    // 1 should be modified
    expect(map.get('1').name).toMatch(/Modified/)
    // 2 should be deleted
    expect(map.has('2')).toBe(false)
    // 99 should be added
    expect(map.has('99')).toBe(true)
    expect(map.get('99').name).toBe('NewNutrient')
  })
})
