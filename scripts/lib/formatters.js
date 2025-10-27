#!/usr/bin/env node
/**
 * ESM formatters for CNF ETL output shapes.
 */

export function toCanonical(s) {
  const out = {
    FoodID: s.FoodID != null ? String(s.FoodID) : null,
    FoodCode: s.FoodCode || null,
    Description: s.FoodDescription || s.FoodDescriptionF || null,
    FoodGroupID: s.FoodGroupID != null ? String(s.FoodGroupID) : null,
    Measures: Array.isArray(s.Measures) ? s.Measures : [],
    FctGluc: s.Derived && s.Derived.FctGluc ? s.Derived.FctGluc.value : null,
    Nutrients: [],
    TagIndex: s.TagIndex || {},
    NutrientsByTag: s.NutrientsByTag || {}
  }
  if (s.NutrientsById && typeof s.NutrientsById === 'object') {
    for (const nid of Object.keys(s.NutrientsById)) {
      const n = s.NutrientsById[nid]
      out.Nutrients.push({
        NutrientID: nid,
        tag: n && n.tag != null ? n.tag : null,
        value: n && typeof n.value !== 'undefined' ? n.value : null,
        unit: n && n.unit != null ? n.unit : null,
        decimals: n && typeof n.decimals !== 'undefined' ? n.decimals : null,
        provenance: n && n.provenance ? n.provenance : null
      })
    }
  }
  return out
}

export function toFull(s) {
  if (s === null || typeof s !== 'object') return s
  return Object.assign({}, s)
}

export function toLegacy(s) {
  // Produce the legacy flattened schema (numeric nutrient ids as top-level keys)
  if (s === null || typeof s !== 'object') return s
  const out = {}
  if (typeof s.FoodID !== 'undefined') out.FoodID = s.FoodID
  if (typeof s.FoodCode !== 'undefined') out.FoodCode = s.FoodCode
  if (typeof s.FoodGroupID !== 'undefined') out.FoodGroupID = s.FoodGroupID
  if (typeof s.FoodSourceID !== 'undefined') out.FoodSourceID = s.FoodSourceID
  if (typeof s.FoodDescription !== 'undefined') out.FoodDescription = s.FoodDescription
  if (typeof s.FoodDescriptionF !== 'undefined') out.FoodDescriptionF = s.FoodDescriptionF
  if (typeof s.FoodGroupName !== 'undefined') out.FoodGroupName = s.FoodGroupName
  if (typeof s.FoodGroupNameF !== 'undefined') out.FoodGroupNameF = s.FoodGroupNameF

  // Pivot nutrient values: put numeric nutrient id keys at top-level with their numeric value
  if (s.NutrientsById && typeof s.NutrientsById === 'object') {
    for (const nid of Object.keys(s.NutrientsById)) {
      const n = s.NutrientsById[nid]
      out[nid] = n && typeof n.value !== 'undefined' ? n.value : null
    }
  }

  // FctGluc: prefer derived value if available
  if (s.Derived && s.Derived.FctGluc && typeof s.Derived.FctGluc.value !== 'undefined') {
    out.FctGluc = s.Derived.FctGluc.value
  } else if (typeof s.FctGluc !== 'undefined') {
    out.FctGluc = s.FctGluc
  }

  return out
}

export function extractFctGluc(item) {
  if (!item) return null
  if (item.Derived && item.Derived.FctGluc && typeof item.Derived.FctGluc.value !== 'undefined')
    return item.Derived.FctGluc.value
  if (typeof item.FctGluc !== 'undefined') return item.FctGluc
  return null
}
