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
